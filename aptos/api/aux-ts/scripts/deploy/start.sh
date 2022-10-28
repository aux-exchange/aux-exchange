#!/usr/bin/env bash
cd ~/aux-exchange/aptos/api/aux-ts
git fetch -p
git stash
#git checkout 5de7dd493d43f888acbbcb534baae62524642178
git checkout origin/main
GRAPHQL_PORT=4002 APTOS_PROFILE=testnet yarn pm2:graphql --name testnet
GRAPHQL_PORT=4000 APTOS_PROFILE=mainnet yarn pm2:graphql -i 3 --name mainnet

cd ~/aux-exchange-beta/aptos/api/aux-ts
git fetch -p
git stash
git checkout origin/main
GRAPHQL_PORT=4006 APTOS_PROFILE=mainnet yarn pm2:graphql -i 3 --name mainnet-beta

cd ~/aux-exchange-devnet/aptos/api/aux-ts
git fetch -p
git stash
git checkout origin/main
GRAPHQL_PORT=4001 APTOS_PROFILE=devnet yarn pm2:graphql --name devnet

cd ~/aux-exchange-vybe/aptos/api/aux-ts
git fetch -p
git stash
git checkout origin/vybe
GRAPHQL_PORT=4003 APTOS_PROFILE=mainnet yarn pm2:graphql -i 3 --name vybe

cd ~/aux-exchange-atrix/aptos/api/aux-ts
git fetch -p
git stash
git checkout origin/atrix
GRAPHQL_PORT=4004 APTOS_PROFILE=mainnet yarn pm2:graphql -i 3 --name atrix

cd ~/aux-exchange-mojito/aptos/api/aux-ts
git fetch -p
git stash
git checkout origin/mojito
GRAPHQL_PORT=4005 APTOS_PROFILE=mainnet yarn pm2:graphql -i 3 --name mojito
