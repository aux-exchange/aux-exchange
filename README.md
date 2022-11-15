# AUX

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

## Using the API

See [`aptos/api/aux-ts/examples`](./aptos/api/aux-ts/examples) for examples of interacting
with the AMM and CLOB through typescript.

## Quickstart

See [Quickstart](./CONTRIBUTING.md#Quickstart) for tutorials on how to run a local instance or in a container.

## Deployment

See [deployment](./CONTRIBUTING.md#Deployment) for how to deploy the contract.

## Addresses

| network | contract | address                                                                                                                                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| devnet  | deployer | [`0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a`](https://explorer.aptoslabs.com/account/0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a?network=devnet)  |
| devnet  | aux      | [`0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a`](https://explorer.aptoslabs.com/account/0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a?network=devnet)  |
| testnet | deployer | [`0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be`](https://explorer.aptoslabs.com/account/0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be?network=testnet) |
| testnet | aux      | [`0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53`](https://explorer.aptoslabs.com/account/0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53?network=testnet) |
| mainnet | deployer | [`0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c`](https://explorer.aptoslabs.com/account/0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c?network=mainnet) |
| mainnet | aux      | [`0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541`](https://explorer.aptoslabs.com/account/0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541?network=mainnet) |

## Contributing

See [Contributing](./CONTRIBUTING.md).
