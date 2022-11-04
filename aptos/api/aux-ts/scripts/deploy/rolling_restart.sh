#!/usr/bin/env bash

rolling_restart() {
    cd ~/aux-exchange-$1/aptos/api/aux-ts
    git fetch
    if [ ! -z "$(git status --porcelain)" ]; then
        echo $0: "Unclean git directory $(pwd). Stop."
        exit 1
    fi
    git checkout origin/$1
    yarn install
    yarn build
    pm2 flush $1
    pm2 reloadLogs
    pm2 reload $1
}

if [ -z $1 ]; then
    echo "$0: Missing argument $1: expected one of [all, mainnet, mainnet-beta, mainnet-indexer, testnet, devnet, devnet-beta, devnet-indexer, vybe, atrix, mojito]. Stop."
    exit 1
fi

if [ $1 == all ]; then
    rolling_restart "mainnet"
    rolling_restart "mainnet-beta"
    rolling_restart "mainnet-indexer"
    rolling_restart "testnet"
    rolling_restart "devnet"
    rolling_restart "devnet-beta"
    rolling_restart "devnet-indexer"
    rolling_restart "vybe"
    rolling_restart "atrix"
    rolling_restart "mojito"
else
    rolling_restart $1
fi
