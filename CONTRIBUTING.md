# Contributing

- [Contributing](#contributing)
  - [Prerequisites](#prerequisites)
  - [Structure of the Code](#structure-of-the-code)
  - [Contract](#contract)
    - [Local Development Quickstart](#local-development-quickstart)
    - [Local Development Quickstart with Podman](#local-development-quickstart-with-podman)
  - [Deployment](#deployment)
    - [Account/Address necessary](#accountaddress-necessary)
    - [Set up Aptos Profile](#set-up-aptos-profile)
    - [First Time Deploy](#first-time-deploy)
    - [Update](#update)
  - [Deployer](#deployer)
    - [Constraints](#constraints)
    - [Details](#details)
  - [DApp Development (UI + GraphQL)](#dapp-development-ui--graphql)
    - [Deploy to devnet step-by-step](#deploy-to-devnet-step-by-step)
    - [Update UIs (only if needed)](#update-uis-only-if-needed)
    - [Update GraphQL (only if needed)](#update-graphql-only-if-needed)
    - [Indexer](#indexer)
    - [Deployment](#deployment-1)
    - [Hard vs. rolling restart](#hard-vs-rolling-restart)
    - [Bouncing the processes](#bouncing-the-processes)
      - [Rolling restart](#rolling-restart)
      - [Hard restart](#hard-restart)
  - [Contributors on MS Windows](#contributors-on-ms-windows)
  - [Typescript Examples](#typescript-examples)

Come and build the decentralized universal exchange with us! :rocket:

Fork this repo, make the changes, and send a PR to the main branch. Run into issues? Ping us on [discord](https://discord.gg/mxRa3fH72z) or [Telegram](https://t.me/AuxDAO) or raise an issue here on github.

## Prerequisites

Install the following tools (if not already installed).

- rust
  ```sh
  # Install rust (see https://www.rust-lang.org)
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  ```
- go (for utilities to deploy the contract and auto generate code etc)
  ```sh
  # Install go (see https://go.dev and https://github.com/stefanmaric/g)
  curl -sSL https://git.io/g-install | sh -s
  source ~/.bashrc
  g install latest
  ```
- node.js (for frontend)
  ```sh
  # Install and enable nvm (see https://github.com/nvm-sh/nvm#install--update-script)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
  source ~/.bashrc
  nvm install 18
  nvm use 18
  corepack enable
  yarn set version berry
  echo 'nvm use 18; corepack enable' >> ~/.bashrc
  ```
- yarn
  ```sh
  yarn install
  ```
- rust support softwares
  ```sh
  sudo apt install build-essential clang pkg-config libssl-dev
  ```

Aptos cli is also needed, after rust is installed. Either use the pre-compiled binaries following the instructures from [here](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli),
or build from source with:

```sh
RUSTFLAGS="--cfg tokio_unstable" cargo install --git https://github.com/aptos-labs/aptos-core.git --rev <LATEST_RELEASE_TAG> aptos
```

(rust is tricky and the dependencies often vary from platform/os to platform/os. Feel free to reach out to us on [discord](https://discord.gg/mxRa3fH72z) or raise an issue)

## Structure of the Code

- [aptos/contrat/aux](./aptos/contract/aux) contains the main contract code.
- [aptos/contract/deployer](./aptos/contract/deployer) contains the code/rust binary to deploy the code
- [aptos/api/aux-ts](./aptos/api/aux-ts) contains all the typescript/javascript/nodejs client.
- [aptos/testing](./aptos/testing) contains podman based containerized testing.
- [go-util](./go-util) contains deploy/code-gen utilities.
- [docs](./docs/) contains documentation on math behind some of the contracts.

## Contract

### Local Development Quickstart

Make sure you have installed the above pre-requisites and `local` profile setup (you can initiate one by running the `aptos init` command).

1. Setup Aptos and deploy AUX to localnet:

   ```sh
   # cwd: aux-exchange
   go run ./go-util/aptos/cmd/setup-aux  -f --network "local"
   ```

2. Run end to end tests:

   ```sh
   cd aptos/api/aux-ts
   # cwd: aux-exchange/aptos/api/aux-ts
   APTOS_NETWORK="local" yarn test
   ```

### Local Development Quickstart with Podman

Run `aux-exchange/aptos/testing/run.sh` to start a podman container. The
container will have a local validator with the `aux` contract deployed.

In the container: - Run `./example_amm.sh` to trade the AMM locally - Run `./example_clob.sh` to trade the CLOB locally

The example code is located in `aptos/api/aux-ts/examples`.
The core package is located in `aptos/api/aux-ts`. You can modify
the code and rerun the example scripts in the container.

Run the integration tests with `./test.sh`. Note that the integration tests
pollute the container state so subsequent runs may not be reliable, especially
if you have been interacting with the local validator in other ways.

## Deployment

Below are details on how to deploy AUX smart contracts to devnet or mainnet
ONLY. For local development, follow the quickstart above.

To understand why some of these are needed, see the [deployer](#deployer) section.

**NOTE**: all operations are assumed to run in the root folder of the repository.

### Account/Address necessary

The contract code needs to sign for itself, and therefore deployed into a resource account. The original creator of the resource account is the first owner of the exchange, and can make certain changes/updates to the account. The aux resource account is always created with seed "aux".

Given an owner address, the aux address can be verified by the following go binary

```sh
go run ./go-util/aptos/cmd/calculate-resource-address -a "<owner-address>" -s aux
```

### Set up Aptos Profile

A global aptos profile for the desired network should be initialized before deployment.

```sh
# set aptos to use global profile
aptos config set-global-config --config-type global
```

Make sure profile is in the global config (on linux and mac, this should be `$HOME/.aptos/config.yaml`) - below is an example of the config with `devnet` profile setup.

```yaml
profiles:
  devnet:
    private_key: "0x12345678" # <private key hex string>
    public_key: "0x98765432" # <public key hex string>
    account: abcdefg # <account address hex string>
    rest_url: "https://fullnode.devnet.aptoslabs.com/v1" # <url to the rest endpoint>
    faucet_url: ""
```

If the profile is not there, you can initiate one by using the `aptos init` command.

During the deployment process, the `setup-aux` command will delete the `.move` folder in the user's home directory (to remove all downloaded move dependencies) and `build` folder in the contract directory (to remove all compiled codes).

### First Time Deploy

**IF aux resource account is not created yet and the contract is not deployed**, use the following command to create the resource account and deploy the contract

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet # network to deploy
```

### Update

**IF aux resource account is created and the contract is already deployed**, do an update

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet --redeploy # require redeploy
```

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

## DApp Development (UI + GraphQL)

### Deploy to devnet step-by-step

```sh
git push origin feat/my-new-feature:devnet -f
ssh <YOUR USERNAME>@devbox
ssh prod@<...>
devnet  # aliases to cd ~/aux-exchange-devnet/aptos/api/aux-ts
./scripts/deploy/hard_restart.sh devnet
# You're done!
```

### Update UIs (only if needed)

If you changed the UI, then to deploy a new version of frontend (UI) you need to:

- set two env vars, `AUX_EXCHANGE` and `AUX_FRONTEND` corresponding to where your local repos live
  - e.g. `AUX_EXCHANGE=~/projects/aux-exchange`
  - e.g. `AUX_FRONTEND=~/projects/aux-frontend`
- in your local `aux-exchange` repo, inside `aux-ts` run `./scripts/update_uis.sh`


### Update GraphQL (only if needed)

`APTOS_NETWORK=mainnet yarn start:graphql`

- Update/add the appropriate schema in: `typeDefs`
- Run `yarn codegen:graphql` from the `aux-ts` directory
- Update/add resolvers in `resolvers`

### Indexer

Make sure you have Redis running on the box you're starting the indexer on.

`APTOS_NETWORK=mainnet yarn start:indexer`

### Deployment

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

### Bouncing the processes

#### Rolling restart

`./rolling_restart.sh <branch>`

Example: `./rolling_restart.sh mainnet`
Example: `./rolling_restart.sh devnet`

#### Hard restart

`./hard_restart.sh <branch>`

## Contributors on MS Windows

**Contributors on MS Windows may have difficulties downloading or checking out the codes**: aux.exchange started on \*nix, and we are deep into the development cycle to find that `aux` is a reserved name on MS Windows ([see here for details](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)). We are still in a build-out phase, but will push out a reorganisation of the repo to fix this later. Stay tuned!.

## Typescript Examples

To contribute a typescript example using the SDK:

1. Add the example under `aptos/api/aux-ts/examples`
2. Add a run script to `aptos/api/aux-ts/package.json`:

  ```json
  "scripts": {
    "start:my-example": "APTOS_NETWORK=<devnet|localnet|mainnet> ts-node examples/my-example.ts"
  }
  ```

3. Run the example from inside `aptos/api/aux-ts` with:

  ```shell
  yarn start:my-example
  ```
