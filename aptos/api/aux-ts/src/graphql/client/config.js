const config = {
  appTitle: 'Mojito',
  documentTitle: 'Mojito',
  isAux: false,
  blockchainUrl: 'https://explorer.aptoslabs.com',
  environments: {
    mainnet: {
      title: 'Mainnet',
      url: 'https://dex.mojito.markets/',
      rest_graphql_endpoint: 'https://dex.mojito.markets/graphql',
      ws_graphql_endpoint: 'wss://dex.mojito.markets/graphql',
      contractAddress: '0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541',
      deployerAddress: '0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c'
    },
    localnet: {
      title: 'Localnet',
      url: 'http://localhost:5173',
      rest_graphql_endpoint: 'https://devnet.aux.exchange/graphql',
      ws_graphql_endpoint: 'wss://devnet.aux.exchange/graphql',
      contractAddress: '0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a',
      deployerAddress: '0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a'
    }   
  },
  navLinks: [
    {
      title: 'Swap',
      to: '/',
      disabled: false
    },
    {
      title: 'Pools',
      to: '/pools',
      disabled: false
    },
    {
      title: 'Trade (Coming Soon)',
      to: '/trade',
      disabled: true
    },
    {
      title: 'Portfolio (Coming Soon)',
      to: '/portfolio',
      disabled: true
    }
  ],
  socialLinks: [
    {
      title: 'Github',
      url: 'https://github.com/aux-exchange/aux-exchange',
      disabled: false
    },
    {
      title: 'Twitter',
      url: 'https://twitter.com/auxexchange',
      disabled: false
    },
    {
      title: 'Discord',
      url: 'http://discord.gg/mxRa3fH72z',
      disabled: false
    },
    {
      title: 'Telegram',
      url: 'https://t.me/AuxDAO',
      disabled: false
    }
  ]
}

function initializeConfig() {
  window.config = config
  document.title = config.documentTitle

  const environments = config.environments
  window.currentEnvironment = Object.keys(environments).map(e => environments[e]).find((n) => window.location.origin === n.url)

  if (!window.currentEnvironment) {
    throw new Error('Unknown Environment', window.location.host)
  }

  window.rest_graphql_endpoint = window.currentEnvironment.rest_graphql_endpoint
  window.ws_graphql_endpoint = window.currentEnvironment.ws_graphql_endpoint
}
initializeConfig()
  