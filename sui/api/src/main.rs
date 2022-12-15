use std::str::FromStr;

use color_eyre::eyre::{eyre, Result};
use sui_types::base_types::ObjectID;

use aux_rs::server::create_server;

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;
    let package = ObjectID::from_str("0xe7a1a236ac1093d664d5566f5a7caecbb439bc73")
        .map_err(|err| eyre!(err))?;
    create_server(package).await
}
