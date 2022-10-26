const links = [
    { to: '/', title: "Swap" },
    { to: '/pools', title: "Pools" },
    { to: '/trade', title: "Trade" },
    { to: '/portfolio', title: "Portfolio" }
  ]
window.topnav_links = links 
window.isAux = true

function getConfig() {
    const host = window.location.host
    window.rest_graphql_endpoint = 'https://mainnet.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://mainnet.aux.exchange/graphql'
    if(host.match('mainnet-beta')) {
        window.rest_graphql_endpoint = 'https://mainnet-beta.aux.exchange/graphql'
        window.ws_graphql_endpoint = 'wss://mainnet-beta.aux.exchange/graphql'
    }
    if(host.match('devnet')) {
        window.rest_graphql_endpoint = 'https://devnet.aux.exchange/graphql'
        window.ws_graphql_endpoint = 'wss://devnet.aux.exchange/graphql'
    }
    if(host.match('localhost')) {
        window.rest_graphql_endpoint = 'https://devnet.aux.exchange/graphql'
        window.ws_graphql_endpoint = 'wss://devnet.aux.exchange/graphql'
    }
    if(host.match('testnet')) {
        window.rest_graphql_endpoint = 'https://testnet.aux.exchange/graphql'
        window.ws_graphql_endpoint = 'wss://testnet.aux.exchange/graphql'
    }
    
}

getConfig()

document.title = "AUX DEX"