//! Example async-graphql application.
//!
//! Run with
//!
//! ```not_rust
//! cd examples && cargo run -p example-async-graphql
//! ```

use async_graphql::{
    http::{playground_source, GraphQLPlaygroundConfig}, EmptySubscription, Request, Response, Schema,
};
use aux_rs::schema::{
    AuxSchema, MutationRoot, QueryRoot
};
use aux_rs::client::AuxClient;
use axum::{
    extract::State,
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use color_eyre::eyre::{eyre, Result};
use std::{net::SocketAddr, str::FromStr};
use sui_keys::keystore::{AccountKeystore, FileBasedKeystore, Keystore};
use sui_sdk::{types::base_types::ObjectID, SuiClient};

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

    let package = ObjectID::from_str("0xe7a1a236ac1093d664d5566f5a7caecbb439bc73")
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
    };

    let schema = Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .data(aux_client)
        .finish();

    let app = Router::new()
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .with_state(schema);

    println!("Playground: http://devbox:4000/graphql");

    let addr: SocketAddr = "0.0.0.0:4000".parse()?;
    let server = axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(server)
}
