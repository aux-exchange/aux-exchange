# mainnet
cd ~/projects/eastrock-frontend
git add .
git stash
git checkout dev
git pull
yarn install
yarn build
cd ~/projects/eastrock-frontend/apps/aux
yarn build

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
git add .
git stash
git checkout main
git pull
rm -rf ./client
cp -r ~/projects/eastrock-frontend/apps/aux/dist client
git br -D chore/update-ui
git checkout -b chore/update-ui
git add .
git commit -m "chore(ui): update"
git push origin chore/update-ui --set-upstream -f

# vybe
cd ~/projects/eastrock-frontend/apps/aux
yarn build:vybe

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
rm -rf ./client
cp -r ~/projects/eastrock-frontend/apps/aux/dist client
git br -D vybe
git checkout -b vybe
git add .
git commit -m "chore(ui): update vybe"
git push origin vybe --set-upstream -f

# atrix
cd ~/projects/eastrock-frontend/apps/aux
yarn build:atrix

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
rm -rf ./client
cp -r ~/projects/eastrock-frontend/apps/aux/dist client
git br -D atrix
git checkout -b atrix
git add .
git commit -m "chore(ui): update atrix"
git push origin atrix --set-upstream -f

# mojito
cd ~/projects/eastrock-frontend/apps/aux
yarn build:mojito

cd ~/projects/aux-exchange/aptos/api/aux-ts/src/graphql
rm -rf ./client
cp -r ~/projects/eastrock-frontend/apps/aux/dist client
git br -D mojito
git checkout -b mojito
git add .
git commit -m "chore(ui): update mojito"
git push origin mojito --set-upstream -f
