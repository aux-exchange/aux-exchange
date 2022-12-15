use aux_rs::client::{AuxClient, CoinClient, PoolClient};
use aux_rs::coin_units;
use aux_rs::schema::{Coin, Coins, Curve, FeeTier, Percent, PoolInput};
use aux_rs::server::create_server;
use color_eyre::eyre::{eyre, Result};
use rust_decimal_macros::dec;
use serde::Deserialize;
use serde_json::json;
use std::path::Path;
use std::time::Duration;
use sui_framework_build::compiled_package::BuildConfig;
use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
use sui_sdk::{types::base_types::ObjectID, SuiClient};
use sui_types::messages::{ExecuteTransactionRequestType, Transaction};

#[derive(Debug, Deserialize)]
struct GraphQLResponse<T> {
    pub data: Option<T>,
    pub errors: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct Pool {
    pub id: String,
    pub type_: String,
    pub coins: Vec<Coin>,
    pub amounts: Vec<u64>,
}

async fn publish(sui_client: &SuiClient, keystore: &Keystore) -> ObjectID {
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
    let signature = keystore.sign(&signer, &tx.to_bytes()).unwrap();
    let tx = sui_client
        .quorum_driver()
        .execute_transaction(
            Transaction::from_data(tx, signature).verify().unwrap(),
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

#[tokio::test]
async fn test_graphql() -> Result<()> {
    color_eyre::install()?;

    let sui_client = SuiClient::new("http://127.0.0.1:9000", None, None)
        .await
        .map_err(|err| eyre!(err))?;

    let keystore = Keystore::from(
        FileBasedKeystore::new(
            &dirs::home_dir()
                .ok_or(eyre!("Failed to get home dir."))?
                .join(".sui")
                .join("sui_config")
                .join("sui.keystore"),
        )
        .map_err(|err| eyre!(err))?,
    );
    let signer = keystore.addresses().last().unwrap().to_owned();

    let package = publish(&sui_client, &keystore).await;
    println!("Package: {package:?}");

    let aux_client = AuxClient {
        sui_client,
        package,
    };

    let sui = "0x2::sui::SUI".to_string();
    let usdc = format!("{package}::test_usdc::TEST_USDC");

    let pool_input = PoolInput {
        coin_types: vec![sui.clone(), usdc.clone()],
        curve: Curve::ConstantProduct,
    };

    let tx = aux_client
        .mint_and_transfer(signer, &usdc, 400_000_000, signer)
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let tx = aux_client
        .create_pool(signer, &pool_input, FeeTier::Most)
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let tx = aux_client
        .add_liquidity(
            signer,
            &pool_input,
            &[
                coin_units::decimal(100_000_000_000, Coins::sui().0.decimals)?,
                coin_units::decimal(400_000_000, Coins::usdc().0.decimals)?,
            ],
        )
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let tx = aux_client
        .swap_exact_in(
            signer,
            &pool_input,
            &sui,
            &usdc,
            coin_units::decimal(100_000_000_000, Coins::sui().0.decimals)?,
            Percent(dec!(0.5)),
        )
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let swaps = aux_client.swaps(&pool_input).await?;
    println!("{swaps:?}");

    let adds = aux_client.adds(&pool_input).await?;
    println!("{adds:?}");

    let task = tokio::spawn(async move { create_server(package).await });
    tokio::time::sleep(Duration::from_millis(1000)).await;

    let client = reqwest::Client::new();
    let res: GraphQLResponse<serde_json::Value> = client
        .post("http://devbox:4000/graphql")
        .json(&json!({"query": "
            {
                pools {
                    id
                    type
                    version
                    featured
                    coins {
                        id
                        decimals
                        name
                        symbol
                        description
                        iconUrl
                    }
                    curve
                    reserves
                    supplyLP
                    feeTier
                    fee
                }
            }
        "}))
        .send()
        .await?
        .json()
        .await?;
    assert!(res.errors.is_none(), "{:?}", res.errors);
    println!(
        "{}",
        serde_json::to_string_pretty(&res.data.unwrap()).unwrap()
    );

    // let tx = aux_client
    //     .remove_liquidity(
    //         signer,
    //         &pool_input,
    //         &sui,
    //         &usdc,
    //         coin_units::decimal(100_000_000_000, Coins::sui().0.decimals)?,
    //         Percent(dec!(0.5)),
    //     )
    //     .await?;
    // aux_client.sign_and_execute(&keystore, tx).await?;

    // let removes = aux_client.removes(&pool_input).await?;
    // println!("{removes:?}");

    task.abort();

    Ok(())
}
