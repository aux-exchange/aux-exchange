# aux-indexer

## Quickstart

This is to setup a full local dev environment.

```sh
# cwd: `aux-exchange`
redis-server  # or `brew services start redis` if installed with Homebrew
go run ./go-util/aptos/cmd/setup-aux -f

# cwd: `aux-exchange/aptos/api/aux-ts`
APTOS_PROFILE=localnet yarn sim:live
APTOS_PROFILE=localnet yarn start:graphql
APTOS_PROFILE=localnet yarn start:indexer
```

### Check data is populating in Redis

```sh
redis-cli keys \*
```

### Subscribe via GraphQL

- Navigate to http://localhost:4000/graphql
- Copy this into Operation panel

```graphql
subscription ($marketInputs: [MarketInput!], $resolution: String!) {
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

## Other commands

<details>
### Backfill

```sh
poetry install
mkdir data
poetry run python backfill.py
```

</details>
