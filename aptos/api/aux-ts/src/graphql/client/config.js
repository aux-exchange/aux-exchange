function getConfig() {
  const host = window.location.host;
  window.rest_graphql_endpoint = "https://aux.exchange/graphql";
  window.ws_graphql_endpoint = "wss://aux.exchange/graphql";
  if (host.match("devnet")) {
    window.rest_graphql_endpoint = "https://devnet.aux.exchange/graphql";
    window.ws_graphql_endpoint = "wss://devnet.aux.exchange/graphql";
  }
  if (host.match("testnet")) {
    window.rest_graphql_endpoint = "https://testnet.aux.exchange/graphql";
    window.ws_graphql_endpoint = "wss://testnet.aux.exchange/graphql";
  }
  if (host.match("localhost:4000")) {
    window.rest_graphql_endpoint = "http://localhost:4000/graphql";
    window.ws_graphql_endpoint = "ws://localhost:4000/graphql";
  }
}

getConfig();

document.title = "DEX";
