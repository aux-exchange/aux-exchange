const links = [
  { to: '/', title: 'Swap' },
  { to: '/pools', title: 'Pools' },
  { to: '/trade', title: 'Trade' },
  { to: '/portfolio', title: 'Portfolio' }
]
window.topnav_links = links
window.isAux = true
window.appTitle = 'AUX'

function getConfig() {
  const host = window.location.host
  if (host.match('devnet')) {
    window.rest_graphql_endpoint = 'https://devnet.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://devnet.aux.exchange/graphql'
  } else if (host.match('localhost')) {
    window.rest_graphql_endpoint = 'https://devnet.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://devnet.aux.exchange/graphql'
  } else if (host.match('testnet')) {
    window.rest_graphql_endpoint = 'https://testnet.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://testnet.aux.exchange/graphql'
  } else if (host.match('mainnet-beta')) {
    window.rest_graphql_endpoint = 'https://mainnet-beta.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://mainnet-beta.aux.exchange/graphql'
  } else if (host.match('mainnet')) {
    window.rest_graphql_endpoint = 'https://mainnet.aux.exchange/graphql'
    window.ws_graphql_endpoint = 'wss://mainnet.aux.exchange/graphql'
  } else {
    throw new Error('Unknown host', host)
  }
}

getConfig()

document.title = 'AUX DEX'
