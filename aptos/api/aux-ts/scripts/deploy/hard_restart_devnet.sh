cd ~/aux-exchange-beta/aptos/api/aux-ts
git fetch -p
git checkout origin/main
yarn install
pm2 restart mainnet-beta
