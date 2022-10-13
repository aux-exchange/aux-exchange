# Aux Exchange

## Aptos Quickstart with podman

Run `aux-exchange/aptos/testing/run.sh` to start a podman container. The
container will have a local validator with the `aux` contract deployed.

In the container: - Run `./example_amm.sh` to trade the AMM locally - Run `./example_clob.sh` to trade the CLOB locally

The example code is located in `aptos/api/aux-ts/examples`.
The core package is located in `aptos/api/aux-ts`. You can modify
the code and rerun the example scripts in the container.

Run the integration tests with `./test.sh`. Note that the integration tests
pollute the container state so subsequent runs may not be reliable, especially
if you have been interacting with the local validator in other ways.

## Running on localnet manually

`node.js`, `yarn`, `golang`, and `rust` are all necessary to run.

- Install `https://github.com/nvm-sh/nvm`
- `nvm install 18; nvm use 18`
- `npm install -g yarn`
- `yarn set version berry`
- Install [golang](https://go.dev).
- Install [rust](https://www.rust-lang.org)

1. Setup Aptos and deploy AUX to localnet:

   ```sh
   go run ./go-util/aptos/cmd/setup-aux  -f
   ```

1. Run end to end tests:

   ```sh
   cd aptos/api/aux-ts
   APTOS_LOCAL=true yarn test
   ```

1. Publish a local package for examples:

   ```sh
   cd aptos/api/aux-ts
   yarn publish:local
   ```

1. Run examples:

   ```sh
   cd aptos/api/aux-ts/examples
   APTOS_LOCAL=true yarn start:localnet-amm-trader
   APTOS_LOCAL=true yarn start:localnet-clob-trader
   ```

## Using the API

See `aptos/api/aux-ts/examples` for examples of interacting
with the AMM and CLOB.
