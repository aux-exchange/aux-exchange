I've set things up so we now still have repos `aux-exchange-<branch>` but there are also branches `origin/<branch>`. we can kill the separate repos once we migrate frontends to be served through nginx.

# Deployment workflow

## Step 1: Update the code

Follow steps depending on whether you're updating backend or frontend (or both).

### Backend (GraphQL)
To deploy a new version of backend (GraphQL):

- `git checkout mainnet-beta`
- `git rebase main`
- `git ps -f mainnet-beta`

Where `mainnet-beta` can be substituted for any other environment.

### Frontend (UI)
To deploy a new version of frontend (UI):

- in your local `aux-exchange` repo, inside `aux-ts` run `./scripts/update_uis.sh`

## Step 2: Bounce the processes

### Rolling restart
`./rolling_restart.sh <branch>`

Example: `./rolling_restart.sh mainnet`
Example: `./rolling_restart.sh devnet`

This will `cd aux-exchange-mainnet`, `git checkout origin/mainnet` and restart PM2 process group named `mainnet`.

### Hard restart

`./hard_restart.sh <branch>`

Only fallback to hard restart if you need to (e.g. changing the `package.json` command itself).
There will be a little bit of downtime.

## Addendum: Deploying your own branch

You can also easily deploy your own branch. Instead of using `./rolling_restart.sh`, follow this example.

- `cd ~/aux-exchange-mainnet-beta`
- `git checkout origin/my-branch`
- (if needed) `yarn install, etc. etc.`
- (optional, flush logs) `pm2 flush mainnet-beta`
- `pm2 reload mainnet-beta`

Note, `origin/my-branch` is now deployed to `mainnet-beta.aux.exchange`.
