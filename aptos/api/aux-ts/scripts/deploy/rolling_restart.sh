#!/usr/bin/env bash

WD=~/projects/aux-exchange/aptos/api/aux-ts
cd $WD

if [ ! -z "$(git status --porcelain)" ]
then
    echo $0: "Unclean git directory $WD. Stop."
    exit 1
fi

if [ -z $1 ]
then
    echo "$0: Missing argument: expected one of [all, mainnet, mainnet-beta, testnet, devnet, devnet-beta, vybe, atrix, mojito]. Stop."
    exit 1
fi


if [ $1 == all ]
then
    setup "mainnet"
    setup "mainnet-beta"
    setup "testnet"
    setup "devnet"
    setup "devnet-beta"
    setup "vybe"
    setup "atrix"
    setup "mojito"
else
    setup $1
fi

setup() {
    git checkout origin/$1
    yarn install
    yarn build
    pm2 flush
    pm2 reloadLogs
    pm2 reload $1
}
