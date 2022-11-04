#!/usr/bin/env bash

hard_restart() {
    cd ~/aux-exchange-$1/aptos/api/aux-ts
    git fetch
    if [ ! -z "$(git status --porcelain)" ]; then
        echo $0: "Unclean git directory $(pwd). Stop."
        exit 1
    fi
    git checkout origin/$1
    yarn install
    yarn build
    pm2 delete $1
    pm2 flush $1
    pm2 reloadLogs

    # graphql
    if [ $1 == "mainnet" ]; then
        GRAPHQL_PORT=4000 APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mainnet
    elif [ $1 == "mainnet-beta" ]; then
        GRAPHQL_PORT=4006 APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mainnet-beta
    elif [ $1 == "testnet" ]; then
        GRAPHQL_PORT=4002 APTOS_NETWORK=testnet yarn pm2:graphql --name testnet
    elif [ $1 == "devnet" ]; then
        GRAPHQL_PORT=4001 APTOS_NETWORK=devnet yarn pm2:graphql --name devnet
    elif [ $1 == "devnet-beta" ]; then
        GRAPHQL_PORT=4007 APTOS_NETWORK=devnet yarn pm2:graphql --name devnet-beta
    elif [ $1 == "vybe" ]; then
        GRAPHQL_PORT=4003 APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name vybe
    elif [ $1 == "atrix" ]; then
        GRAPHQL_PORT=4004 APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name atrix
    elif [ $1 == "mojito" ]; then
        GRAPHQL_PORT=4005 APTOS_NETWORK=mainnet yarn pm2:graphql -i 3 --name mojito

    # indexer
    elif [ $1 == "mainnet-indexer" ]; then
        APTOS_NETWORK=mainnet yarn pm2:indexer --name mainnet-indexer
    elif [ $1 == "devnet-indexer" ]; then
        APTOS_NETWORK=devnet yarn pm2:indexer --name devnet-indexer

    else
        echo "$0: Invalid argument $1: expected one of [all, mainnet, mainnet-beta, mainnet-indexer, testnet, devnet, devnet-beta, devnet-indexer, vybe, atrix, mojito]. Stop."
    fi
}

if [ -z $1 ]; then
    echo "$0: Missing argument $1: expected one of [all, mainnet, mainnet-beta, mainnet-indexer, testnet, devnet, devnet-beta, devnet-indexer, vybe, atrix, mojito]. Stop."
    exit 1
fi

if [ $1 == all ]; then
    hard_restart "mainnet"
    hard_restart "mainnet-beta"
    hard_restart "mainnet-indexer"
    hard_restart "testnet"
    hard_restart "devnet"
    hard_restart "devnet-beta"
    hard_restart "devnet-indexer"
    hard_restart "vybe"
    hard_restart "atrix"
    hard_restart "mojito"
else
    hard_restart $1
fi
