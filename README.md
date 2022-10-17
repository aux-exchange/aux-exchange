# AUX

AUX is a decentralized exchange powered by Aptos. We support the following
features:

- Liquidity pools (AMM)
- Central limit order book (CLOB)
- Router for best execution between AMM and CLOB

## Fees and Rebates

- Liquidity pool fees are set by the pool creator. AUX expects fees to range from
0 bps to 30 bps. All fees are retained by the liquidity providers.
- Central limit order book fees are 2 bps for orders that take liquidity. AUX pays
a 1 bp rebate for orders that add liquidity. 1 bp is retained for the protocol.
- The AUX router does not charge any fees on top of the underlying liquidity pool
or central limit order book fees.

## Start Trading

Navigate to our [web app](https://aux.exchange) to start trading.

See our [code examples](https://github.com/aux-exchange/aux-exchange/tree/main/aptos/api/aux-ts/examples)
to get started interacting with AUX with our API.

## Developer Quickstart with podman

Run `aux-exchange/aptos/testing/run.sh` to start a podman container. The
container will have a local validator with the `aux` contract deployed.

In the container: - Run `./example_amm.sh` to trade the AMM locally - Run `./example_clob.sh` to trade the CLOB locally

The example code is located in `aptos/api/aux-ts/examples`.
The core package is located in `aptos/api/aux-ts`. You can modify
the code and rerun the example scripts in the container.

Run the integration tests with `./test.sh`. Note that the integration tests
pollute the container state so subsequent runs may not be reliable, especially
if you have been interacting with the local validator in other ways.

### Running on localnet manually

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

### Using the API

See `aptos/api/aux-ts/examples` for examples of interacting
with the AMM and CLOB.

### Addresses

| network | contract | address                                                                                                                                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devnet  | deployer | [`0x7af3306d26c59abae84394a781233310617aff2e6ea229fb383db89042be4a74`](https://explorer.aptoslabs.com/account/0x7af3306d26c59abae84394a781233310617aff2e6ea229fb383db89042be4a74?network=devnet)  |
| devnet  | aux      | [`0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a`](https://explorer.aptoslabs.com/account/0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a?network=devnet)  |
| testnet | deployer | [`0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be`](https://explorer.aptoslabs.com/account/0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be?network=testnet) |
| testnet | aux      | [`0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53`](https://explorer.aptoslabs.com/account/0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53?network=testnet) |
