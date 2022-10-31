# Onboarding to the AMM Arb Bot

Here we will try running an arbitrage bot on AUX, with reference to prices from
FTX. The basic idea is that we will buy if it is cheaper than the bidding price
at FTX, and sell if it is more expensive than the asking price at FTX by a
margin. At the end of this tutorial, we will be able to successfully run
`mainnet-amm-limit-trader.ts`.

## Assumptions

- You have `node.js` and `yarn` set up. One way to do this:

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    nvm install 18
    nvm use 18
    corepack enable
    ```

- You have successfully setup Aptos. (If not, follow the steps
  [here](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/))

- You have an Aptos wallet set up. Follow instructions
  [here](https://aptos.dev/tutorials/your-first-dapp/#prerequisites) if you need
  to set it up. Try running `aptos account list` to check your balance

- You have enough APT for gas payments (check under `0x1::aptos_coin::AptosCoin`
  from the result above). This may actually be the hardest step - some ways to get
  your hands on APT may be:

  * Bug a friend who got some APT airdropped
  * Buy off APT from FTX, and send to your wallet you created from step 2

- You have enough tokens to trade in both directions. If you don't, you can use
  [AUX](https://mainnet.aux.exchange) to swap your APT for USDC and other tokens
  needed for the trade.

## Configuring your Bot

The example runs on
[APT-USDC](https://mainnet.aux.exchange/pool?coinx=0x1%3A%3Aaptos_coin%3A%3AAptosCoin&coiny=0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea%3A%3Acoin%3A%3AT).
As discussed above, if you don't have enough USDC to do the arbitrage, you can
use AUX to swap some APT to get the initial USDC balance.

- The example we have written buys or sells if the pool price of APT deviates
  from the price at FTX by `deviationThreshold`, currently set to 0.05%. Lower the
  threshold to be more aggressive, or increase the threshold to be more
  conservative. You probably won't want it to be lower than 0.1% if you are
  looking for arbitrage profit!

- In our example, per swap, we put in $100 when swapping USDC to APT, or $100
  notional of APT when swapping from APT to USDC. Note that your wallet _MUST_
  have a higher balance than these values for both assets. Tone down these values
  a bit if you are too broke.

- The example is extensible to other assets. You can change `baseCoin` to other
  supported coins like WETH or WBTC to arb those pools. Remember that you need an
  initial balance on both sides for the bot to trade!

- We want limited risk exposure to the assets we are trading. You can set `maxPositionNumTrades`
  to limit the number of identical directional trades to do so. For example, if you set `maxPositionNumTrades=2`,
  the sequence of trades would be 
    * BUY BUY BUY (X)
    * SELL SELL SELL (X)
    * BUY BUY SELL BUY BUY (X)
    * BUY BUY SELL BUY (O)
    * SELL BUY BUY BUY (O)


## Running the AMM Arb Bot on Mainnet

- If you have your own Aptos full node, great! Your bot won't be hindered by
  rate limiting. Run `APTOS_NODE=https://your/node/address yarn ts-node mainnet-amm-limit-trader.ts`

- If not, your bot will be able to make 1 swap per second max, which is not too
  bad. Run `yarn ts-node mainnet-amm-limit-trader.ts`

Enjoy losing money faster!
