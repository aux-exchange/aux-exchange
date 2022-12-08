use anyhow::{anyhow, bail, Context, Result};
use chrono::serde::ts_microseconds;
use chrono::{DateTime, Utc};
use clickhouse_rs::types::RowBuilder;
use futures::stream::{SplitSink, SplitStream};
use futures::{SinkExt, StreamExt, TryStreamExt};

use rdkafka::admin::{AdminClient, AdminOptions, NewTopic, TopicReplication};
use rdkafka::client::DefaultClientContext;
use rdkafka::config::{ClientConfig, RDKafkaLogLevel};
use rdkafka::Message;

use rdkafka::consumer::{CommitMode, Consumer, StreamConsumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sui_sdk::rpc_types::SuiEventFilter;
use sui_sdk::SuiClient;
use tokio::net::TcpStream;
use tokio_postgres::NoTls;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};
use tracing::{debug, info, warn};
use url::Url;

use clickhouse_rs::{row, types::Block, Pool};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Swap {
    kind: String,
    pool_type: String,
    sequence_number: u64,
    #[serde(with = "ts_microseconds")]
    timestamp: DateTime<Utc>,
    sender: String,
    coin_type_in: String,
    coin_type_out: String,
    fee_bps: u16,
    amount_in: f64,
    amount_out: f64,
    reserve_in: f64,
    reserve_out: f64,
}

async fn materialize_sink() -> Result<()> {
    let (client, connection) =
        tokio_postgres::connect("host=localhost port=6875 user=materialize", NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    client
        .query("DROP SOURCE IF EXISTS swaps CASCADE;", &[])
        .await?;

    client
        .query(
            "
        CREATE SOURCE raw_swaps
        FROM KAFKA BROKER 'redpanda:29092' TOPIC 'swaps'
        FORMAT TEXT;
        ",
            &[],
        )
        .await?;

    client
        .query(
            "
            CREATE VIEW swaps AS
            SELECT
                (text::jsonb)->>'sender' AS sender,
                (text::jsonb)->>'coinTypeIn' AS coinTypeIn,
                (text::jsonb)->>'coinTypeOut' AS coinTypeOut,
                ((text::jsonb)->>'amountIn')::float AS amountIn,
                ((text::jsonb)->>'amountOut')::float AS amountOut,
                ((text::jsonb)->>'timestamp')::timestamptz AS timestamp
            FROM raw_swaps;
            ",
            &[],
        )
        .await?;

    client
        .query(
            "create materialized view sum_amount_in as select sum(amountIn) from swaps;",
            &[],
        )
        .await?;
    Ok(())
}

async fn clickhouse_sink() -> Result<()> {
    let database_url = "tcp://localhost:9000?compression=lz4";

    let ddl = r"
    CREATE TABLE IF NOT EXISTS swaps (
        kind String,
        pool_type String,
        sequence_number UInt64,
        timestamp DateTime64,
        sender String,
        coin_type_in String,
        coin_type_out String,
        fee_bps UInt16,
        amount_in: f64,
        amount_out: f64,
        reserve_in: f64,
        reserve_out: f64
    ) Engine = ReplacingMergeTree(pool_type, sequence_number)
    ORDER BY pool_type,
        sequence_number;
    ";

    let mut redpanda_config = ClientConfig::new();
    redpanda_config.set("bootstrap.servers", "localhost:9092"); // fixme when running inside docker

    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", "localhost:9092")
        .set("group.id", "clickhouse-sink-3")
        .set_log_level(RDKafkaLogLevel::Debug)
        .create()
        .expect("Consumer creation failed");

    consumer
        .subscribe(&["swaps"])
        .expect("Can't subscribe to specified topics");

    // Create the outer pipeline on the message stream.
    let mut block = Block::with_capacity(125791);
    // let stream_processor = consumer.stream().try_for_each(|borrowed_message| {
    //     async move {
    //         let owned_message = borrowed_message.detach();

    //         let s = owned_message.payload_view::<str>().unwrap().unwrap();
    //         let swap: Swap = serde_json::from_str(s).unwrap();
    //         println!("{:?}", swap);

    //         block.push(row! {
    //             kind: swap.kind,
    //             pool_type: swap.pool_type,
    //             sequence_number: swap.sequence_number,
    //             // timestamp: swap.timestamp,
    //             sender: swap.sender,
    //             coin_type_in: swap.coin_type_in,
    //             coin_type_out: swap.coin_type_out,
    //             fee_bps: swap.fee_bps,
    //             amount_in: swap.amount_in,
    //             amount_out: swap.amount_out,
    //             reserve_in: swap.reserve_in,
    //             reserve_out: swap.reserve_out,
    //         }).unwrap();
    //         // info!("{}", "got data");
    //         Ok(())
    //     }
    // });

    // stream_processor.await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    // env_logger::init();
    materialize_sink().await?;
    // clickhouse_sink().await?;

    Ok(())

    // let sui = SuiClient::new("http://127.0.0.1:5001", Some("ws://127.0.0.1:9001"), None).await?;
    // let sui = SuiClient::new(
    //     "https://fullnode.devnet.sui.io:443",
    //     Some("wss://fullnode.devnet.sui.io:443"),
    //     None,
    // )
    // .await?;
    // let mut subscribe_all = sui
    //     .event_api()
    //     .subscribe_event(SuiEventFilter::All(vec![]))
    //     .await?;
    // loop {
    //     println!("{:?}", subscribe_all.next().await);
    // }

    // let mut redpanda_config = ClientConfig::new();
    // redpanda_config.set("bootstrap.servers", "localhost:9092"); // fixme when running inside docker

    // let admin: AdminClient<DefaultClientContext> = redpanda_config.create()?;
    // let topics = ["dydx_v3_trades", "dydx_v3_orderbook"];
    // info!("Deleting topics {topics:?}");
    // admin
    //     .delete_topics(&topics, &AdminOptions::default())
    //     .await?;

    // info!("Creating topics {topics:?}");
    // admin
    //     .create_topics(
    //         &[NewTopic::new(
    //             "dydx_v3_trades",
    //             1,
    //             TopicReplication::Fixed(1),
    //         )],
    //         &AdminOptions::default(),
    //     )
    //     .await?;

    // sink::create_materialize_sink().await?;
    // loop {
    //     if let Err(e) = dydx::create_websocket_source(&websocket_url, &redpanda_config).await {
    //         error!("{e}");
    //     }
    // }
}
