#!/usr/bin/env bash
cd ~/aux-exchange/aptos/api/aux-ts
git fetch -p
git checkout origin/main
yarn install

cd ~/aux-exchange-beta/aptos/api/aux-ts
git fetch -p
git checkout origin/main
yarn install

cd ~/aux-exchange-devnet/aptos/api/aux-ts
git fetch -p
git checkout origin/main
yarn install

cd ~/aux-exchange-vybe/aptos/api/aux-ts
git fetch -p
git checkout origin/vybe
yarn install

cd ~/aux-exchange-atrix/aptos/api/aux-ts
git fetch -p
git checkout origin/atrix
yarn install

cd ~/aux-exchange-mojito/aptos/api/aux-ts
git fetch -p
git checkout origin/mojito
yarn install

cd
pm2 flush
pm2 reloadLogs
pm2 reload all
