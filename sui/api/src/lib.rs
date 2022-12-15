#![allow(incomplete_features)]
#![feature(async_fn_in_trait)]

pub mod client;
pub mod schema;
pub mod server;

/// Functions for using `Coin<T>` with `rust_decimal::Decimal`.
pub mod coin_units {
    use color_eyre::eyre::{eyre, Result};
    use rust_decimal::prelude::*;
    use sui_sdk::json::SuiJsonValue;

    /// Return the "Decimal Unit" representation of the coin's value
    pub fn decimal(value: u64, decimals: u8) -> Result<Decimal> {
        Ok(Decimal::try_from_i128_with_scale(
            value as i128,
            decimals as u32,
        )?)
    }

    /// Return the "Atomic Unit" representation of the coin's value, i.e. mantissa
    pub fn atomic(value: Decimal) -> Result<u64> {
        Ok(u64::try_from(value.mantissa())?)
    }

    pub fn to_sui_json(value: Decimal) -> Result<SuiJsonValue> {
        println!("{:?}", value.mantissa());
        let value = u64::try_from(value.mantissa())?;
        let json_amount = serde_json::Value::Number(serde_json::Number::from(value));
        let sui_json_amount = SuiJsonValue::new(json_amount).map_err(|err| eyre!(err))?;
        Ok(sui_json_amount)
    }
}

/// Functions for parsing Sui types out of strings.
pub mod parse {
    use color_eyre::eyre::{bail, eyre, Result};
    use sui_sdk::rpc_types::SuiTypeTag;

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
}
