# AUX

## 🚀🚀🚀 Status Update March 17, 2023

We have decided to cease the development on [aux.exchange](https://aux.exchange). It has been a fun ride and we are honored to be part of amazing aptos community.

We will leave the website up for a while, there is also instruction at the end of the README to run the website on your own. Feel free to poke around the codes, and have fun!

## Table of Content

- [AUX](#aux)
  - [Introduction](#introduction)
  - [Fees and Rebates](#fees-and-rebates)
  - [Start Trading](#start-trading)
  - [Typescript SDK](#typescript-sdk)
  - [Addresses](#addresses)
  - [Contributing to AUX](#contributing-to-aux)
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

## Aptos

### Typescript SDK

We provide a typescript SDK for AUX exchange on Aptos. Also known as `aux-ts`.

See [`aptos/api/aux-ts/examples`](./aptos/api/aux-ts/examples) for examples of interacting
with the AMM and CLOB through typescript.

In particular, we recommend starting with `devnet-amm-instructions.ts`.

### Addresses

| network | contract | address                                                                                                                                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devnet  | deployer | [`0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a`](https://explorer.aptoslabs.com/account/0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a?network=devnet)  |
| devnet  | aux      | [`0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a`](https://explorer.aptoslabs.com/account/0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a?network=devnet)  |
| testnet | deployer | [`0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be`](https://explorer.aptoslabs.com/account/0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be?network=testnet) |
| testnet | aux      | [`0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53`](https://explorer.aptoslabs.com/account/0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53?network=testnet) |
| mainnet | deployer | [`0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c`](https://explorer.aptoslabs.com/account/0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c?network=mainnet) |
| mainnet | aux      | [`0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541`](https://explorer.aptoslabs.com/account/0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541?network=mainnet) |

## Contributing to AUX

See [Contributing](./CONTRIBUTING.md).

### Quickstart

See [Quickstart](./CONTRIBUTING.md#Quickstart) for tutorials on how to run a local instance or in a container.

### Deployment

See [deployment](./CONTRIBUTING.md#Deployment) for how to deploy the contract.

## Run a local version of the UI

The web app of aux.exchange is a pure client side web application, located at [firebase/hosting/swap-trading](./firebase/hosting/swap-trading).

The UI can be launched by any standard web server that can serve static files. An example in golang is provided at [here](./firebase/hosting/swap-trading/serve.go).

The golang example can also be run directly if golang>=1.19 is setup:

```sh
go run github.com/aux-exchange/aux-exchange/firebase/hosting/swap-trading@latest
```

The default port is 5173, which can be changed by `-port` option.
