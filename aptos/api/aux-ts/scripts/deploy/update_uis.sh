if [ ! -z "$(git status --porcelain)" ]; then
    echo $0: "Unclean git directory $(pwd). Stop."
    exit 1
fi

# update UI repo
cd ~/projects/aux-frontend
git checkout main
git pull
yarn install
yarn build

# aux
cd ~/projects/aux-frontend/apps/aux
yarn build:aux

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql

# create backups
git tag -f origin/mainnet
git tag -f origin/mainnet-beta
git tag -f origin/testnet
git tag -f origin/devnet
git tag -f origin/devnet-beta
git tag -f origin/vybe
git tag -f origin/atrix
git tag -f origin/mojito

# deploy off latest `main`
git checkout main
git pull
rm -rf ./client
cp -r ~/projects/aux-frontend/apps/aux/dist client
git br -D chore/update-ui
git checkout -b chore/update-ui
git add .
git commit -m "chore(ui): update"
git push origin chore/update-ui:mainnet -f
git push origin chore/update-ui:mainnet-beta -f
git push origin chore/update-ui:testnet -f
git push origin chore/update-ui:devnet -f
git push origin chore/update-ui:devnet-beta -f

# vybe
cd ~/projects/aux-frontend/apps/aux
yarn build:vybe

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
git checkout origin/mainnet
rm -rf ./client
cp -r ~/projects/aux-frontend/apps/aux/dist client
git br -D vybe
git checkout -b vybe
git add .
git commit -m "chore(ui): update vybe"
git push origin vybe --set-upstream -f

# atrix
cd ~/projects/aux-frontend/apps/aux
yarn build:atrix

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
git checkout origin/mainnet
rm -rf ./client
cp -r ~/projects/aux-frontend/apps/aux/dist client
git br -D atrix
git checkout -b atrix
git add .
git commit -m "chore(ui): update atrix"
git push origin atrix --set-upstream -f

# mojito
cd ~/projects/aux-frontend/apps/aux
yarn build:mojito

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
git checkout origin/mainnet
rm -rf ./client
cp -r ~/projects/aux-frontend/apps/aux/dist client
git br -D mojito
git checkout -b mojito
git add .
git commit -m "chore(ui): update mojito"
git push origin mojito --set-upstream -f
