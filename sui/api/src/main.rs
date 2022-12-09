//! Example async-graphql application.
//!
//! Run with
//!
//! ```not_rust
//! cd examples && cargo run -p example-async-graphql
//! ```

use async_graphql::{
    http::{playground_source, GraphQLPlaygroundConfig},
    Context, EmptyMutation, EmptySubscription, Enum, Error, Interface, Object, Request, Response,
    Schema,
};
use aux_rs::schema::{Curve, Pool, PoolInput};
use aux_rs::{
    client::{AuxClient, CoinClient, PoolClient, SuiObject},
    schema::ConstantProductPool,
};
use axum::{
    extract::State,
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use color_eyre::eyre::{bail, eyre, Result};
use nom::{
    bytes::complete::{tag, take_until, take_while},
    character::is_alphanumeric,
    combinator::rest,
    multi::separated_list0,
    sequence::{delimited, pair},
    IResult,
};
use std::{net::SocketAddr, str::FromStr};
use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
use sui_sdk::{types::base_types::ObjectID, SuiClient};

pub type AuxSchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

pub struct QueryRoot;
#[Object]
impl QueryRoot {
    async fn pool<'a>(&self, ctx: &Context<'a>, pool_input: PoolInput) -> Result<Pool> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.find_pool(&pool_input).await
    }

    async fn pools<'a>(&self, ctx: &Context<'a>) -> Result<Vec<Pool>> {
        let aux_client = ctx.data_unchecked::<AuxClient>();
        aux_client.pools().await
    }
}

async fn graphql_handler(schema: State<AuxSchema>, req: Json<Request>) -> Json<Response> {
    schema.execute(req.0).await.into()
}

async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(GraphQLPlaygroundConfig::new("/")))
}

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;

    let sui_client = SuiClient::new("http://127.0.0.1:9000", None, None)
        .await
        .map_err(|err| eyre!(err))?;

    let package = ObjectID::from_str("0x9f23cae250f7b65119c47da699e39b193ce7305b")
        .map_err(|err| eyre!(err))?;

    let keystore = Keystore::from(
        FileBasedKeystore::new(
            &dirs::home_dir()
                .ok_or(eyre!("Failed to get home dir."))?
                .join(".sui")
                .join("sui_config")
                .join("sui.keystore"),
        )
        .map_err(|err| eyre!(err))?,
    );

    let signer = *keystore
        .addresses()
        .last()
        .ok_or(eyre!("Keystore is empty."))?;

    let aux_client = AuxClient {
        sui_client,
        package,
        signer,
    };

    let schema = Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
        .data(aux_client)
        .finish();

    let app = Router::new()
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .with_state(schema);

    println!("Playground: http://devbox:3000/graphql");

    let addr: SocketAddr = "0.0.0.0:3000".parse()?;
    let server = axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(server)
}
