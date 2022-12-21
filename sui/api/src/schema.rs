/// GraphQL and Sui serdes
use std::str::FromStr;

use crate::{
    client::{AuxClient, PoolClient},
    de_from_str, parse_sui_type_tag,
};
use async_graphql::{
    Context, EmptyMutation, EmptySubscription, InputObject, InputValueError, InputValueResult,
    Object, Scalar, ScalarType, Schema, SimpleObject, Value, ID,
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
    event::EventID,
    id::UID,
};

////////////////////////////////////////////////////////////////////////////////
// GraphQL schema
////////////////////////////////////////////////////////////////////////////////

pub type AuxSchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

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

    async fn summary_statistics(
        &self,
        ctx: &Context<'_>,
        pool_input: PoolInput,
    ) -> Result<SummaryStatistics> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let summary_statistics = SummaryStatistics {
            pool_summary_statistics: aux_client.summary_statistics(&pool_input).await?,
            // FIXME
            market_summary_statistics: MarketSummaryStatistics {
                high_24h: 1245.42,
                low_24h: 1267.98,
                volume_24h: 20124901.21,
            },
        };
        Ok(summary_statistics)
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
    VeryStable = 1,
    Stable = 5,
    Most = 30,
    Exotic = 100,
}

impl FeeTier {
    pub fn to_bps(&self) -> u16 {
        match self {
            FeeTier::VeryStable => FeeTier::VeryStable as u16,
            FeeTier::Stable => FeeTier::Stable as u16,
            FeeTier::Most => FeeTier::Most as u16,
            FeeTier::Exotic => FeeTier::Exotic as u16,
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

    pub async fn fee(&self) -> Percent {
        Percent(Decimal::new(self.fee_bps as i64, 3))
    }

    pub async fn price(
        &self,
        ctx: &Context<'_>,
        coin_type_in: String,
        coin_type_out: String,
        amount_in: Decimal,
    ) -> Result<Decimal> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client
            .price(&self.into(), &coin_type_in, &coin_type_out, amount_in)
            .await
    }

    pub async fn quote_exact_in(
        &self,
        ctx: &Context<'_>,
        quote_exact_in_input: QuoteExactInInput,
    ) -> Result<QuoteExactIn> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client
            .quote_exact_in(
                &quote_exact_in_input.pool_input,
                &quote_exact_in_input.coin_type_in,
                &quote_exact_in_input.coin_type_out,
                quote_exact_in_input.amount_in,
                quote_exact_in_input.slippage,
            )
            .await
    }

    pub async fn quote_exact_out(
        &self,
        ctx: &Context<'_>,
        quote_exact_out_input: QuoteExactOutInput,
    ) -> Result<QuoteExactIn> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client
            .quote_exact_in(
                &quote_exact_out_input.pool_input,
                &quote_exact_out_input.coin_type_in,
                &quote_exact_out_input.coin_type_out,
                quote_exact_out_input.amount_out,
                quote_exact_out_input.slippage,
            )
            .await
    }

    pub async fn position(&self, ctx: &Context<'_>, sender: ID) -> Result<Position> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client
            .position(
                &self.into(),
                SuiAddress::from_str(&sender).map_err(|err| eyre!(err))?,
            )
            .await
    }

    pub async fn swaps(
        &self,
        ctx: &Context<'_>,
        sender: Option<ID>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<Swapped>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let sender = sender
            .map(|sender| SuiAddress::from_str(&sender))
            .transpose()
            .map_err(|err| eyre!(err))?;
        aux_client.swaps(&self.into(), sender, first, offset).await
    }

    pub async fn adds(
        &self,
        ctx: &Context<'_>,
        sender: Option<ID>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityAdded>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let sender = sender
            .map(|sender| SuiAddress::from_str(&sender))
            .transpose()
            .map_err(|err| eyre!(err))?;
        aux_client.adds(&self.into(), sender, first, offset).await
    }

    pub async fn removes(
        &self,
        ctx: &Context<'_>,
        sender: Option<ID>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityRemoved>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        let sender = sender
            .map(|sender| SuiAddress::from_str(&sender))
            .transpose()
            .map_err(|err| eyre!(err))?;
        aux_client
            .removes(&self.into(), sender, first, offset)
            .await
    }

    pub async fn summary_statistics(&self, ctx: &Context<'_>) -> Result<PoolSummaryStatistics> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.summary_statistics(&self.into()).await
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

    pub fn liquidity_removed_type(&self, package: ObjectID) -> String {
        self.pool_event_type("LiquidityRemoved", package)
    }

    pub fn pool_event_type(&self, s: &str, package: ObjectID) -> String {
        format!(
            "{}::{}::{s}<{}>",
            package.to_hex_literal(),
            self.curve.module_name(),
            self.coin_types.join(", "),
        )
    }

    pub fn indices(&self, coin_type_in: &str, coin_type_out: &str) -> Result<(usize, usize)> {
        let i = self
            .coin_types
            .iter()
            .position(|coin_type| coin_type == coin_type_in);
        let j = self
            .coin_types
            .iter()
            .position(|coin_type| coin_type == coin_type_out);
        i.zip(j).ok_or_else(|| {
            eyre!(
                "Failed to find {} {} in {:?}",
                coin_type_in,
                coin_type_out,
                self.coin_types
            )
        })
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
    pub sender: ID,
    pub pool_input: PoolInput,
    pub fee_tier: FeeTier,
}

#[derive(InputObject)]
pub struct AddLiquidityInput {
    pub sender: ID,
    pub pool_input: PoolInput,
    pub amounts: Vec<Decimal>,
}

#[derive(InputObject)]
pub struct RemoveLiquidityInput {
    pub sender: ID,
    pub pool_input: PoolInput,
    pub amount_lp: Decimal,
}

#[derive(InputObject)]
pub struct SwapExactInInput {
    pub sender: ID,
    pub pool_input: PoolInput,
    pub coin_type_in: String,
    pub coin_type_out: String,
    pub amount_in: Decimal,
    pub slippage: Percent,
}

#[derive(InputObject)]
pub struct SwapExactOutInput {
    pub sender: ID,
    pub pool_input: PoolInput,
    pub coin_type_in: String,
    pub coin_type_out: String,
    pub amount_out: Decimal,
    pub slippage: Percent,
}

#[derive(InputObject)]
pub struct QuoteExactInInput {
    pub pool_input: PoolInput,
    pub coin_type_in: String,
    pub coin_type_out: String,
    pub amount_in: Decimal,
    pub slippage: Percent,
}

#[derive(InputObject)]
pub struct QuoteExactOutInput {
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
pub struct Position {
    pub coins: Vec<Coin>,
    pub coin_lp: Coin,
    pub amounts: Vec<Decimal>,
    pub amount_lp: Decimal,
    pub share: Percent,
}

#[derive(Debug, SimpleObject)]
pub struct Swapped {
    pub coin_in: Coin,
    pub coin_out: Coin,
    pub amount_in: Decimal,
    pub amount_out: Decimal,
    pub sender: ID,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct LiquidityAdded {
    pub amounts_added: Vec<Decimal>,
    pub amount_minted_lp: Decimal,
    pub sender: ID,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct LiquidityRemoved {
    pub amounts_removed: Vec<Decimal>,
    pub amount_burned_lp: Decimal,
    pub sender: ID,
    pub timestamp: u64,
}

#[derive(Debug, SimpleObject)]
pub struct PoolSummaryStatistics {
    pub tvl: f64,
    #[graphql(name = "volume24h")]
    pub volume_24h: f64,
    #[graphql(name = "fee24h")]
    pub fee_24h: f64,
    #[graphql(name = "userCount24h")]
    pub user_count_24h: f64,
    #[graphql(name = "transactionCount24h")]
    pub transaction_count_24h: f64,
    #[graphql(name = "volume1w")]
    pub volume_1w: f64,
    #[graphql(name = "fee1w")]
    pub fee_1w: f64,
    #[graphql(name = "userCount1w")]
    pub user_count_1w: f64,
    #[graphql(name = "transactionCount1w")]
    pub transaction_count_1w: f64,
}

#[derive(Debug, SimpleObject)]
pub struct MarketSummaryStatistics {
    pub high_24h: f64,
    pub low_24h: f64,
    pub volume_24h: f64,
}
#[derive(Debug, SimpleObject)]
pub struct SummaryStatistics {
    pub pool_summary_statistics: PoolSummaryStatistics,
    pub market_summary_statistics: MarketSummaryStatistics,
}

pub struct Coins;
// TODO remove once `coin_metadata` is implemented
impl Coins {
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

////////////////////////////////////////////////////////////////////////////////
// Sui schema
////////////////////////////////////////////////////////////////////////////////

#[derive(Debug, Deserialize)]
pub struct SuiObject<T> {
    pub id: ObjectID,
    pub type_: String,
    pub version: SequenceNumber,
    pub data: T,
}

#[derive(Debug, Deserialize)]
pub struct SuiEvent<T> {
    pub id: EventID,
    pub type_: String,
    pub package: ObjectID,
    pub module: String,
    pub timestamp: u64,
    pub sender: SuiAddress,
    pub data: T,
}

#[derive(Debug, Deserialize)]
pub struct SuiTypeName {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct SuiConstantProductPool {
    pub id: UID,
    pub reserve_x: sui_types::coin::Coin,
    pub reserve_y: sui_types::coin::Coin,
    pub supply_lp: Supply,
    pub fee_bps: u64,
}

#[derive(Debug, Deserialize)]
pub struct SuiConstantProductSwapped {
    pub coin_type_in: SuiTypeName,
    pub coin_type_out: SuiTypeName,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_in: u64,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_out: u64,
}

#[derive(Debug, Deserialize)]
pub struct SuiConstantProductLiquidityAdded {
    #[serde(deserialize_with = "de_from_str")]
    pub amount_added_x: u64,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_added_y: u64,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_minted_lp: u64,
}

#[derive(Debug, Deserialize)]
pub struct SuiConstantProductLiquidityRemoved {
    #[serde(deserialize_with = "de_from_str")]
    pub amount_removed_x: u64,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_removed_y: u64,
    #[serde(deserialize_with = "de_from_str")]
    pub amount_burned_lp: u64,
}
