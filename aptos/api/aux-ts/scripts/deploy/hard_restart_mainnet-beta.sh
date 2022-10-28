cd ~/aux-exchange-devnet/aptos/api/aux-ts
git fetch -p
git checkout origin/main
yarn install
pm2 restart devnet
