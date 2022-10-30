#!/usr/bin/env bash

WD=~/projects/aux-exchange/aptos/api/aux-ts
cd $WD

if [ ! -z "$(git status --porcelain)" ]
then
    echo $0: "Unclean git directory $WD. Stop."
    exit 1
fi

setup() {
    git checkout origin/$1
    yarn install
    yarn build
}

git fetch

setup "mainnet"
GRAPHQL_PORT=4000 APTOS_PROFILE=mainnet APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mainnet

setup "mainnet-beta"
GRAPHQL_PORT=4001 APTOS_PROFILE=mainnet APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mainnet-beta

setup "testnet"
GRAPHQL_PORT=4002 APTOS_PROFILE=testnet APTOS_NETWORK=testnet yarn pm2:graphql --name testnet

setup "devnet"
GRAPHQL_PORT=4003 APTOS_PROFILE=devnet APTOS_NETWORK=devnet yarn pm2:graphql --name devnet

setup "devnet-beta"
GRAPHQL_PORT=4004 APTOS_PROFILE=devnet APTOS_NETWORK=devnet yarn pm2:graphql --name devnet

setup "vybe"
GRAPHQL_PORT=4004 APTOS_PROFILE=mainnet APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name vybe

setup "atrix"
GRAPHQL_PORT=4005 APTOS_PROFILE=mainnet APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name atrix

setup "mojito"
GRAPHQL_PORT=4006 APTOS_PROFILE=mainnet APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mojito
