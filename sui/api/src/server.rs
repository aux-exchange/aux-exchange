use async_graphql::{
    http::{playground_source, GraphQLPlaygroundConfig},
    EmptySubscription, Request, Response, Schema, EmptyMutation,
};
use axum::{
    extract::State,
    response::{Html, IntoResponse},
    routing::get,
    Json, Router,
};
use color_eyre::eyre::{eyre, Result};
use std::net::SocketAddr;
use sui_sdk::{types::base_types::ObjectID, SuiClient};
use tower_http::cors::CorsLayer;

use crate::client::AuxClient;
use crate::schema::{AuxSchema, QueryRoot};

async fn graphql_handler(schema: State<AuxSchema>, req: Json<Request>) -> Json<Response> {
    schema.execute(req.0).await.into()
}

async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(GraphQLPlaygroundConfig::new("/graphql")))
}

pub async fn create_server(package: ObjectID) -> Result<()> {
    let sui_client = SuiClient::new("http://127.0.0.1:9000", None, None)
        .await
        .map_err(|err| eyre!(err))?;

    let aux_client = AuxClient {
        sui_client,
        package,
    };

    let schema = Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
        .data(aux_client)
        .finish();

    let app = Router::new()
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .layer(CorsLayer::permissive())
        .with_state(schema);

    println!("Playground: http://devbox:4000/graphql");

    let addr: SocketAddr = "0.0.0.0:4000".parse()?;
    let server = axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(server)
}
