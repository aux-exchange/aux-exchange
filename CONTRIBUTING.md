# Contributing

Come and build the decentralized universal exchange with us! :rocket:

Fork this repo, make the changes, and send a PR to the main branch. Run into issues? Ping us on [discord](https://discord.gg/mxRa3fH72z) or [Telegram](https://t.me/AuxDAO) or raise an issue here on github.

## Contributors on MS Windows

**Contributors on MS Windows may have difficulties downloading or checking out the codes**: aux.exchange started on \*nix, and we are deep into the development cycle to find that `aux` is a reserved name on MS Windows ([see here for details](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)). We are still in a build-out phase, but will push out a reorganisation of the repo to fix this later. Stay tuned!.

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

## Quickstart

### Local Development Quickstart

Make sure you have installed the above pre-requisites.

1. Setup Aptos and deploy AUX to localnet:

   ```sh
   go run ./go-util/aptos/cmd/setup-aux  -f --network "local"
   ```

2. Run end to end tests:

   ```sh
   cd aptos/api/aux-ts
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

**NOTE**: all operations are assumed to run in the root folder of the repository.

### Account/Address necessary

The contract code needs to sign for itself, and therefore deployed into a resource account. The original creator of the resource account is the first owner of the exchange, and can make certain changes/updates to the account. The aux resource account is always created with seed "aux".

Given an owner address, the aux address can be verified by the following go binary

```sh
go run ./go-util/aptos/cmd/calculate-resource-address -a "<owner-address>" -s aux
```

#### Set up Aptos Profile

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

### Deployment

During the deployment process, the `setup-aux` command will delete the `.move` folder in the user's home directory (to remove all downloaded move dependencies) and `build` folder in the contract directory (to remove all compiled codes).

#### First Time Deploy

**IF aux resource account is not created yet and the contract is not deployed**, use the following command to create the resource account and deploy the contract

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet # network to deploy
```

#### Update

**IF aux resource account is created and the contract is already deployed**, do an update

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet --redeploy # require redeploy
```
