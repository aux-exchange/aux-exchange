# Deployment

**NOTE**: all operations are assumed to run in the root folder of the repository.

## Prerequisite

- Install latest version of [`rust`](https://www.rust-lang.org)
- Install latest version of [`go`](https://go.dev)
- Install the v1.0.0 version of [`aptos` cli](https://github.com/aptos-labs/aptos-core)
- [node.js](https://nodejs.org/)(with [nvm](https://github.com/nvm-sh/nvm)) and yarn are unnecessary when not interacting with the contract through typescript api.

## Account/Address necessary

The contract code needs to sign for itself, and therefore deployed into a resource account. The original creator of the resource account is the first owner of the exchange, and can make certain changes/updates to the account. The aux resource account is always created with seed "aux".

Given an owner address, the aux address can be verified by the following go binary

```sh
go run ./go-util/aptos/cmd/calculate-resource-address -a "<owner-address>" -s aux
```

## Set up Aptos Profile

A global aptos profile for the desired network should be initialized before deployment.

```sh
# set aptos to use global profile
aptos config set-global-config --config-type global
```

Make sure profile is in the global config (on linux and mac, this should be `$HOME/.aptos/config.yaml`) - below is an example of the config with `devnet` profile setup.

```yaml
profiles:
  devnet:
    private_key: "0x12345678" # <private key hex string>
    public_key: "0x98765432" # <public key hex string>
    account: abcdefg # <account address hex string>
    rest_url: "https://fullnode.devnet.aptoslabs.com/v1" # <url to the rest endpoint>
    faucet_url: ""
```

If the profile is not there, you can initiate one by using the `aptos init` command.

## Deployment

During the deployment process, the `setup-aux` command will delete the `.move` folder in the user's home directory (to remove all downloaded move dependencies) and `build` folder in the contract directory (to remove all compiled codes).

### First Time Deploy

**IF aux resource account is not created yet and the contract is not deployed**, use the following command to create the resource account and deploy the contract

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet # network to deploy
```

### Update

**IF aux resource account is created and the contract is already deployed**, do an update

```sh
go run ./go-util/aptos/cmd/setup-aux --network devnet --redeploy # require redeploy
```
