I've set things up so we now still have repos `aux-exchange-{namespace}` but there are also branches `origin/{namespace}`. we can kill the separate repos once we migrate frontends to be served through nginx.

# Commands

## Rolling restart
`./rolling_restart.sh <namespace>`

Example: `./rolling_restart.sh mainnet`
Example: `./rolling_restart.sh devnet`

This will bounce `cd aux-exchange-mainnet`, `git checkout origin/mainnet` and restart PM2 process group named `mainnet`.

## Hard restart

`./hard_restart.sh <namespace>`

Only fallback to hard restart if you need to (e.g. changing the `package.json` command itself).
There will be a little bit of downtime.
