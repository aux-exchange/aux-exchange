const config = {
  appTitle: 'AUX',
  documentTitle: 'AUX Exchange',
  isAux: true,
  blockchainUrl: 'https://explorer.aptoslabs.com',
  environments: {
    mainnet: {
      title: 'Mainnet',
      url: 'https://mainnet.aux.exchange',
      contractAddress:
        '0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541',
      deployerAddress:
        '0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c',
      network: 'mainnet'
    },
    'mainnet-beta': {
      title: 'Mainnet Beta (Unstable)',
      url: 'https://mainnet-beta.aux.exchange',
      contractAddress:
        '0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541',
      deployerAddress:
        '0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c',
      network: 'mainnet'
    },
    testnet: {
      title: 'Testnet',
      url: 'https://testnet.aux.exchange',
      contractAddress:
        '0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53',
      deployerAddress:
        '0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be',
      network: 'testnet'
    },
    devnet: {
      title: 'Devnet',
      url: 'https://devnet.aux.exchange',
      contractAddress:
        '0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a',
      deployerAddress:
        '0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a',
      network: 'devnet'
    },
    localnet: {
      title: 'Mainnet-Local',
      url: 'http://localhost:5173',
      contractAddress:
        '0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a',
      deployerAddress:
        '0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a',
      network: 'mainnet'
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
      title: 'Trade',
      to: '/trade',
      disabled: false
    },
    {
      title: 'Portfolio',
      to: '/portfolio',
      disabled: false
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
  window.currentEnvironment = Object.keys(environments)
    .map((e) => environments[e])
    .find((n) => window.location.origin === n.url)

  if (!window.currentEnvironment) {
    // throw new Error('Unknown Environment', window.location.host)
    window.currentEnvironment = environments.mainnet
  }
}
initializeConfig()
