use async_graphql::ID;
use color_eyre::eyre::{bail, eyre, Result, WrapErr};
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;
use serde::de::DeserializeOwned;
use std::str::FromStr;
use sui_json_rpc::api::QUERY_MAX_RESULT_LIMIT;
use sui_keys::keystore::{AccountKeystore, Keystore};
use sui_sdk::rpc_types::{SuiData, SuiEvent};
use sui_sdk::{
    json::SuiJsonValue,
    rpc_types::{SuiCoinMetadata, SuiObjectInfo},
    types::{
        base_types::{ObjectID, SuiAddress},
        messages::Transaction,
    },
    SuiClient, TransactionExecutionResult,
};
use sui_types::crypto::Signature;
use sui_types::intent::Intent;
use sui_types::{
    coin::Coin,
    event::BalanceChangeType,
    messages::{ExecuteTransactionRequestType, TransactionData},
    query::EventQuery,
};

use crate::schema::{
    Coins, Curve, FeeTier, LiquidityAdded, LiquidityRemoved, Percent, Pool, PoolInput,
    PoolSummaryStatistics, Position, PriceRating, QuoteExactIn, QuoteExactOut,
    SuiConstantProductLiquidityAdded, SuiConstantProductLiquidityRemoved, SuiConstantProductPool,
    SuiConstantProductSwapped, SuiObject, Swapped,
};
use crate::{decimal_to_sui_json, decimal_units, parse_sui_type_tag, parse_type_args};

pub struct AuxClient {
    pub sui_client: SuiClient,
    pub package: ObjectID,
}

impl AuxClient {
    pub async fn get_object<T: DeserializeOwned>(&self, id: ObjectID) -> Result<SuiObject<T>> {
        let sui_object_data = self
            .sui_client
            .read_api()
            .get_object(id)
            .await
            .map_err(|err| eyre!(err))?;
        let sui_object = sui_object_data
            .object()?
            .data
            .try_as_move()
            .ok_or(eyre!("Object was unexpected package"))?
            .to_owned();
        let data: T = sui_object.deserialize().map_err(|err| eyre!(err))?;
        let object = SuiObject {
            id,
            type_: sui_object.type_,
            version: sui_object.version,
            data,
        };
        Ok(object)
    }

    pub async fn filter_objects_by_type(
        &self,
        address: SuiAddress,
        type_: &str,
    ) -> Result<Vec<SuiObjectInfo>> {
        let objects = self
            .sui_client
            .read_api()
            .get_objects_owned_by_address(address)
            .await
            .map_err(|err| eyre!(err))?;
        let objects = objects
            .iter()
            .filter(|object| object.type_ == type_)
            .map(|object| object.to_owned())
            .collect();
        Ok(objects)
    }

    pub async fn find_object_by_type(
        &self,
        address: SuiAddress,
        type_: &str,
    ) -> Result<SuiObjectInfo> {
        let objects = self.filter_objects_by_type(address, type_).await?;
        let object =
            objects
                .first()
                .ok_or(eyre!("Failed to find {} in {}'s objects.", type_, address))?;
        Ok(object.to_owned())
    }

    pub async fn sign_and_execute(
        &self,
        keystore: &Keystore,
        tx: TransactionData,
    ) -> Result<TransactionExecutionResult> {
        let signer = *keystore
            .addresses()
            .last()
            .ok_or(eyre!("Keystore is empty."))?;
        let signature = keystore.sign_secure(&signer, &tx, Intent::default())?;
        self.execute(tx, signature).await
    }

    pub async fn execute(
        &self,
        tx: TransactionData,
        signature: Signature,
    ) -> Result<TransactionExecutionResult> {
        self.sui_client
            .quorum_driver()
            .execute_transaction(
                Transaction::from_data(tx, Intent::default(), signature).verify()?,
                Some(ExecuteTransactionRequestType::WaitForLocalExecution),
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn move_events<T: DeserializeOwned>(
        &self,
        type_: String,
        limit: Option<usize>,
    ) -> Result<Vec<crate::schema::SuiEvent<T>>> {
        let raw_events = self
            .sui_client
            .event_api()
            .get_events(EventQuery::MoveEvent(type_), None, limit, None)
            .await
            .map_err(|err| eyre!(err))?;

        let mut events = Vec::new();
        for raw_event in raw_events.data {
            if let SuiEvent::MoveEvent {
                package_id,
                transaction_module,
                sender,
                type_,
                fields: Some(fields),
                bcs: _,
            } = raw_event.event
            {
                let event = crate::schema::SuiEvent {
                    package: package_id,
                    module: transaction_module,
                    sender,
                    type_,
                    timestamp: raw_event.timestamp,
                    id: raw_event.id,
                    data: serde_json::from_value(fields.to_json_value()?)?,
                };
                events.push(event);
            } else {
                bail!(eyre!(
                    "Unable to deserialize {raw_event:?}. Expected MoveEvent {{ fields: Some(...), .. }}."
                ))
            };
        }
        Ok(events)
    }
}

pub trait CoinClient {
    fn coin_metadata(&self, coin_type: &str) -> crate::schema::Coin;

    /// Gets the object id of a coin with `coin_type` from signer's inventory.
    ///
    /// If multiple coins exist, returns the first one found.
    async fn find_first_coin(
        &self,
        address: SuiAddress,
        coin_type: &str,
    ) -> Result<SuiObject<Coin>>;

    /// Gets the object id of a coin with `coin_type` from signer's inventory.
    ///
    /// If multiple coins exist, returns the largest one found.
    async fn find_largest_coin(
        &self,
        address: SuiAddress,
        coin_type: &str,
    ) -> Result<SuiObject<Coin>>;

    async fn sum_coins(&self, address: SuiAddress, coin_type: &str) -> Result<u128>;

    async fn split_coin(
        &self,
        signer: SuiAddress,
        keystore: &Keystore,
        coin_type: &str,
        split_amounts: &[u64],
    ) -> Result<SuiObject<Coin>>;

    async fn mint_and_transfer(
        &self,
        signer: SuiAddress,
        coin_type: &str,
        amount: u64,
        recipient: SuiAddress,
    ) -> Result<TransactionData>;
}

impl CoinClient for AuxClient {
    fn coin_metadata(&self, coin_type: &str) -> crate::schema::Coin {
        let coins = Coins(self.package);
        if coin_type.ends_with("BTC") {
            coins.btc()
        } else if coin_type.ends_with("ETH") {
            coins.eth()
        } else if coin_type.ends_with("SUI") {
            coins.sui()
        } else if coin_type.ends_with("USDC") {
            coins.usdc()
        } else {
            panic!("Unhandled coin_type {coin_type}")
        }
    }

    async fn find_first_coin(
        &self,
        address: SuiAddress,
        coin_type: &str,
    ) -> Result<SuiObject<Coin>> {
        let object = self
            .find_object_by_type(address, &format!("0x2::coin::Coin<{coin_type}>"))
            .await?;
        let coin = self.get_object::<Coin>(object.object_id).await?;
        Ok(coin)
    }

    async fn find_largest_coin(
        &self,
        address: SuiAddress,
        coin_type: &str,
    ) -> Result<SuiObject<Coin>> {
        let coin_objects = self
            .filter_objects_by_type(address, &format!("0x2::coin::Coin<{coin_type}>"))
            .await?;
        let mut futs = Vec::new();
        for coin_object in coin_objects {
            let coin_id = coin_object.object_id;
            futs.push(self.get_object::<Coin>(coin_id));
        }
        let coins: Result<Vec<SuiObject<Coin>>> =
            futures::future::join_all(futs).await.into_iter().collect();
        let coins = coins?;
        let coin = coins
            .into_iter()
            .max_by_key(|coin| coin.data.balance.value())
            .ok_or_else(|| eyre!("{} not found in {}'s inventory", coin_type, address))?;
        Ok(coin)
    }

    async fn sum_coins(&self, address: SuiAddress, coin_type: &str) -> Result<u128> {
        let coin_objects = self
            .filter_objects_by_type(address, &format!("0x2::coin::Coin<{coin_type}>"))
            .await?;
        let mut futs = Vec::new();
        for coin_object in coin_objects {
            let coin_id = coin_object.object_id;
            futs.push(self.get_object::<Coin>(coin_id));
        }
        let coins: Result<Vec<SuiObject<Coin>>> =
            futures::future::join_all(futs).await.into_iter().collect();
        let sum = coins?
            .into_iter()
            .map(|coin| coin.data.balance.value() as u128)
            .sum();
        Ok(sum)
    }

    async fn split_coin(
        &self,
        signer: SuiAddress,
        keystore: &Keystore,
        coin_type: &str,
        split_amounts: &[u64],
    ) -> Result<SuiObject<Coin>> {
        let coin_object_id = self.find_largest_coin(signer, coin_type).await?.id;
        let split_coin_tx = self
            .sui_client
            .transaction_builder()
            .split_coin(signer, coin_object_id, split_amounts.to_vec(), None, 1000)
            .await
            .map_err(|err| eyre!(err))?;
        let split_coin_tx = self.sign_and_execute(keystore, split_coin_tx).await?;
        let events = split_coin_tx
            .effects
            .ok_or(eyre!("SplitCoin missing effects"))?
            .events;
        let split_coin_id = events
            .iter()
            .filter_map(|event| match event {
                sui_sdk::rpc_types::SuiEvent::CoinBalanceChange {
                    change_type: BalanceChangeType::Receive,
                    coin_object_id,
                    ..
                } => Some(coin_object_id),
                _ => None,
            })
            .next()
            .unwrap();
        self.get_object::<Coin>(*split_coin_id).await
    }

    async fn mint_and_transfer(
        &self,
        signer: SuiAddress,
        coin_type: &str,
        amount: u64,
        recipient: SuiAddress,
    ) -> Result<TransactionData> {
        let treasury_cap = self
            .find_object_by_type(signer, &format!("0x2::coin::TreasuryCap<{coin_type}>"))
            .await?
            .object_id;

        self.sui_client
            .transaction_builder()
            .move_call(
                signer,
                ObjectID::from_str("0x0000000000000000000000000000000000000002")
                    .map_err(|err| eyre!(err))?,
                "coin",
                "mint_and_transfer",
                vec![parse_sui_type_tag(coin_type)?],
                vec![
                    SuiJsonValue::from_object_id(treasury_cap),
                    SuiJsonValue::new(serde_json::to_value(amount)?).map_err(|err| eyre!(err))?,
                    SuiJsonValue::new(serde_json::to_value(recipient)?)
                        .map_err(|err| eyre!(err))?,
                ],
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }
}

pub trait PoolClient {
    async fn pool(&self, id: ObjectID) -> Result<Pool>;

    async fn pools(&self) -> Result<Vec<Pool>>;

    async fn find_pool_id(&self, pool_input: &PoolInput) -> Result<ObjectID>;

    async fn find_pool(&self, pool_input: &PoolInput) -> Result<Pool>;

    async fn price(
        &self,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
    ) -> Result<Decimal>;

    async fn quote_exact_in(
        &self,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
        slippage: Percent,
    ) -> Result<QuoteExactIn>;

    async fn quote_exact_out(
        &self,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_out: Decimal,
        slippage: Percent,
    ) -> Result<QuoteExactOut>;

    async fn position(&self, pool_input: &PoolInput, sender: SuiAddress) -> Result<Position>;

    async fn swaps(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<Swapped>>;

    async fn adds(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityAdded>>;

    async fn removes(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityRemoved>>;

    async fn summary_statistics(&self, pool_input: &PoolInput) -> Result<PoolSummaryStatistics>;

    async fn create_pool(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        fee_tier: FeeTier,
    ) -> Result<TransactionData>;

    /// Add liquidity to the specified pool
    ///
    /// `amounts` corresponds to the order of coin_types specified in `pool_input`
    async fn add_liquidity(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        amounts: &[Decimal],
    ) -> Result<TransactionData>;

    async fn remove_liquidity(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        amount_lp: Decimal,
    ) -> Result<TransactionData>;

    async fn swap_exact_in(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
        slippage: Percent,
    ) -> Result<TransactionData>;

    async fn swap_exact_out(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_out: Decimal,
        slippage: Percent,
    ) -> Result<TransactionData>;
}

impl PoolClient for AuxClient {
    async fn pool(&self, id: ObjectID) -> Result<Pool> {
        let object: SuiObject<SuiConstantProductPool> = self.get_object(id).await?;
        let cp = object.data;
        let coin_types = parse_type_args(&object.type_)?;
        let mut reserves = Vec::new();
        reserves.push(decimal_units(
            cp.reserve_x.balance.value(),
            self.coin_metadata(&coin_types[0]).decimals,
        )?);
        reserves.push(decimal_units(
            cp.reserve_y.balance.value(),
            self.coin_metadata(&coin_types[1]).decimals,
        )?);
        let pool = Pool {
            type_: object.type_,
            version: object.version,
            id: cp.id,
            coin_types,
            curve: Curve::ConstantProduct,
            reserves,
            supply_lp: cp.supply_lp.value,
            fee_bps: cp.fee_bps as u16,
        };
        Ok(pool)
    }

    async fn pools(&self) -> Result<Vec<Pool>> {
        // FIXME instead of parsing PoolCreated<X, Y> events by the prefix `PoolCreated`,
        // query the `Pools` vec_set
        // and parse out the TypeNames
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveModule {
                    package: self.package,
                    module: "constant_product".to_string(),
                },
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        let pool_ids: std::result::Result<Vec<_>, _> = events
            .data
            .into_iter()
            .filter_map(|event| {
                let cursor = serde_json::to_value(event).ok();
                let move_event = cursor
                    .as_ref()
                    .and_then(|c| c.get("event"))
                    .and_then(|c| c.get("moveEvent"));

                move_event
                    .and_then(|c| c.get("type"))
                    .and_then(|type_| type_.as_str())
                    .filter(|type_| type_.contains("PoolCreated"))
                    .and_then(|_| {
                        move_event
                            .and_then(|c| c.get("fields"))
                            .and_then(|c| c.get("id"))
                            .and_then(|id| id.as_str())
                            .map(|id| id.to_string())
                    })
            })
            .map(|pool_id| ObjectID::from_str(&pool_id))
            .collect();

        let err = format!("Failed to deserialize pools {pool_ids:?}");
        let pools: Result<Vec<Pool>> =
            futures::future::join_all(pool_ids?.into_iter().map(|pool_id| self.pool(pool_id)))
                .await
                .into_iter()
                .collect();
        pools.context(err)
    }

    async fn find_pool_id(&self, pool_input: &PoolInput) -> Result<ObjectID> {
        let pool_created_type = pool_input.pool_created_type(self.package);

        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveEvent(pool_created_type.clone()),
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        let pool_created = events
            .data
            .first()
            .ok_or(eyre!("{} not found", pool_created_type))?;

        let cursor = serde_json::to_value(pool_created)?;
        let pool_id: &str = cursor
            .get("event")
            .and_then(|c| c.get("moveEvent"))
            .and_then(|c| c.get("fields"))
            .and_then(|c| c.get("id"))
            .and_then(|c| c.as_str())
            .ok_or(eyre!("Unable to parse PoolCreated event"))?;
        let pool_id = ObjectID::from_str(pool_id)?;
        Ok(pool_id)
    }

    async fn find_pool(&self, pool_input: &PoolInput) -> Result<Pool> {
        let id = self.find_pool_id(pool_input).await?;
        self.pool(id).await
    }

    async fn price(
        &self,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
    ) -> Result<Decimal> {
        let pool = self.find_pool(pool_input).await?;
        let (i, j) = pool_input.indices(&coin_type_in, &coin_type_out)?;
        Ok((pool.reserves[j] / pool.reserves[i]) * amount_in)
    }

    async fn quote_exact_in(
        &self,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
        slippage: Percent,
    ) -> Result<QuoteExactIn> {
        let pool = self.find_pool(pool_input).await?;
        let (i, j) = pool_input.indices(coin_type_in, coin_type_out)?;
        let (reserves_in, reserves_out) = (pool.reserves[i], pool.reserves[j]);

        println!("{reserves_in:?} {reserves_out:?}");
        let fee_percent = Decimal::new(pool.fee_bps as i64, 3).round_dp(2);
        let amount_in_with_fee = amount_in * (dec!(1) - fee_percent); // TODO
        let expected_amount_out = (amount_in_with_fee * reserves_out)
            .checked_div(reserves_in + amount_in_with_fee)
            .unwrap_or(dec!(0));
        let min_amount_out = expected_amount_out * (dec!(1) - slippage.0 / dec!(100));
        let fee_amount = amount_in * fee_percent;
        let instantaneous_amount_out =
            reserves_out.checked_div(reserves_in).unwrap_or(dec!(0)) * amount_in;
        let price = expected_amount_out
            .checked_div(amount_in)
            .unwrap_or(dec!(0));
        let price_impact = (instantaneous_amount_out - expected_amount_out)
            .checked_div(instantaneous_amount_out)
            .unwrap_or(dec!(0))
            * dec!(100);
        let price_impact_rating = if price_impact > dec!(0.5) {
            PriceRating::Red
        } else if price_impact > dec!(0.2) {
            PriceRating::Yellow
        } else {
            PriceRating::Green
        };

        let decimals_in = self.coin_metadata(coin_type_in).decimals as u32;
        let decimals_out = self.coin_metadata(coin_type_out).decimals as u32;
        let min_amount_out = min_amount_out
            .round_dp_with_strategy(decimals_out, RoundingStrategy::ToPositiveInfinity);

        let quote = QuoteExactIn {
            expected_amount_out: expected_amount_out
                .round_dp_with_strategy(decimals_out, RoundingStrategy::ToZero),
            min_amount_out: min_amount_out
                .round_dp_with_strategy(decimals_out, RoundingStrategy::ToPositiveInfinity),
            fee_amount: fee_amount
                .round_dp_with_strategy(decimals_in, RoundingStrategy::ToPositiveInfinity),
            fee_currency: coin_type_in.to_string(),
            fee_amount_usd: None, // TODO
            price: price.round_dp_with_strategy(decimals_out, RoundingStrategy::ToZero),
            price_impact: price_impact.round_dp(2),
            price_impact_rating,
            pyth_rating: None, // TODO
        };
        Ok(quote)
    }

    async fn quote_exact_out(
        &self,
        _pool_input: &PoolInput,
        _coin_type_in: &str,
        _coin_type_out: &str,
        _amount_out: Decimal,
        _slippage: Percent,
    ) -> Result<QuoteExactOut> {
        // TODO
        unimplemented!()
    }

    async fn position(&self, pool_input: &PoolInput, sender: SuiAddress) -> Result<Position> {
        let pool = self.find_pool(pool_input).await?;
        let lp_sum = self
            .sum_coins(sender, &pool_input.lp_coin_type(self.package))
            .await?;

        let mut part = decimal_units(lp_sum as u64, 0)?;
        part.rescale(2);
        let mut whole = decimal_units(pool.supply_lp, 0)?;
        whole.rescale(2);
        let share = part / whole;

        let position = Position {
            coins: pool
                .coin_types
                .iter()
                .map(|coin_type| self.coin_metadata(coin_type))
                .collect(),
            coin_lp: self.coin_metadata(&pool_input.lp_coin_type(self.package)),
            amounts: pool
                .reserves
                .iter()
                .map(|reserve| share * reserve)
                .collect(),
            amount_lp: share * decimal_units(lp_sum as u64, 0)?,
            share: Percent(share),
        };
        Ok(position)
    }

    async fn swaps(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<Swapped>> {
        let raw_swaps: Vec<crate::schema::SuiEvent<SuiConstantProductSwapped>> = self
            .move_events(pool_input.swapped_type(self.package), offset)
            .await?;
        let mut swaps = Vec::new();
        for raw_swapped in raw_swaps {
            let coin_in = self.coin_metadata(&raw_swapped.data.coin_type_in.name);
            let coin_out = self.coin_metadata(&raw_swapped.data.coin_type_out.name);
            let decimals_in = coin_in.decimals;
            let decimals_out = coin_out.decimals;

            if sender.is_none() || sender.is_some_and(|sender| raw_swapped.sender == sender) {
                let swapped = Swapped {
                    coin_in,
                    coin_out,
                    amount_in: decimal_units(raw_swapped.data.amount_in, decimals_in)?,
                    amount_out: decimal_units(raw_swapped.data.amount_in, decimals_out)?,
                    sender: ID(raw_swapped.sender.to_string()),
                    timestamp: raw_swapped.timestamp,
                };
                swaps.push(swapped)
            }
        }
        Ok(swaps)
    }

    async fn adds(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityAdded>> {
        let decimals_x = self.coin_metadata(&pool_input.coin_types[0]).decimals;
        let decimals_y = self.coin_metadata(&pool_input.coin_types[1]).decimals;

        let raw_adds: Vec<crate::schema::SuiEvent<SuiConstantProductLiquidityAdded>> = self
            .move_events(pool_input.liquidity_added_type(self.package), offset)
            .await?;
        let mut adds = Vec::new();
        for raw_add in raw_adds {
            adds.push(LiquidityAdded {
                amounts_added: vec![
                    decimal_units(raw_add.data.amount_added_x, decimals_x)?,
                    decimal_units(raw_add.data.amount_added_y, decimals_y)?,
                ],
                amount_minted_lp: decimal_units(raw_add.data.amount_minted_lp, 0)?,
                sender: ID(raw_add.sender.to_string()),
                timestamp: raw_add.timestamp,
            });
        }
        Ok(adds)
    }

    async fn removes(
        &self,
        pool_input: &PoolInput,
        sender: Option<SuiAddress>,
        first: Option<usize>,
        offset: Option<usize>,
    ) -> Result<Vec<LiquidityRemoved>> {
        let decimals_x = self.coin_metadata(&pool_input.coin_types[0]).decimals;
        let decimals_y = self.coin_metadata(&pool_input.coin_types[1]).decimals;

        let raw_removes: Vec<crate::schema::SuiEvent<SuiConstantProductLiquidityRemoved>> = self
            .move_events(pool_input.liquidity_removed_type(self.package), offset)
            .await?;
        let mut removes = Vec::new();
        for raw_remove in raw_removes {
            removes.push(LiquidityRemoved {
                amounts_removed: vec![
                    decimal_units(raw_remove.data.amount_removed_x, decimals_x)?,
                    decimal_units(raw_remove.data.amount_removed_y, decimals_y)?,
                ],
                amount_burned_lp: decimal_units(raw_remove.data.amount_burned_lp, 0)?,
                sender: ID(raw_remove.sender.to_string()),
                timestamp: raw_remove.timestamp,
            });
        }
        Ok(removes)
    }

    // FIXME
    async fn summary_statistics(&self, _pool_input: &PoolInput) -> Result<PoolSummaryStatistics> {
        Ok(PoolSummaryStatistics {
            tvl: 4982157.90012,
            volume_24h: 330681.72041,
            fee_24h: 330.681509,
            user_count_24h: 60.0,
            transaction_count_24h: 906.0,
            volume_1w: 4211711.834646,
            fee_1w: 4211.709057,
            user_count_1w: 605.0,
            transaction_count_1w: 12147.0,
        })
    }

    async fn create_pool(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        fee_tier: FeeTier,
    ) -> Result<TransactionData> {
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveEvent(pool_input.pools_created_type(self.package)),
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        let pools_created_event = events
            .data
            .first()
            .ok_or_else(|| eyre!("{} not found", pool_input.pools_created_type(self.package)))?;

        let cursor = serde_json::to_value(pools_created_event)?;
        let pools_id: &str = cursor
            .get("event")
            .and_then(|c| c.get("moveEvent"))
            .and_then(|c| c.get("fields"))
            .and_then(|c| c.get("id"))
            .and_then(|c| c.as_str())
            .ok_or(eyre!("Unable to parse PoolCreated event"))?;

        self.sui_client
            .transaction_builder()
            .move_call(
                signer,
                self.package,
                "constant_product",
                "create_pool",
                pool_input.coin_type_tags()?,
                vec![
                    SuiJsonValue::from_str(pools_id)
                        .map_err(|err| eyre!(err))
                        .wrap_err_with(|| format!("Failed to sui-serialize {pools_id}"))?,
                    SuiJsonValue::new(serde_json::to_value(fee_tier.to_bps())?)
                        .map_err(|err| eyre!(err))?,
                ],
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn add_liquidity(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        amounts: &[Decimal],
    ) -> Result<TransactionData> {
        let mut call_args: Vec<SuiJsonValue> = Vec::new();
        call_args.push(SuiJsonValue::from_object_id(
            self.find_pool_id(pool_input).await?,
        ));
        for (_i, coin_type) in pool_input.coin_types.iter().enumerate() {
            let largest_coin = self.find_largest_coin(signer, coin_type).await?;
            call_args.push(SuiJsonValue::from_object_id(largest_coin.id));
        }
        for amount in amounts {
            call_args.push(decimal_to_sui_json(*amount)?);
        }
        self.sui_client
            .transaction_builder()
            .move_call(
                signer,
                self.package,
                "constant_product",
                "add_liquidity_",
                pool_input.coin_type_tags()?,
                call_args,
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn remove_liquidity(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        amount_lp: Decimal,
    ) -> Result<TransactionData> {
        let mut call_args: Vec<SuiJsonValue> = Vec::new();
        call_args.push(SuiJsonValue::from_object_id(
            self.find_pool_id(pool_input).await?,
        ));
        call_args.push(SuiJsonValue::from_object_id(
            self.find_largest_coin(signer, &pool_input.lp_coin_type(self.package))
                .await?
                .id,
        ));
        call_args.push(
            SuiJsonValue::from_str(
                &amount_lp
                    .to_u64()
                    .ok_or(eyre!("Unable to represent Decimal as u64"))?
                    .to_string(),
            )
            .map_err(|err| eyre!(err))?,
        );
        self.sui_client
            .transaction_builder()
            .move_call(
                signer,
                self.package,
                "constant_product",
                "remove_liquidity_",
                pool_input.coin_type_tags()?,
                call_args,
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn swap_exact_in(
        &self,
        signer: SuiAddress,
        pool_input: &PoolInput,
        coin_type_in: &str,
        coin_type_out: &str,
        amount_in: Decimal,
        slippage: Percent,
    ) -> Result<TransactionData> {
        let call_args = vec![
            SuiJsonValue::from_object_id(self.find_pool_id(pool_input).await?),
            SuiJsonValue::from_object_id(self.find_largest_coin(signer, coin_type_in).await?.id),
            decimal_to_sui_json(amount_in)?,
            decimal_to_sui_json(
                self.quote_exact_in(pool_input, coin_type_in, coin_type_out, amount_in, slippage)
                    .await?
                    .min_amount_out,
            )?,
        ];

        // TODO n-pools
        let function = if coin_type_out == pool_input.coin_types[1] {
            "swap_exact_x_for_y_"
        } else {
            "swap_exact_y_for_x_"
        };

        self.sui_client
            .transaction_builder()
            .move_call(
                signer,
                self.package,
                "constant_product",
                function,
                pool_input.coin_type_tags()?,
                call_args,
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn swap_exact_out(
        &self,
        _signer: SuiAddress,
        _pool_input: &PoolInput,
        _coin_type_in: &str,
        _coin_type_out: &str,
        _amount_out: Decimal,
        _slippage: Percent,
    ) -> Result<TransactionData> {
        unimplemented!()
    }
}
