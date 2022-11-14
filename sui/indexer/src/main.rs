use anyhow::{anyhow, bail, Context, Result};
use chrono::{DateTime, Utc};
use futures::stream::{SplitSink, SplitStream};
use futures::{SinkExt, StreamExt, TryStreamExt};

use rdkafka::admin::{AdminClient, AdminOptions, NewTopic, TopicReplication};
use rdkafka::client::DefaultClientContext;
use rdkafka::config::ClientConfig;

use rdkafka::producer::{FutureProducer, FutureRecord};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sui_sdk::SuiClient;
use sui_sdk::rpc_types::SuiEventFilter;
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};
use tracing::{debug, info};
use url::Url;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let sui = SuiClient::new("http://127.0.0.1:5001", Some("ws://127.0.0.1:9001"), None).await?;
    let mut subscribe_all = sui
        .event_api()
        .subscribe_event(SuiEventFilter::All(vec![]))
        .await?;
    loop {
        println!("{:?}", subscribe_all.next().await);
    }

    let mut redpanda_config = ClientConfig::new();
    redpanda_config.set("bootstrap.servers", "localhost:9092"); // fixme when running inside docker

    let admin: AdminClient<DefaultClientContext> = redpanda_config.create()?;
    let topics = ["dydx_v3_trades", "dydx_v3_orderbook"];
    info!("Deleting topics {topics:?}");
    admin
        .delete_topics(&topics, &AdminOptions::default())
        .await?;

    info!("Creating topics {topics:?}");
    admin
        .create_topics(
            &[NewTopic::new(
                "dydx_v3_trades",
                1,
                TopicReplication::Fixed(1),
            )],
            &AdminOptions::default(),
        )
        .await?;

    // sink::create_materialize_sink().await?;
    // loop {
    //     if let Err(e) = dydx::create_websocket_source(&websocket_url, &redpanda_config).await {
    //         error!("{e}");
    //     }
    // }
}
