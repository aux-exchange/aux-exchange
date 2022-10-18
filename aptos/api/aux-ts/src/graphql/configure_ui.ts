// run me with npx ts-node ./src/graphql/configure_ui.ts

import fs from 'fs'
import path from 'path'
enum NetworkPorts {
    mainnet = 4000,
    devnet = 4001,
    testnet= 4002
}

const port: keyof typeof NetworkPorts = process.env['APTOS_PROFILE'] as keyof typeof NetworkPorts;

function createNewConfig() {
    const fileContents = `
    window.rest_graphql_endpoint = 'http://localhost:${NetworkPorts[port]}/graphql'
    window.ws_graphql_endpoint = 'ws://localhost:${NetworkPorts[port]}/graphql'
    document.title = 'AUX - ${port}'
    `
    
    fs.rmSync(path.resolve(__dirname, 'client/config.js'))
    fs.writeFileSync(path.resolve(__dirname, 'client/config.js'), fileContents, { encoding: 'utf-8'})   
}

createNewConfig()