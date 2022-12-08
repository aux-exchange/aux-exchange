# dydx-kappature

kappature => Kappa Architecutre
kappature => Capture

## Dependencies
1. docker (with compose support)
2. rust toolchain

(sort of optional)
3. poetry (python package management)


## Quickstart

```bash
docker compose up -d  # this will stand up all your services
cargo run

# observe the data
docker exec -it redpanda rpk --brokers=localhost:9092 topic list
docker exec -it redpanda rpk --brokers=localhost:9092 topic
	\ consume dydx_v3_orderbook  # l2 updates
docker exec -it redpanda rpk --brokers=localhost:9092 topic
	\ consume dydx_v3_trades  # trade updates

# query the data
docker compose run mzcli

# once inside materialize play around with the queries in `sink.rs`
# or write your own queries
```

## Tl;dr

`source.rs` hooks up a websocket connection to two dydx channels

the initial websocket response is a batch of historical data.
in the case of `v3_trades` this is a bunch of historical trades

subsequent websocket responses are realtime updates of trades as they
happen

all events are archived into redpanda with "historical" or "realtime"
tag

`sink.rs` then pipes this data in `materialize`, which intuitively 
computes a "realtime SQL table" 

here the realtime table is 6s bars, but of course can be configurable

note that SQL is the universal interface for `materialize` -- but the
code is actually compiling to something very unlike SQL

there is something akin to a stream processor (consumer group) that
basically runs code



