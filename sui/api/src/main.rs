use std::str::FromStr;

use color_eyre::eyre::{eyre, Result};
use sui_types::base_types::ObjectID;

use aux_rs::server::create_server;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;
    let package = ObjectID::from_str("0xd369aa00196a9aaa9acec22ab612c31bcbae5991")
        .map_err(|err| eyre!(err))?;
    create_server(package).await
}
