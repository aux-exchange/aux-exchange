// use aux_rs::client::{AuxClient, CoinClient, PoolClient};
// use aux_rs::pool::{Curve, PoolInput};
// use color_eyre::eyre::{eyre, Result};
// use std::{str::FromStr};
// use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
// use sui_sdk::{
//     types::{
//         base_types::{ObjectID},
//     },
//     SuiClient,
// };

// #[tokio::test]
// async fn test_constant_product() -> Result<()> {
//     color_eyre::install()?;

//     let sui_client = SuiClient::new("http://127.0.0.1:9000", None, None)
//         .await
//         .map_err(|err| eyre!(err))?;

//     let package_object_id = ObjectID::from_str("0x9f23cae250f7b65119c47da699e39b193ce7305b")
//         .map_err(|err| eyre!(err))?;

//     let keystore = Keystore::from(
//         FileBasedKeystore::new(
//             &dirs::home_dir()
//                 .ok_or(eyre!("Failed to get home dir."))?
//                 .join(".sui")
//                 .join("sui_config")
//                 .join("sui.keystore"),
//         )
//         .map_err(|err| eyre!(err))?,
//     );

//     let signer = *keystore
//         .addresses()
//         .last()
//         .ok_or(eyre!("Keystore is empty."))?;

//     let aux_client = AuxClient {
//         sui_client,
//         package,
//         signer,
//     };

//     let sui = "0x2::sui::SUI".to_string();
//     let usdc = format!("{package_object_id}::test_usdc::TEST_USDC");

//     let pool_input = PoolInput {
//         coin_types: vec![sui.clone(), usdc.clone()],
//         curve: Curve::ConstantProduct,
//     };

//     // let mint_tx = aux_client
//     //     .mint_and_transfer(&usdc, u32::MAX as u64, aux_client.signer)
//     //     .await?;
//     // let tx = aux_client.sign_and_execute(&keystore, mint_tx).await?;
//     // println!("{tx:?}");

//     // let create_pool_tx = aux_client.create_pool(&pool_input, 30).await?;
//     // aux_client
//     //     .sign_and_execute(&keystore, create_pool_tx)
//     //     .await?;
    
//     let add_liquidity_tx = aux_client
//         .add_liquidity(
//             &pool_input,
//             &[
//                 aux_client.find_coin_id(&sui).await?,
//                 aux_client.find_coin_id(&usdc).await?,
//             ],
//         )
//         .await?;
//     println!("{add_liquidity_tx:?}");
//     let tx = aux_client
//         .sign_and_execute(&keystore, add_liquidity_tx)
//         .await?;
//     println!("{tx:?}");

//     aux_client.find_pool(&pool_input).await?;


//     // let pool = aux_client.find_pool(&pool_input).await?;
//     // println!("{pool:?}");

//     Ok(())
// }
