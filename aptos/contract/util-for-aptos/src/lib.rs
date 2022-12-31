use aptos_sdk::{
    crypto::{ed25519::Ed25519PrivateKey, hash::HashValue},
    rest_client::{Client, Transaction},
    transaction_builder::TransactionFactory,
    types::{
        account_address::AccountAddress, chain_id::ChainId, transaction::TransactionPayload,
        AccountKey, LocalAccount,
    },
};

pub fn get_private_key_from_str(pk_str: &str) -> Ed25519PrivateKey {
    let private_key_bytes = if pk_str.starts_with("0x") {
        hex::decode(pk_str.chars().skip(2).collect::<String>())
            .expect("failed to get decode the private key")
    } else {
        hex::decode(pk_str).expect("failed to decode the message")
    };
    Ed25519PrivateKey::try_from(&private_key_bytes[..]).expect("failed to get private key")
}

pub fn hex_to_account_address(address: &str) -> AccountAddress {
    if address.starts_with("0x") {
        AccountAddress::from_hex_literal(address).unwrap()
    } else {
        AccountAddress::from_hex(address).unwrap()
    }
}

pub async fn get_sequence_number(rest_client: &Client, addr: AccountAddress) -> u64 {
    rest_client
        .get_account(addr)
        .await
        .expect("failed to get account")
        .inner()
        .sequence_number
}

pub async fn get_chain_id(rest_client: &Client) -> ChainId {
    ChainId::new(
        rest_client
            .get_ledger_information()
            .await
            .unwrap()
            .inner()
            .chain_id,
    )
}

pub fn get_account_address_from_private_key(pk: Ed25519PrivateKey) -> AccountAddress {
    let key = AccountKey::from_private_key(pk);
    key.authentication_key().derived_address()
}

pub async fn get_local_account_from_private_key_str(
    pk_str: &str,
    rest_client: &Client,
) -> LocalAccount {
    let private_key = get_private_key_from_str(pk_str);
    let key = AccountKey::from_private_key(private_key);
    let addr = key.authentication_key().derived_address();

    let seqnum = if let Ok(res) = rest_client.get_account(addr).await {
        res.inner().sequence_number
    } else {
        0
    };

    LocalAccount::new(addr, key, seqnum)
}

pub async fn get_local_account_from_private_key_str_and_addr(
    pk_str: &str,
    addr: AccountAddress,
    rest_client: &Client,
) -> LocalAccount {
    let private_key = get_private_key_from_str(pk_str);
    let key = AccountKey::from_private_key(private_key);

    let seqnum = if let Ok(res) = rest_client.get_account(addr).await {
        res.inner().sequence_number
    } else {
        0
    };

    LocalAccount::new(addr, key, seqnum)
}

/// get_resource_address creates the resource account address from the source account address and a seed string.
/// This is the same method that is in aptos_framework.
pub fn get_resource_address(source: AccountAddress, seed: &str) -> AccountAddress {
    // note that seed must use as_bytes() from &str instead of bcs::to_bytes.
    // bcs::to_bytes will prepend the length of the result array in number of bytes, for example,
    // instead of "test" -> [74, 65, 73, 74] or "0x74657374", bcs will give [4, 74, 65, 73, 74], "0x0474657374",
    let mut all_bytes = [&bcs::to_bytes(&source).unwrap(), seed.as_bytes()].concat();
    all_bytes.push(255);
    let hashed_value = HashValue::sha3_256_of(&all_bytes).to_vec();
    bcs::from_bytes::<AccountAddress>(&hashed_value)
        .expect("failed to generate resource account address")
}

pub fn get_none_artifact_build_options() -> aptos_framework::BuildOptions {
    aptos_framework::BuildOptions {
        with_srcs: false,
        with_abis: false,
        with_source_maps: false,
        with_error_map: true,
        install_dir: Option::None,
        ..aptos_framework::BuildOptions::default()
    }
}

pub async fn get_gas_estimate(rest_client: &Client) -> u64 {
    rest_client
        .estimate_gas_price()
        .await
        .unwrap()
        .into_inner()
        .gas_estimate
}

pub async fn submit_transaction_with_much_gas(
    rest_client: &Client,
    human_account: &mut LocalAccount,
    payload: TransactionPayload,
) -> Transaction {
    let tx = human_account.sign_with_transaction_builder(
        TransactionFactory::new(get_chain_id(rest_client).await)
            .payload(payload)
            .max_gas_amount(200_000)
            .gas_unit_price(get_gas_estimate(rest_client).await),
    );

    match rest_client.submit_and_wait(&tx).await {
        Err(err) => {
            println!("{:#?}", err);
            panic!();
        }
        Ok(transaction) => transaction.into_inner(),
    }
}

#[cfg(test)]
mod tests {
    use crate::*;
    #[test]
    fn test_get_resource_address() {
        let source = AccountAddress::from_hex_literal(
            "0xccb625a0d6079c513fad1ef05d963a3cc68f50e13f53ff7844d0e1fdfdd285c0",
        )
        .unwrap();
        let seed = "test";

        let resource_address = get_resource_address(source, seed);

        assert_eq!(
            resource_address,
            AccountAddress::from_hex_literal(
                "0x168369ec28e1089a80484b8d7f6753a9c9b56c2773b2dd2528fe384e91c6be06"
            )
            .unwrap()
        );
    }
}
