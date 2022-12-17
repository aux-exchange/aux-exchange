use aux_rs::client::{AuxClient, CoinClient, PoolClient};
use aux_rs::schema::{Coins, Curve, FeeTier, Percent, PoolInput};
use aux_rs::{decimal_units, publish};
use color_eyre::eyre::{eyre, Result};
use rust_decimal_macros::dec;
use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
use sui_sdk::SuiClient;

#[tokio::test]
async fn test_client() -> Result<()> {
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
        .mint_and_transfer(signer, &usdc, 400, signer)
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
                decimal_units(100, Coins::sui().0.decimals)?,
                decimal_units(400, Coins::usdc().0.decimals)?,
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
            decimal_units(100, Coins::sui().0.decimals)?,
            Percent(dec!(0.5)),
        )
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let tx = aux_client
        .remove_liquidity(
            signer,
            &pool_input,
            decimal_units(200, 0)?,
        )
        .await?;
    aux_client.sign_and_execute(&keystore, tx).await?;

    let swaps = aux_client.swaps(&pool_input, None, None, None).await?;
    println!("{swaps:?}");
    let adds = aux_client.adds(&pool_input, None, None, None).await?;
    println!("{adds:?}");
    let removes = aux_client.removes(&pool_input, None, None, None).await?;
    println!("{removes:?}");

    Ok(())
}
