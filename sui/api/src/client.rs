use color_eyre::eyre::{bail, eyre, Result, WrapErr};
use futures::join;
use nom::{
    bytes::complete::{tag, take_until, take_while},
    character::is_alphanumeric,
    combinator::rest,
    multi::separated_list0,
    sequence::{delimited, pair},
    IResult,
};
use std::str::FromStr;
use sui_json_rpc::api::QUERY_MAX_RESULT_LIMIT;
use sui_keys::keystore::{AccountKeystore, Keystore};
use sui_sdk::{
    json::SuiJsonValue,
    rpc_types::{SuiObjectInfo, SuiTypeTag},
    types::{
        base_types::{ObjectID, SuiAddress},
        messages::Transaction,
    },
    SuiClient, TransactionExecutionResult,
};
use sui_types::{
    base_types::SequenceNumber,
    messages::{ExecuteTransactionRequestType, TransactionData},
    query::EventQuery,
};

use serde::de::DeserializeOwned;

use sui_sdk::rpc_types::SuiData;

use crate::schema::{ConstantProductPool, Curve, Pool, PoolInput};

pub struct AuxClient {
    pub sui_client: SuiClient,
    pub package: ObjectID,
    pub signer: SuiAddress,
}

impl AuxClient {
    pub async fn get_object<T: DeserializeOwned>(&self, id: ObjectID) -> Result<SuiObject<T>> {
        let sui_raw_data = self
            .sui_client
            .read_api()
            .get_object(id)
            .await
            .map_err(|err| eyre!(err))?;
        let sui_raw_move_object = sui_raw_data
            .object()?
            .data
            .try_as_move()
            .ok_or(eyre!("Object was unexpected package"))?
            .to_owned();
        let data: T = sui_raw_move_object
            .deserialize()
            .map_err(|err| eyre!(err))?;
        let object = SuiObject {
            type_: sui_raw_move_object.type_,
            has_public_transfer: sui_raw_move_object.has_public_transfer,
            version: sui_raw_move_object.version,
            data,
        };
        Ok(object)
    }

    pub async fn filter_objects_by_type(&self, type_: &str) -> Result<Vec<SuiObjectInfo>> {
        let objects = self
            .sui_client
            .read_api()
            .get_objects_owned_by_address(self.signer)
            .await
            .map_err(|err| eyre!(err))?;
        let objects = objects
            .iter()
            .filter(|object| object.type_ == type_)
            .map(|object| object.to_owned())
            .collect();
        Ok(objects)
    }

    pub async fn find_object_by_type(&self, type_: &str) -> Result<SuiObjectInfo> {
        let objects = self.filter_objects_by_type(type_).await?;
        let object = objects.first().ok_or(eyre!(
            "Failed to find {} in {}'s objects.",
            type_,
            self.signer
        ))?;
        Ok(object.to_owned())
    }

    pub async fn filter_events(&self, generic_type: &str) -> Result<SuiMoveStruct> {
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveModule {
                    package: self.package,
                    module: "constant_product_entry".to_string(),
                },
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        let fields: std::result::Result<Vec<_>, _> = events
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
                    .map(|type_| type_.contains(generic_type))
                    .and_then(|_| move_event.and_then(|c| c.get("fields")))
            })
            .map(|pool_id| ObjectID::from_str(&pool_id))
            .collect();
    }

    pub async fn sign_and_execute(
        &self,
        keystore: &Keystore,
        tx: TransactionData,
    ) -> Result<TransactionExecutionResult> {
        let signature = keystore.sign(&self.signer, &tx.to_bytes())?;
        self.sui_client
            .quorum_driver()
            .execute_transaction(
                Transaction::from_data(tx, signature).verify()?,
                Some(ExecuteTransactionRequestType::WaitForLocalExecution),
            )
            .await
            .map_err(|err| eyre!(err))
    }
}

pub trait CoinClient {
    /// Gets the object id of a coin with `coin_type` from signer's inventory.
    /// If multiple coins exist, returns the first one found.
    async fn find_coin_id(&self, coin_type: &str) -> Result<ObjectID>;

    async fn mint_and_transfer(
        &self,
        coin_type: &str,
        amount: u64,
        recipient: SuiAddress,
    ) -> Result<TransactionData>;
}

impl CoinClient for AuxClient {
    async fn find_coin_id(&self, coin_type: &str) -> Result<ObjectID> {
        let object = self
            .find_object_by_type(&format!("0x2::coin::Coin<{coin_type}>"))
            .await?;
        Ok(object.object_id)
    }

    async fn mint_and_transfer(
        &self,
        coin_type: &str,
        amount: u64,
        recipient: SuiAddress,
    ) -> Result<TransactionData> {
        let treasury_cap = self
            .find_object_by_type(&format!("0x2::coin::TreasuryCap<{coin_type}>"))
            .await?
            .object_id;

        self.sui_client
            .transaction_builder()
            .move_call(
                self.signer,
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
    async fn create_pool(&self, pool_input: &PoolInput, fee_bps: u16) -> Result<TransactionData>;

    async fn add_liquidity(
        &self,
        pool_input: &PoolInput,
        coins: &[ObjectID],
    ) -> Result<TransactionData>;

    async fn remove_liquidity(
        &self,
        pool_input: &PoolInput,
        lp_coin: ObjectID,
    ) -> Result<TransactionData>;

    async fn pool(&self, id: ObjectID) -> Result<Pool>;

    async fn pools(&self) -> Result<Vec<Pool>>;

    async fn find_pool_id(&self, pool_input: &PoolInput) -> Result<ObjectID>;

    async fn find_pool(&self, pool_input: &PoolInput) -> Result<Pool>;

    async fn swaps(&self) -> Result<Vec<Swapped>>;

    // async fn adds(&self) -> Result<LiquidityAdded>;

    // async fn removes(&self) -> Result<LiquidityRemoved>;
}

impl PoolClient for AuxClient {
    async fn create_pool(&self, pool_input: &PoolInput, fee_bps: u16) -> Result<TransactionData> {
        self.sui_client
            .transaction_builder()
            .move_call(
                self.signer,
                self.package,
                "constant_product_entry",
                "create_pool",
                pool_input.coin_type_tags()?,
                vec![SuiJsonValue::new(serde_json::to_value(fee_bps)?).map_err(|err| eyre!(err))?],
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn add_liquidity(
        &self,
        pool_input: &PoolInput,
        coins: &[ObjectID],
    ) -> Result<TransactionData> {
        let mut object_ids = vec![self.find_pool_id(pool_input).await?];
        object_ids.extend(coins);
        self.sui_client
            .transaction_builder()
            .move_call(
                self.signer,
                self.package,
                "constant_product_entry",
                "add_liquidity",
                pool_input.coin_type_tags()?,
                object_ids_to_sui_args(&object_ids)?,
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn remove_liquidity(
        &self,
        pool_input: &PoolInput,
        lp_coin: ObjectID,
    ) -> Result<TransactionData> {
        let object_ids = vec![self.find_pool_id(pool_input).await?, lp_coin];
        self.sui_client
            .transaction_builder()
            .move_call(
                self.signer,
                self.package,
                "constant_product_entry",
                "remove_liquidity",
                pool_input.coin_type_tags()?,
                object_ids_to_sui_args(&object_ids)?,
                None,
                1000,
            )
            .await
            .map_err(|err| eyre!(err))
    }

    async fn pool(&self, id: ObjectID) -> Result<Pool> {
        let object: SuiObject<ConstantProductPool> = self.get_object(id).await?;
        let cp = object.data;
        let coin_types = parse_type_args(&object.type_)?;
        let (_witness, coin_types) = coin_types
            .split_last()
            .ok_or(eyre!("Pool coin types unexpected empty."))?;
        let coin_types = coin_types.to_vec();
        let pool = Pool {
            type_: object.type_,
            version: object.version,
            id: cp.id,
            coin_types,
            curve: Curve::ConstantProduct,
            reserves: vec![cp.reserve_x, cp.reserve_y],
            supply_lp: cp.supply_lp,
            fee_bps: cp.fee_bps,
        };
        Ok(pool)
    }

    async fn pools(&self) -> Result<Vec<Pool>> {
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveModule {
                    package: self.package,
                    module: "constant_product_entry".to_string(),
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
                    .map(|type_| type_.contains("PoolCreated"))
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

        futures::future::join_all(pool_ids?.into_iter().map(|pool_id| self.pool(pool_id)))
            .await
            .into_iter()
            .collect()
    }

    async fn find_pool_id(&self, pool_input: &PoolInput) -> Result<ObjectID> {
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveEvent(pool_input.pool_created_type(self.package)),
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        let pool_created = events.data.first().ok_or(eyre!("Pool not found."))?;

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
        let events = self
            .sui_client
            .event_api()
            .get_events(
                EventQuery::MoveEvent(pool_input.pool_created_type(self.package)),
                None,
                Some(QUERY_MAX_RESULT_LIMIT),
                None,
            )
            .await
            .map_err(|err| eyre!(err))?;

        self.pool(id).await
    }

    async fn swaps(&self) -> Result<Vec<Swapped>> {
        self.sui_client.Ok(vec![])
    }
}

pub struct SuiObject<T: DeserializeOwned> {
    pub type_: String,
    pub has_public_transfer: bool,
    pub version: SequenceNumber,
    pub data: T,
}

pub fn parse_sui_type_tag(s: &str) -> Result<SuiTypeTag> {
    let type_tag = sui_types::parse_sui_type_tag(s).map_err(|err| eyre!(err))?;
    Ok(SuiTypeTag::from(type_tag))
}

pub fn object_ids_to_sui_args(object_ids: &[ObjectID]) -> Result<Vec<SuiJsonValue>> {
    let mut args = Vec::new();
    for object_id in object_ids {
        args.push(
            SuiJsonValue::from_str(&object_id.to_hex_literal())
                .map_err(|err| eyre!(err))
                .wrap_err_with(|| format!("Failed to sui-serialize {object_id}"))?,
        );
    }
    Ok(args)
}

pub fn parse_type_args(type_: &str) -> Result<Vec<String>> {
    let s = pair(
        take_until::<_, _, nom::error::Error<_>>("<"),
        delimited(
            // tag::<_, _, nom::error::Error<_>>("<"),
            tag("<"),
            take_until(">"),
            tag(">"),
        ),
    )(type_)
    .ok()
    .to_owned();
    let s = s.ok_or(eyre!("Failed to parse {type_}"))?;
    let s = s.1 .1;
    let mut split = Vec::new();
    let mut parens = 0;
    let mut curr = String::new();
    for char in s.chars() {
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
                    bail!("Invalid type string {}", s);
                }
            }
            _ => {}
        }
        curr.push(char);
    }
    if curr != "" {
        split.push(curr.trim().to_string());
    }
    Ok(split)
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
                " string::String".to_string(),
                " SomethingElse<U, S".to_string()
            ]
        );
    }
}
