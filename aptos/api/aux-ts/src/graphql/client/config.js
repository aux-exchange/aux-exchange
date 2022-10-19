
function getConfig() {
    const host = window.location.host
    window.rest_graphql_endpoint = 'https://dex.mojito.markets/graphql'
    window.ws_graphql_endpoint = 'wss://dex.mojito.markets/graphql'
    if(host.match('devnet')) {
        window.rest_graphql_endpoint = 'https://dex.mojito.markets/graphql'
        window.ws_graphql_endpoint = 'wss://dex.mojito.markets/graphql'
    }
    if(host.match('localhost')) {
        window.rest_graphql_endpoint = 'https://devnet.aux.exchange/graphql'
        window.ws_graphql_endpoint = 'wss://devnet.aux.exchange/graphql'
    }
    if(host.match('testnet')) {
        window.rest_graphql_endpoint = 'https://dex.mojito.markets/graphql'
        window.ws_graphql_endpoint = 'wss://dex.mojito.markets/graphql'
    }
    
}

getConfig()

document.title = "Mojito"