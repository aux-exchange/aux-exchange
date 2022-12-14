/// GraphQL and Sui serdes
use std::str::FromStr;

use crate::{
    client::{AuxClient, PoolClient},
    parse::parse_sui_type_tag,
};
use async_graphql::{
    Context, EmptySubscription, InputObject, InputValueError, InputValueResult, Object, Scalar,
    ScalarType, Schema, SimpleObject, Value, ID,
};
use color_eyre::eyre::{eyre, Result};

use rust_decimal::Decimal;
use serde::Deserialize;

use sui_sdk::{
    rpc_types::{SuiCoinMetadata, SuiTypeTag},
    types::base_types::ObjectID,
};
use sui_types::{
    balance::Supply,
    base_types::{SequenceNumber, SuiAddress},
    id::UID,
};

////////////////////////////////////////////////////////////////////////////////
// GraphQL schemas
////////////////////////////////////////////////////////////////////////////////
pub type AuxSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn id(&self, ctx: &Context<'_>) -> String {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.package.to_string()
    }

    async fn coins(&self) -> Vec<Coin> {
        vec![Coins::sui(), Coins::usdc(), Coins::eth()]
    }

    async fn pool(&self, ctx: &Context<'_>, pool_input: PoolInput) -> Result<Pool> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.find_pool(&pool_input).await
    }

    async fn pools(&self, ctx: &Context<'_>) -> Result<Vec<Pool>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.pools().await
    }

    async fn summary_statistics(&self) -> SummaryStatistics {
        SummaryStatistics {
            pool_summary_statistics: PoolSummaryStatistics {
                tvl: 4982157.90012,
                volume_24h: 330681.72041,
                fee_24h: 330.681509,
                user_count_24h: 60.0,
                transaction_count_24h: 906.0,
                volume_1w: 4211711.834646,
                fee_1w: 4211.709057,
                user_count_1w: 605.0,
                transaction_count_1w: 12147.0,
            },
            market_summary_statistics: MarketSummaryStatistics {
                high_24h: 1245.42,
                low_24h: 1267.98,
                volume_24h: 20124901.21,
            },
        }
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_pool(
        &self,
        ctx: &Context<'_>,
        create_pool_input: CreatePoolInput,
    ) -> Result<Vec<u8>> {
        let _signer = SuiAddress::from_str(&create_pool_input.signer).map_err(|err| eyre!(err))?;
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let tx = aux_client
            .create_pool(
                SuiAddress::from_str(&create_pool_input.signer).map_err(|err| eyre!(err))?,
                &create_pool_input.pool_input,
                create_pool_input.fee_tier,
            )
            .await?;
        Ok(tx.to_bytes())
    }

    async fn add_liquidity(
        &self,
        ctx: &Context<'_>,
        add_liquidity_input: AddLiquidityInput,
    ) -> Result<Vec<u8>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let tx = aux_client
            .add_liquidity(
                SuiAddress::from_str(&add_liquidity_input.signer).map_err(|err| eyre!(err))?,
                &add_liquidity_input.pool_input,
                &add_liquidity_input.amounts,
            )
            .await?;
        Ok(tx.to_bytes())
    }

    async fn remove_liquidity(
        &self,
        ctx: &Context<'_>,
        remove_liquidity_input: RemoveLiquidityInput,
    ) -> Result<Vec<u8>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let tx = aux_client
            .remove_liquidity(
                SuiAddress::from_str(&remove_liquidity_input.signer).map_err(|err| eyre!(err))?,
                &remove_liquidity_input.pool_input,
                remove_liquidity_input.amount_lp,
            )
            .await?;
        Ok(tx.to_bytes())
    }

    async fn swap_exact_in(
        &self,
        ctx: &Context<'_>,
        swap_exact_in_input: SwapExactInInput,
    ) -> Result<Vec<u8>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let tx = aux_client
            .swap_exact_in(
                SuiAddress::from_str(&swap_exact_in_input.signer).map_err(|err| eyre!(err))?,
                &swap_exact_in_input.pool_input,
                &swap_exact_in_input.coin_type_in,
                &swap_exact_in_input.coin_type_out,
                swap_exact_in_input.amount_in,
                swap_exact_in_input.slippage,
            )
            .await?;
        Ok(tx.to_bytes())
    }

    async fn swap_exact_out(
        &self,
        ctx: &Context<'_>,
        swap_exact_out_input: SwapExactOutInput,
    ) -> Result<Vec<u8>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let tx = aux_client
            .swap_exact_out(
                SuiAddress::from_str(&swap_exact_out_input.signer).map_err(|err| eyre!(err))?,
                &swap_exact_out_input.pool_input,
                &swap_exact_out_input.coin_type_in,
                &swap_exact_out_input.coin_type_out,
                swap_exact_out_input.amount_out,
                swap_exact_out_input.slippage,
            )
            .await?;
        Ok(tx.to_bytes())
    }
}

#[derive(Clone, Copy, Debug)]
#[repr(transparent)]
pub struct Percent(pub Decimal);

#[Scalar]
impl ScalarType for Percent {
    fn parse(value: Value) -> InputValueResult<Self> {
        if let Value::String(value) = value {
            Ok(Percent(Decimal::from_str(&value)?))
        } else {
            Err(InputValueError::expected_type(value))
        }
    }

    fn to_value(&self) -> Value {
        Value::String(self.0.to_string())
    }
}

#[derive(Clone, Copy, Debug)]
#[repr(transparent)]
pub struct Milliseconds(u64);

#[Scalar]
impl ScalarType for Milliseconds {
    fn parse(value: Value) -> InputValueResult<Self> {
        if let Value::String(value) = value {
            Ok(Self(u64::from_str(&value)?))
        } else {
            Err(InputValueError::expected_type(value))
        }
    }

    fn to_value(&self) -> Value {
        Value::String(self.0.to_string())
    }
}

#[derive(Debug, Deserialize)]
#[serde(transparent)]
pub struct Coin(pub SuiCoinMetadata);

#[Object]
impl Coin {
    pub async fn id(&self) -> Option<String> {
        self.0.id.map(|id| id.to_hex_literal())
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

#[derive(Clone, Copy, Debug, PartialEq, Eq, async_graphql::Enum)]
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

#[derive(Clone, Copy, Debug, PartialEq, Eq, async_graphql::Enum)]
pub enum FeeTier {
    VeryStable,
    Stable,
    Most,
    Exotic,
}

impl FeeTier {
    pub fn to_bps(&self) -> u16 {
        match self {
            FeeTier::VeryStable => 1,
            FeeTier::Stable => 5,
            FeeTier::Most => 30,
            FeeTier::Exotic => 100,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, async_graphql::Enum)]
pub enum PriceRating {
    Red,
    Yellow,
    Green,
}

#[derive(Debug)]
pub struct Pool {
    pub id: UID,
    pub type_: String,
    pub version: SequenceNumber,
    pub coin_types: Vec<String>,
    pub curve: Curve,
    pub reserves: Vec<Decimal>,
    pub supply_lp: u64,
    pub fee_bps: u16,
}

#[Object]
impl Pool {
    pub async fn id(&self) -> String {
        self.id.id.bytes.to_hex_literal()
    }

    pub async fn type_(&self) -> &str {
        &self.type_
    }

    pub async fn version(&self) -> String {
        self.version.value().to_string()
    }

    pub async fn featured(&self) -> bool {
        // TODO
        false
    }

    pub async fn coins(&self) -> Vec<Coin> {
        self.coin_types
            .iter()
            .map(|coin_type| {
                if coin_type.ends_with("BTC>") {
                    Coins::btc()
                } else if coin_type.ends_with("ETH>") {
                    Coins::eth()
                } else if coin_type.ends_with("USDC>") {
                    Coins::usdc()
                } else {
                    Coins::sui()
                }
            })
            .collect()
    }

    pub async fn curve(&self) -> Curve {
        self.curve
    }

    pub async fn reserves(&self) -> &Vec<Decimal> {
        &self.reserves
    }

    pub async fn supply_lp(&self) -> u64 {
        self.supply_lp
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

    pub async fn fee(&self) -> f64 {
        self.fee_bps as f64 / 100f64
    }

    pub async fn swaps(
        &self,
        ctx: &Context<'_>,
        _address: Option<ID>,
        _first: Option<u64>,
        _offset: Option<u64>,
    ) -> Result<Vec<Swapped>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.swaps(&self.into()).await
    }

    pub async fn adds(
        &self,
        ctx: &Context<'_>,
        _address: Option<ID>,
        _first: Option<u64>,
        _offset: Option<u64>,
    ) -> Result<Vec<LiquidityAdded>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.adds(&self.into()).await
    }

    pub async fn removes(
        &self,
        ctx: &Context<'_>,
        _address: Option<ID>,
        _first: Option<u64>,
        _offset: Option<u64>,
    ) -> Result<Vec<LiquidityRemoved>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.removes(&self.into()).await
    }
}

#[derive(Debug, InputObject)]
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

    pub fn pool_type(&self, package: ObjectID) -> String {
        format!(
            "{}::{}::Pool<{}>",
            package.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
        )
    }

    pub fn lp_coin_type(&self, package: ObjectID) -> String {
        format!(
            "{}::{}::LP<{}>",
            package.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
        )
    }

    pub fn pools_created_type(&self, package: ObjectID) -> String {
        format!(
            "{}::{}::PoolsCreated",
            package.to_hex_literal(),
            self.curve.module_name(),
        )
    }

    pub fn pool_created_type(&self, package: ObjectID) -> String {
        self.pool_event_type("PoolCreated", package)
    }

    pub fn swapped_type(&self, package: ObjectID) -> String {
        self.pool_event_type("Swapped", package)
    }

    pub fn liquidity_added_type(&self, package: ObjectID) -> String {
        self.pool_event_type("LiquidityAdded", package)
    }

    pub fn liquidity_removed(&self, package: ObjectID) -> String {
        self.pool_event_type("LiquidityRemoved", package)
    }

    fn pool_event_type(&self, s: &str, package: ObjectID) -> String {
        format!(
            "{}::{}::{s}<{}>",
            package.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
        )
    }
}

impl From<&Pool> for PoolInput {
    fn from(value: &Pool) -> Self {
        PoolInput {
            coin_types: value.coin_types.clone(),
            curve: value.curve,
        }
    }
}

#[derive(InputObject)]
pub struct CreatePoolInput {
    pub signer: String, // FIXME deserializer for SuiAddress
    pub pool_input: PoolInput,
    pub fee_tier: FeeTier,
}

#[derive(InputObject)]
pub struct AddLiquidityInput {
    pub signer: String, // FIXME deserializer for SuiAddress
    pub pool_input: PoolInput,
    pub amounts: Vec<Decimal>,
}

#[derive(InputObject)]
pub struct RemoveLiquidityInput {
    pub signer: String, // FIXME deserializer for SuiAddress
    pub pool_input: PoolInput,
    pub amount_lp: Decimal,
}

#[derive(InputObject)]
pub struct SwapExactInInput {
    pub signer: String, // FIXME deserializer for SuiAddress
    pub pool_input: PoolInput,
    pub coin_type_in: String,
    pub coin_type_out: String,
    pub amount_in: Decimal,
    pub slippage: Percent,
}

#[derive(InputObject)]
pub struct SwapExactOutInput {
    pub signer: String, // FIXME deserializer for SuiAddress
    pub pool_input: PoolInput,
    pub coin_type_in: String,
    pub coin_type_out: String,
    pub amount_out: Decimal,
    pub slippage: Percent,
}

#[derive(Debug, SimpleObject)]
pub struct QuoteExactIn {
    pub expected_amount_out: Decimal,
    pub min_amount_out: Decimal,
    pub fee_amount: Decimal,
    pub fee_currency: String,
    pub fee_amount_usd: Option<Decimal>,
    pub price: Decimal,
    pub price_impact: Decimal,
    pub price_impact_rating: PriceRating,
    pub pyth_rating: Option<PriceRating>,
}

#[derive(Debug, SimpleObject)]
pub struct QuoteExactOut {
    pub expected_amount_in: Decimal,
    pub max_amount_in: Decimal,
    pub max_fee_amount: Decimal,
    pub fee_currency: String,
    pub max_fee_amount_usd: Option<Decimal>,
    pub price: Decimal,
    pub price_impact: Decimal,
    pub price_impact_rating: PriceRating,
    pub pyth_rating: Option<PriceRating>,
}

#[derive(Debug, SimpleObject)]
pub struct Swapped {
    pub coin_in: Coin,
    pub coin_out: Coin,
    pub amount_in: Decimal,
    pub amount_out: Decimal,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct LiquidityAdded {
    pub amounts_added: Vec<Decimal>,
    pub amount_minted_lp: Decimal,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct LiquidityRemoved {
    pub amounts_removed: Vec<Decimal>,
    pub amount_burned_lp: Decimal,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct SummaryStatistics {
    pub pool_summary_statistics: PoolSummaryStatistics,
    pub market_summary_statistics: MarketSummaryStatistics,
}

#[derive(Debug, SimpleObject)]
pub struct PoolSummaryStatistics {
    pub tvl: f64,
    pub volume_24h: f64,
    pub fee_24h: f64,
    pub user_count_24h: f64,
    pub transaction_count_24h: f64,
    pub volume_1w: f64,
    pub fee_1w: f64,
    pub user_count_1w: f64,
    pub transaction_count_1w: f64,
}

#[derive(Debug, SimpleObject)]
pub struct MarketSummaryStatistics {
    pub high_24h: f64,
    pub low_24h: f64,
    pub volume_24h: f64,
}

pub struct Coins;
impl Coins {
    // TODO remove once `coin_metadata` is implemented
    pub fn btc() -> Coin {
        Coin(SuiCoinMetadata {
            id: None,
            decimals: 8,
            symbol: "BTC".to_string(),
            name: "Bitcoin".to_string(),
            description: "Test Bitcoin".to_string(),
            icon_url: None,
        })
    }

    pub fn eth() -> Coin {
        Coin(SuiCoinMetadata {
            id: None,
            decimals: 8,
            symbol: "ETH".to_string(),
            name: "Ether".to_string(),
            description: "Test Ether".to_string(),
            icon_url: None,
        })
    }

    pub fn sui() -> Coin {
        Coin(SuiCoinMetadata {
            id: None,
            decimals: 9,
            symbol: "SUI".to_string(),
            name: "Sui".to_string(),
            description: "".to_string(),
            icon_url: None,
        })
    }
    pub fn usdc() -> Coin {
        Coin(SuiCoinMetadata {
            id: None,
            decimals: 6,
            symbol: "USDC".to_string(),
            name: "USD Coin".to_string(),
            description: "Test USD Coin".to_string(),
            icon_url: None,
        })
    }
}

/// Sui serde
#[derive(Debug, Deserialize)]
pub struct SuiConstantProductPool {
    pub id: UID,
    pub reserve_x: sui_types::coin::Coin,
    pub reserve_y: sui_types::coin::Coin,
    pub supply_lp: Supply,
    pub fee_bps: u64,
}

////////////////////////////////////////////////////////////////////////////////
// Sui schemas
////////////////////////////////////////////////////////////////////////////////

#[derive(Debug, Deserialize)]
pub struct SuiObject<T> {
    pub id: ObjectID,
    pub type_: String,
    pub has_public_transfer: bool,
    pub version: SequenceNumber,
    pub data: T,
}

// #[derive(Debug, Deserialize)]
// pub struct SuiEvent<T> {
//     pub type_: String,
// }

#[derive(Debug, Deserialize)]
pub struct SuiTypeName {
    pub name: String
}

#[derive(Debug, Deserialize)]
pub struct SuiConstantProductSwapped {
    pub coin_type_in: SuiTypeName,
    pub coin_type_out: SuiTypeName,
    pub amount_in: u64,
    pub amount_out: u64,
}

/// Sui serde
#[derive(Debug, Deserialize)]
pub struct SuiConstantProductLiquidityAdded {
    pub amount_added_x: u64,
    pub amount_added_y: u64,
    pub amount_minted_lp: u64,
}

/// Sui serde
#[derive(Debug, Deserialize)]
pub struct SuiConstantProductLiquidityRemoved {
    pub amount_removed_x: u64,
    pub amount_removed_y: u64,
    pub amount_burned_lp: u64,
}
