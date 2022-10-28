use std::str::FromStr;

use aptos_sdk::{
    move_types::{ident_str, language_storage::ModuleId},
    rest_client::Client,
    types::transaction::{EntryFunction, TransactionPayload},
};
use clap::Parser;
use url::Url;

#[derive(Debug, Parser)]
#[clap(author, version, about, long_about = None)]
pub struct Args {
    #[clap(short, long, value_parser)]
    pub deployer_address: String,
    #[clap(short = 'k', long, value_parser)]
    pub private_key: String,
    #[clap(short ='u', long, default_value_t = String::from("http://127.0.0.1:8080"), value_parser)]
    pub node_url: String,
    #[clap(short = 's', long, value_parser)]
    pub seed: String,
}

const DEPLOYER_NAME: &str = "deployer";

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let deployer_addr = args.deployer_address.as_str();
    let human_private_key = args.private_key.as_str();
    let seed = args.seed.as_str();
    let node_url = Url::from_str(&args.node_url).unwrap();

    let rest_client = Client::new(node_url.clone());
    let deployer_address = util_for_aptos::hex_to_account_address(deployer_addr);

    let entry_function_call = EntryFunction::new(
        ModuleId::new(deployer_address, ident_str!(DEPLOYER_NAME).to_owned()),
        ident_str!("create_resource_account").to_owned(),
        vec![],
        vec![bcs::to_bytes(seed).unwrap()],
    );

    let payload = TransactionPayload::EntryFunction(entry_function_call);
    let mut human_account = util_for_aptos::get_local_account_from_private_key_str_and_addr(
        human_private_key,
        deployer_address,
        &rest_client,
    )
    .await;

    let res =
        util_for_aptos::submit_transaction_with_much_gas(&rest_client, &mut human_account, payload)
            .await;

    println!("{:#?}", res);

    println!(
        "resource account is: {}",
        util_for_aptos::get_resource_address(human_account.address(), seed)
    );
}
