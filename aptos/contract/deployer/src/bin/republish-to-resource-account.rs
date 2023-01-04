use std::{path::PathBuf, str::FromStr};

use aptos_sdk::{
    move_types::transaction_argument::TransactionArgument,
    rest_client::Client,
    types::transaction::{Script, TransactionPayload},
};
use clap::Parser;
use url::Url;

const DEPLOYER_NAME: &str = "deployer";

#[derive(Debug, Parser)]
#[clap(author, version, about, long_about = None)]
pub struct Args {
    #[clap(short, long, value_parser)]
    pub deployer_address: String,
    #[clap(short = 'k', long, value_parser)]
    pub private_key: String,
    #[clap(short ='u', long, default_value_t = String::from("http://127.0.0.1:8080"), value_parser)]
    pub node_url: String,
    #[clap(short = 'n', long, value_parser)]
    pub package_name: String,
    #[clap(short = 'p', long, value_parser, default_value_t = String::from("."))]
    pub package_path: String,
    #[clap(short = 't', long, value_parser)]
    pub target_address: String,
    #[clap(short = 'v', long, value_parser)]
    pub redeploy_package: String,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let deployer_addr = args.deployer_address.as_str();
    let human_private_key = args.private_key.as_str();
    let node_url = Url::from_str(&args.node_url).unwrap();
    let build_path = PathBuf::from_str(&args.package_path).expect("failed to get the package path");
    let package_name = args.package_name.as_str();
    let resource_account_addr = args.target_address.as_str();
    let redeploy_package = args.redeploy_package.as_str();

    let rest_client = Client::new(node_url.clone());
    let deployer_address = util_for_aptos::hex_to_account_address(deployer_addr);
    let resource_account_address = util_for_aptos::hex_to_account_address(resource_account_addr);

    let mut build_options = util_for_aptos::get_none_artifact_build_options();
    build_options
        .named_addresses
        .insert(DEPLOYER_NAME.to_string(), deployer_address);
    build_options
        .named_addresses
        .insert(package_name.to_owned(), resource_account_address);

    let built_package =
        aptos_framework::BuiltPackage::build(build_path, build_options.clone()).unwrap();

    let metadata = bcs::to_bytes(&built_package.extract_metadata().unwrap()).unwrap();
    let code = built_package.extract_code();

    let mut human_account = util_for_aptos::get_local_account_from_private_key_str_and_addr(
        human_private_key,
        deployer_address,
        &rest_client,
    )
    .await;

    deployer::delete_code(&rest_client, &mut human_account, "abc").await;

    deployer::upload_code(&rest_client, &mut human_account, "abc", &metadata, &code).await;

    let build_script = aptos_framework::BuiltPackage::build(
        PathBuf::from_str(redeploy_package).unwrap(),
        build_options.clone(),
    )
    .unwrap();

    if build_script.script_count() != 1 {
        panic!("only one script is allowed in the package.")
    }

    let script_bytes = build_script.extract_script_code().pop().unwrap();

    let script = Script::new(
        script_bytes,
        vec![],
        vec![
            TransactionArgument::U8Vector(metadata),
            TransactionArgument::U8Vector(b"abc".to_vec()),
        ],
    );

    let payload = TransactionPayload::Script(script);

    util_for_aptos::submit_transaction_with_much_gas(&rest_client, &mut human_account, payload)
        .await;
}
