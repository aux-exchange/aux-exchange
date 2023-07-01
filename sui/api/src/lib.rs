#![allow(incomplete_features)]
#![feature(async_fn_in_trait)]
#![feature(is_some_and)]

use std::{fmt::Display, path::Path};

use color_eyre::eyre::{bail, eyre, Result};
use rust_decimal::prelude::*;
use serde::{de, Deserialize, Deserializer};
use sui_framework_build::compiled_package::BuildConfig;
use sui_keys::keystore::{AccountKeystore, Keystore};
use sui_sdk::{json::SuiJsonValue, rpc_types::SuiTypeTag, SuiClient};
use sui_types::{
    base_types::ObjectID,
    intent::Intent,
    messages::{ExecuteTransactionRequestType, Transaction},
};

pub mod client;
pub mod schema;
pub mod server;

/// Return the "Decimal Unit" representation of the coin's value
pub fn decimal_units(value: u64, decimals: u8) -> Result<Decimal> {
    Ok(Decimal::try_from_i128_with_scale(
        value as i128,
        decimals as u32,
    )?)
}

/// Return the "Atomic Unit" representation of the coin's value, i.e. mantissa
pub fn atomic_units(value: Decimal) -> Result<u64> {
    Ok(u64::try_from(value.mantissa())?)
}

pub fn de_from_str<'de, D, T>(deserializer: D) -> Result<T, D::Error>
where
    D: Deserializer<'de>,
    T: Display + FromStr,
    <T as FromStr>::Err: Display,
{
    let s = String::deserialize(deserializer)?;
    T::from_str(&s).map_err(de::Error::custom)
}

// FIXME remove and replace with Sui SDK
pub fn parse_type_args(type_: &str) -> Result<Vec<String>> {
    let err = || eyre!("Unable to parse type {}", type_);
    let start = type_.find('<').ok_or_else(err)?;
    let stop = type_.rfind('>').ok_or_else(err)?;
    let mut split = Vec::new();
    let mut parens = 0;
    let mut curr = String::new();
    for char in type_[start + 1..stop].chars() {
        match char {
            ',' if parens == 0 => {
                split.push(curr.trim().to_string());
                curr = String::new();
                continue;
            }
            '<' => {
                parens += 1;
            }
            '>' => {
                parens -= 1;
                if parens < 0 {
                    bail!(err());
                }
            }
            _ => {}
        }
        curr.push(char);
    }
    if !curr.is_empty() {
        split.push(curr.trim().to_string());
    }
    Ok(split)
}

pub fn parse_sui_type_tag(s: &str) -> Result<SuiTypeTag> {
    let type_tag = sui_types::parse_sui_type_tag(s).map_err(|err| eyre!(err))?;
    Ok(SuiTypeTag::from(type_tag))
}

pub async fn publish(sui_client: &SuiClient, keystore: &Keystore) -> ObjectID {
    let compiled_modules = BuildConfig::default()
        .build(Path::new("../contract").to_path_buf())
        .unwrap()
        .get_package_bytes();
    let sender = *keystore.addresses().last().unwrap();
    let tx = sui_client
        .transaction_builder()
        .publish(sender, compiled_modules, None, 30_000)
        .await
        .unwrap();

    let signer = *keystore.addresses().last().unwrap();
    let signature = keystore
        .sign_secure(&signer, &tx, Intent::default())
        .unwrap();
    let tx = sui_client
        .quorum_driver()
        .execute_transaction(
            Transaction::from_data(tx, Intent::default(), signature)
                .verify()
                .unwrap(),
            Some(ExecuteTransactionRequestType::WaitForLocalExecution),
        )
        .await
        .unwrap();
    *tx.effects
        .unwrap()
        .events
        .iter()
        .filter_map(|event| match event {
            sui_sdk::rpc_types::SuiEvent::MoveEvent {
                package_id, type_, ..
            } if type_.ends_with("PoolsCreated") => Some(package_id),
            _ => None,
        })
        .next()
        .unwrap()
}

pub fn decimal_to_sui_json(value: Decimal) -> Result<SuiJsonValue> {
    println!("decimal to sui json {:?}", value);
    let value = u64::try_from(atomic_units(value)?)?;
    println!("{:?}", value);
    let json_amount = serde_json::Value::Number(serde_json::Number::from(value));
    let sui_json_amount = SuiJsonValue::new(json_amount).map_err(|err| eyre!(err))?;
    Ok(sui_json_amount)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_type_args() {
        let s = "ComplicatedType<T, string::String, SomethingElse<U, S>>";
        assert_eq!(
            parse_type_args(s).unwrap(),
            vec![
                "T".to_string(),
                "string::String".to_string(),
                "SomethingElse<U, S>".to_string()
            ]
        );
    }
}
