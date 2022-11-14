use async_graphql::{Enum, InputObject, Object};
use color_eyre::eyre::{eyre, Result};
use serde::{de::DeserializeOwned, Deserialize};

use sui_types::{balance::Supply, base_types::SequenceNumber, coin::Coin, id::UID};
// use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
use sui_sdk::{
    rpc_types::{SuiCoinMetadata, SuiTypeTag},
    types::base_types::ObjectID,
};

use crate::client::{parse_sui_type_tag, AuxClient};

pub struct CoinMetadata(SuiCoinMetadata);
#[Object]
impl CoinMetadata {
    pub async fn id(&self) -> Result<String> {
        let id = self
            .0
            .id
            .ok_or(eyre!("Missing id on CoinMetadata"))?
            .to_hex_literal();
        Ok(id)
    }

    pub async fn decimals(&self) -> u8 {
        self.0.decimals
    }

    pub async fn name(&self) -> &str {
        &self.0.name
    }

    pub async fn symbol(&self) -> &str {
        &self.0.symbol
    }

    pub async fn description(&self) -> &str {
        &self.0.description
    }

    pub async fn icon_url(&self) -> Option<&String> {
        self.0.icon_url.as_ref()
    }
}

#[derive(Debug, Deserialize)]
pub struct ConstantProductPool {
    pub id: UID,
    pub reserve_x: Coin,
    pub reserve_y: Coin,
    pub supply_lp: Supply,
    pub fee_bps: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Enum)]
pub enum Curve {
    ConstantProduct,
    StableSwap,
}
impl Curve {
    pub fn module_name(&self) -> &str {
        match self {
            crate::schema::Curve::ConstantProduct => "constant_product",
            crate::schema::Curve::StableSwap => "stable_swap",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Enum)]
pub enum FeeTier {
    VeryStable,
    Stable,
    Most,
    Exotic,
}

#[derive(Debug)]
pub struct Pool {
    pub id: UID,
    pub type_: String,
    pub version: SequenceNumber,
    pub coin_types: Vec<String>,
    pub curve: Curve,
    pub reserves: Vec<Coin>,
    pub supply_lp: Supply,
    pub fee_bps: u64,
}

#[Object]
impl Pool {
    pub async fn id(&self) -> String {
        self.id.id.bytes.to_hex_literal()
    }

    pub async fn type_(&self) -> &str {
        &self.type_
    }

    pub async fn version(&self) -> u64 {
        self.version.value()
    }

    pub async fn coin_types(&self) -> Vec<&str> {
        self.coin_types.iter().map(AsRef::as_ref).collect()
    }

    pub async fn curve(&self) -> Curve {
        self.curve
    }

    pub async fn amounts(&self) -> Vec<u64> {
        self.reserves
            .iter()
            .map(|coin| coin.balance.value())
            .collect()
    }

    pub async fn amount_lp(&self) -> u64 {
        self.supply_lp.value
    }

    pub async fn fee_tier(&self) -> Option<FeeTier> {
        match self.fee_bps {
            1 => Some(FeeTier::VeryStable),
            5 => Some(FeeTier::Stable),
            30 => Some(FeeTier::Most),
            100 => Some(FeeTier::Exotic),
            _ => None,
        }
    }

    pub async fn fee_percent(&self) -> f64 {
        self.fee_bps as f64 / 100f64
    }

    pub async fn swaps(&self, sender: SuiA)
}

#[derive(InputObject)]
pub struct PoolInput {
    pub coin_types: Vec<String>,
    pub curve: Curve,
}
impl PoolInput {
    pub fn coin_type_tags(&self) -> Result<Vec<SuiTypeTag>> {
        self.coin_types
            .iter()
            .map(|s| parse_sui_type_tag(s))
            .collect()
    }

    pub fn pool_type(&self, package_object_id: ObjectID) -> String {
        format!(
            "{}::{}::Pool<{}, {}::constant_product_entry::WITNESS>",
            package_object_id.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
            package_object_id.to_hex_literal(),
        )
    }

    pub fn pool_created_type(&self, package_object_id: ObjectID) -> String {
        format!(
            "{}::{}::PoolCreated<{}>",
            package_object_id.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
        )
    }
}

struct Swapped {

}

// struct LiquidityAdded {

// }

// struct LiquidityRemoved {

// }
