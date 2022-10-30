# Test trading on Devnet

AUX supports a Devnet environment that uses fake coins. Follow the instructions
below to set up a wallet and airdrop yourself some fake coins to start test
trading on AUX.

## One-time setup

- Make sure you have `node.js` and `yarn` set up. One way to do this:

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    nvm install 18
    nvm use 18
    corepack enable
    ```

- Set up the
  [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/))

- Set up a
  [CLI wallet](https://aptos.dev/tutorials/your-first-dapp/#prerequisites).
  Try running `aptos account list` to check your balance to make sure it was
  created properly.

- Set up a browser wallet. We recommend
  [Martian](https://chrome.google.com/webstore/detail/martian-aptos-wallet/efbglgofoippbgcjepnhiblaibcnclgk).
  Follow these steps to import the CLI wallet you created in the previous step.

    * Select "I already have a Wallet"

    * Select "Private Key"

    * Paste the private key you generated with the Aptos CLI. NEVER SHARE THIS
      KEY WITH ANYBODY! Do not trust anybody to help you with setup. Do not copy
      this paste to any website. AUX will never ask you for this private key.

    * Make sure you are configured against devnet, NOT mainnet, when doing any
      testing. We recommend using different wallets for devnet and mainnet to 
      reduce the likelihood of running tests with your real wallet.

## Funding your account

Run `yarn ts-node devnet-fund-fake-coins.ts` to airdrop yourself some APT as
well as fake BTC and fake USDC. You can modify the script to give other fake
assets as well. We support the following fake coins:

- USDC
- USDT
- BTC
- ETH
- SOL
- AUX

After running the script, the coins will show up in your Devnet wallet. You can
navigate to [AUX Devnet](https://devnet.aux.exchange) to test out the UI with
your new fake funds.

We allow unlimited airdrops in Devnet. Feel free to run the funding script again
if you run out of money!