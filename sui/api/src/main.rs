use std::str::FromStr;

use color_eyre::eyre::{eyre, Result};
use sui_types::base_types::ObjectID;

use aux_rs::server::create_server;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;
    let package = ObjectID::from_str("0x6fa1d99f56abd1e568748559b49ddb4238691ede")
        .map_err(|err| eyre!(err))?;
    create_server(package).await
}
