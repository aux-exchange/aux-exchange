# aux-indexer

## Quickstart

`APTOS_PROFILE=devnet yarn start:indexer`

### Local testing

This is to setup a full local dev environment.

- `redis-server` (or `brew services start redis` if installed with Homebrew)
- `go run ./go-util/aptos/cmd/setup-aux -f`
- `APTOS_PROFILE=localnet yarn sim:live`
- `APTOS_PROFILE=localnet yarn start:graphql`
- `APTOS_PROFILE=localnet yarn start:indexer`

#### Check data is populating in Redis
- `redis-cli`
- `keys *`

#### Subscribe via GraphQL
- Navigate to http://localhost:4000/graphql
- Copy this into Operation panel

```graphql
subscription($marketInputs: [MarketInput!], $resolution: String!) {
  bar(marketInputs: $marketInputs, resolution: "15s") {
    time
    ohlcv {
      open
      high
      low
      close
      volume
    }
  }
}
```

- Copy output of this into Variables panel: `APTOS_PROFILE=localnet yarn metadata`

### Backfill

```sh
poetry install
mkdir data
poetry run python backfill.py
```
