
function getConfig() {
    const host = window.location.host
    window.rest_graphql_endpoint = 'https://localhost:4000/graphql'
    window.ws_graphql_endpoint = 'wss://localhost:4000/graphql'
    if(host.match('devnet')) {
        window.rest_graphql_endpoint = 'https://localhost:4001/graphql'
        window.ws_graphql_endpoint = 'wss://localhost:4001/graphql'
    }
    if(host.match('localhost:4000')) {
        window.rest_graphql_endpoint = 'https://localhost:4000/graphql'
        window.ws_graphql_endpoint = 'wss://localhost:4000/graphql'
    }
    if(host.match('testnet')) {
        window.rest_graphql_endpoint = 'https://localhost:4002/graphql'
        window.ws_graphql_endpoint = 'wss://localhost:4002/graphql'
    }
    
}

getConfig()

document.title = "DEX"