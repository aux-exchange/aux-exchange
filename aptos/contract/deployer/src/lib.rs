use aptos_sdk::{
    move_types::{ident_str, language_storage::ModuleId},
    rest_client::Client,
    types::{
        account_address::AccountAddress,
        transaction::{EntryFunction, TransactionPayload},
        LocalAccount,
    },
};

const DEPLOYER_NAME: &str = "deployer";

pub async fn upload_code(
    rest_client: &Client,
    human_account: &mut LocalAccount,
    id: &str,
    metadata: &Vec<u8>,
    codes: &[Vec<u8>],
) {
    let mut code_line_index: u64 = 0;
    for code in codes.iter() {
        println!(
            "uploading code at index {} length {}",
            code_line_index,
            code.len()
        );

        let entry_function_call = EntryFunction::new(
            ModuleId::new(
                human_account.address(),
                ident_str!(DEPLOYER_NAME).to_owned(),
            ),
            ident_str!("upload_code").to_owned(),
            vec![],
            vec![
                bcs::to_bytes(id).unwrap(),
                bcs::to_bytes(metadata).unwrap(),
                bcs::to_bytes(&code_line_index).unwrap(),
                bcs::to_bytes(&0u64).unwrap(),
                bcs::to_bytes(code).unwrap(),
            ],
        );
        code_line_index += 1;

        util_for_aptos::submit_transaction_with_much_gas(
            rest_client,
            human_account,
            TransactionPayload::EntryFunction(entry_function_call),
        )
        .await;
    }
}

pub async fn publish_to_resource_account(
    rest_client: &Client,
    human_account: &mut LocalAccount,
    resource_account: &AccountAddress,
    id: &str,
    metadata: &Vec<u8>,
) {
    let entry_function_call = EntryFunction::new(
        ModuleId::new(
            human_account.address(),
            ident_str!(DEPLOYER_NAME).to_owned(),
        ),
        ident_str!("publish_from_repo_to_resource_account").to_owned(),
        vec![],
        vec![
            bcs::to_bytes(resource_account).unwrap(),
            bcs::to_bytes(metadata).unwrap(),
            bcs::to_bytes(id).unwrap(),
        ],
    );

    util_for_aptos::submit_transaction_with_much_gas(
        rest_client,
        human_account,
        TransactionPayload::EntryFunction(entry_function_call),
    )
    .await;
}

pub async fn upload_and_publish_from_repo_to_resource_account(
    rest_client: &Client,
    human_account: &mut LocalAccount,
    resource_account: &AccountAddress,
    id: &str,
    metadata: &Vec<u8>,
    codes: &[Vec<u8>],
) {
    upload_code(rest_client, human_account, id, metadata, codes).await;
    println!("finished uploading code, now publish");
    publish_to_resource_account(
        rest_client,
        &mut *human_account,
        resource_account,
        id,
        metadata,
    )
    .await;
}

pub async fn delete_code(rest_client: &Client, human_account: &mut LocalAccount, id: &str) {
    let entry_function_call = EntryFunction::new(
        ModuleId::new(
            human_account.address(),
            ident_str!(DEPLOYER_NAME).to_owned(),
        ),
        ident_str!("delete_code").to_owned(),
        vec![],
        vec![bcs::to_bytes(id).unwrap()],
    );

    util_for_aptos::submit_transaction_with_much_gas(
        rest_client,
        human_account,
        TransactionPayload::EntryFunction(entry_function_call),
    )
    .await;
}
