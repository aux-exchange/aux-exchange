
function getConfig() {
    const host = window.location.host
    window.rest_graphql_endpoint = 'https://aptos-mainnet.atrix.finance/graphql'
    window.ws_graphql_endpoint = 'wss://aptos-mainnet.atrix.finance/graphql'
    if(host.match('devnet')) {
        window.rest_graphql_endpoint = 'https://aptos-mainnet.atrix.finance/graphql'
        window.ws_graphql_endpoint = 'wss://aptos-mainnet.atrix.finance/graphql'
    }
    if(host.match('localhost')) {
        window.rest_graphql_endpoint = 'https://aptos-mainnet.atrix.finance/graphql'
        window.ws_graphql_endpoint = 'wss://aptos-mainnet.atrix.finance/graphql'
    }
    if(host.match('testnet')) {
        window.rest_graphql_endpoint = 'https://aptos-mainnet.atrix.finance/graphql'
        window.ws_graphql_endpoint = 'wss://aptos-mainnet.atrix.finance/graphql'
    }
    
}

getConfig()

document.title = "ATRIX"