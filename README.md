# AUX

AUX is a decentralized exchange powered by Aptos. We support the following
features:

- Liquidity pools (AMM)
- Central limit order book (CLOB)
- Router for best execution between AMM and CLOB

## Table of Contents
- [Fees and Rebates](#fees-and-rebates)
- [Start Trading](#start-trading)
- [Typescript SDK](#typescript-sdk)
  - [Quickstart](#quickstart)
  - [Walkthrough](#walkthrough)
- [GraphQL](#graphql)
- [Indexer](#indexer)
- [Deployment](#deployment)
  - [Hard vs. rolling restart](#hard-vs-rolling-restart)
  - [Update the UIs (optional)](#update-the-uis-optional)
  - [Bouncing the processes](#bouncing-the-processes)
    - [Rolling restart](#rolling-restart)
    - [Hard restart](#hard-restart)
- [Addresses](#addresses)
- [Deployer](#deployer)
  - [Constraints](#constraints)
  - [Details](#details)
- [Contributing to AUX](#contributing-to-aux)
  - [Quickstart](#quickstart-1)
  - [Deployment](#deployment-1)

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

### Quickstart

```typescript
import { AptosClient, FaucetClient } from "aptos";
import { AuxClient } from "../src/client";
import { USDC_ETH_WH } from "../src/coin";

const auxClient = new AuxClient(
  "mainnet",
  new AptosClient("https://fullnode.mainnet.aptoslabs.com")
);

const poolClient = auxClient.pool({
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
});
let pool = poolClient.query();
await poolClient.swap({
  coinTypeIn: auxCoin,
  exactAmountIn: DU(2),
  parameters: { slippage: new Bps(50) },
});
pool = poolClient.query();
```

### Walkthrough

Let's breakdown the walkthrough above and showcase some additional features.

```typescript
import { AptosClient, FaucetClient } from "aptos";

const auxClient = new AuxClient("mainnet", new AptosClient("https://fullnode.devnet."))

// You can optionally attach a faucet client. We use devnet because there is no faucet on mainnet.
const auxClient = new AuxClient("devnet", new AptosClient("https://"))

// Initialize your account (only needed if sending txs).
const sender = AptosAccount.fromAptosAccountObject({privateKeyHex: "0xAUXUSER"})

// Set the sender for all future txs to this account. Note you can override this for individual txs
// by passing in `options` or you can set the sender to something else.
auxClient.sender = sender

// Simulate the transaction.
auxClient.simulate = true;

// Change the account you use to simulate transactions. Note, AUX has a default simulator on every
// network, but it will not have coin balances, etc. so you should set this to your own account.
auxClient.simulator = {
   address: "0xAUXSIMULATOR,
   publicKey: new TxnBuilderTypes.Ed25519PublicKey(new HexString("0x...").toUint8Array()) // Ed2551
}

// AuxClientOptions has additional options such as max gas, etc.

// Create a pool client
const poolClient = auxClient.pool({
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
});

// Alternatively
const poolClient = new PoolClient(auxClient, {
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
})
```

## GraphQL

`APTOS_NETWORK=mainnet yarn start:graphql`

- Update/add the appropriate schema in: `typeDefs`
- Run `yarn codegen:graphql` from the `aux-ts` directory
- Update/add resolvers in `resolvers`

## Indexer

First, start up Redis locally.

`APTOS_NETWORK=mainnet yarn start:indexer`

## Deployment

Push to one of the following branches. This can be `main` or your own branch.

- `origin/mainnet`
- `origin/mainnet-beta`
- `origin/testnet`
- `origin/devnet`

Inside the prod box, `cd` into the corresponding directory (e.g. `aux-exchange-mainnet-beta`),
into the `aux-ts` folder, and run this:

### Hard vs. rolling restart

`./scripts/deploy/rolling_restart.sh mainnet-beta`
`./scripts/deploy/hard_restart.sh mainnet-beta`

This will `cd aux-exchange-mainnet`, `git checkout origin/mainnet` and restart PM2 process group named `mainnet`.

Hard restart has more downtime but is cleaner.

### Update the UIs (optional)

If you changed the UI, then to deploy a new version of frontend (UI) you need to:

- in your local `aux-exchange` repo, inside `aux-ts` run `./scripts/update_uis.sh`

### Bouncing the processes

#### Rolling restart

`./rolling_restart.sh <branch>`

Example: `./rolling_restart.sh mainnet`
Example: `./rolling_restart.sh devnet`

#### Hard restart

`./hard_restart.sh <branch>`

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
