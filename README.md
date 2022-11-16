# AUX

- [AUX](#aux)
  - [Introduction](#introduction)
  - [Fees and Rebates](#fees-and-rebates)
  - [Start Trading](#start-trading)
  - [Typescript SDK](#typescript-sdk)
  - [GraphQL](#graphql)
  - [Indexer](#indexer)
  - [Addresses](#addresses)
  - [Deployer](#deployer)
    - [Constraints](#constraints)
    - [Details](#details)
  - [Contributing to AUX](#contributing-to-aux)
    - [Quickstart](#quickstart)
    - [Deployment](#deployment)

    - [Quickstart](#quickstart)
    - [Deployment](#deployment)

## Introduction

AUX is a decentralized exchange powered by Aptos. We support the following
features:

- Liquidity pools (AMM)
- Central limit order book (CLOB)
- Router for best execution between AMM and CLOB

## Fees and Rebates

- Liquidity pool fees are set by the pool creator. AUX expects fees to range from
  0 bps to 30 bps. All fees are retained by the liquidity providers.
- Central limit order book fees are 0 bps for both maker and taker sides.
- The AUX router does not charge any fees on top of the underlying liquidity pool
  or central limit order book fees.

## Start Trading

Navigate to our [web app](https://aux.exchange) to start trading.

## Typescript SDK

Also known as `aux-ts`.

See [`aptos/api/aux-ts/examples`](./aptos/api/aux-ts/examples) for examples of interacting
with the AMM and CLOB through typescript.

In particular, we recommend starting with `devnet-amm-instructions.ts`.

## GraphQL

`APTOS_NETWORK=mainnet yarn start:graphql`

- Update/add the appropriate schema in: `typeDefs`
- Run `yarn codegen:graphql` from the `aux-ts` directory
- Update/add resolvers in `resolvers`

## Indexer

First, start up Redis locally.

`APTOS_NETWORK=mainnet yarn start:indexer`

## Addresses

| network | contract | address                                                                                                                                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devnet  | deployer | [`0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a`](https://explorer.aptoslabs.com/account/0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a?network=devnet)  |
| devnet  | aux      | [`0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a`](https://explorer.aptoslabs.com/account/0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a?network=devnet)  |
| testnet | deployer | [`0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be`](https://explorer.aptoslabs.com/account/0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be?network=testnet) |
| testnet | aux      | [`0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53`](https://explorer.aptoslabs.com/account/0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53?network=testnet) |
| mainnet | deployer | [`0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c`](https://explorer.aptoslabs.com/account/0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c?network=mainnet) |
| mainnet | aux      | [`0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541`](https://explorer.aptoslabs.com/account/0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541?network=mainnet) |

## Deployer

A very convoluted way of redeploying to a resource account and allow it to self-sign.

### Constraints

1.  For a module to self-sign, the module needs to get the `SignerCapability` from somewhere.
    The VM cannot create a signer even from the private key.

1.  The `SignerCapability` can either be inside the module address itself (with `friend` modules),
    or obtained from a call to an outside module, such as

    ```move
    module some_other_address::some_other_module {
        public fun get_signer(resource_account_addr: address): signer {
        }
    }
    ```

    However, the input must be an `address`, which is not guarded, and anyone can get the signer by just calling that function. If that function is to be guarded by a signer, we run into the chicken egg problem, since module cannot sign yet.

    **Therefore, the module must hold the signer capability inside itself.**

1.  It turns out the same package cannot update itself through an entry function inside itself.

### Details

1.  `deployer`'s `create-resource-account` binary creates a resource account, and save the `SignerCapability` and creator's `address` in the resource account.

1.  A module that is supposed to be self-sign will need to add a dependency to `deployer` and retrieves the signer capability and owner's address by calling the function `deployer::retrieve_resource_account_signer(source)`, where `source` is a `signer` that is the resource account address. See below code for some inspiration of using this in `init_module`.
    See an example in [examples/selfsigned](../deployer-examples/selfsigned).

    however, this can also be called from any other module that is signed by `owner` before `retrieve_resource_account_signer` is called. The `SignerCapability` must be obtained from the resource account modules once it's retrieved.

    ```move
    module resource_account_address::a_module {
        use std::signer;
        use aptos_framework::account::{Self, SignerCapability};
        use deployer::deployer;

        friend selfsigned::another_mod;

        const E_NOT_SELF_SIGNED: u64 = 1001;
        const E_CANNOT_SIGN_FOR_OTHER: u64 = 1002;
        const E_NOT_OWNER: u64 = 1003;

        struct Authority has key {
            signer_capability: SignerCapability,
            owner_address: address,
        }

        // on module initialization, the module will tries to get the signer capability from deployer.
        fun init_module(source: &signer) {
            let source_addr = signer::address_of(source);
            if(!exists<Authority>(source_addr) && deployer::resource_account_signer_exists(source_addr)) {
                let (owner_address, signer_capability) = deployer::retrieve_resource_account_signer(source);
                let auth_signer = account::create_signer_with_capability(&signer_capability);
                assert!(
                    signer::address_of(source) == signer::address_of(&auth_signer),
                    E_CANNOT_SIGN_FOR_OTHER,
                );

                move_to(source, Authority {
                    signer_capability,
                    owner_address,
                });
            }
        }
    }
    ```

    Publishing code can be done either through `create-resource-account-and-publish` binary, or `publish-to-resource-account` binary (given the `SignerCapability` is not retrieved yet).

1.  If the resource account's module doesn't expose a function to retrieve the `SignerCapability`, it's sealed. However, if the it does expose, we can create another module to deploy to that account. The signature of the function must be like follows to use the `republish-to-resource-account` binary:
    Note, the module that resides inside the target resource account needs to be added as a dependency. See [examples/redeployer](../deployer-examples/redeployer) for an example.

    ```move
    module redeployer::redeploy {
        use aptos_framework::code::publish_package_txn;
        use selfsigned::authority::get_signer;

        public entry fun redeploy(owner:&signer, metadata: vector<u8>, code: vector<vector<u8>>) {
            let resource_account_signer = get_signer(owner);
            publish_package_txn(&resource_account_signer, metadata, code)
        }
    }
    ```

## Contributing to AUX

See [Contributing](./CONTRIBUTING.md).

### Quickstart

See [Quickstart](./CONTRIBUTING.md#Quickstart) for tutorials on how to run a local instance or in a container.

### Deployment

See [deployment](./CONTRIBUTING.md#Deployment) for how to deploy the contract.
