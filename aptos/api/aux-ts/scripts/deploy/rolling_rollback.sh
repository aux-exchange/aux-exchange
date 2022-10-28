#!/usr/bin/env bash
cd ~/aux-exchange/aptos/api/aux-ts
git fetch -p
git checkout HEAD~1
yarn install

cd ~/aux-exchange-vybe/aptos/api/aux-ts
git fetch -p
git checkout HEAD~1
yarn install

cd ~/aux-exchange-atrix/aptos/api/aux-ts
git fetch -p
git checkout HEAD~1
yarn install

cd ~/aux-exchange-mojito/aptos/api/aux-ts
git fetch -p
git checkout HEAD~1
yarn install

pm2 reload all
