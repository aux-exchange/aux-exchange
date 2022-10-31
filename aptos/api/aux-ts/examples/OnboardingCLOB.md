# Onboarding to the CLOB Maker Bot

Please read the setup notes for the [AMM trading bot](OnboardingAMM.md) if you
still need to set up node.js or the Aptos CLI.

This bot will attempt to make markets using the corresponding FTX market as the
source of truth. The idea is:

- Place a bid slightly below FTX bid and place an ask slightly above FTX ask.

- If the FTX bid increases too much, cancel and place closer to midpoint. If the
  FTX ask decreases too much, cancel and place closer to midpoint. This is called
  "moving in" so that you have a higher likelihood of getting filled.

- If the FTX bid decreases too much, cancel and place below the new bid. If the
  FTX ask increases too much, cancel and place above the new ask. This is called
  "backing away" so that you are less likely to be adversely filled.

These parameters can all be tuned.

## Configuring your Bot

The example runs on
[APT-USDC](https://mainnet.aux.exchange/trade?coinx=0x1%3A%3Aaptos_coin%3A%3AAptosCoin&coiny=0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea%3A%3Acoin%3A%3AT).

Please read the documentation carefully. When getting started, we highly
recommend setting a high `millisecondsBetweenNewOrders`, a small
`quantityPerTrade`, and a tight `maxNetQuantity`, and watching the logs very
closely. Once you are comfortable with how the bot operates, you should tune the
following parameters:

- `idealSpreadFraction`: this needs to be large enough to avoid adverse
  selection compared to FTX, but low enough that your price isn't too bad to get
  filled.

- `moveInSpreadFraction`: this needs to be larger than `idealSpreadFraction`,
  otherwise you will get into an infinite place-cancel loop. Too low and you will
  have a lot of cancels, wasted gas, and bad queue position. Too high and you will
  not get any fills when the price drifts away from you. If you don't care too
  much about fill rate, it is "safe" to set this higher.

- `backOffSpreadFraction`: this should be slightly higher than the natural
  directionless volatility of the market so that you cancel on a bad price trend.
  Too high and you wont cancel, leading to adverse fills. Too low and you will
  cancel all the time, wasting gas and giving up queue priority. Note that
  unlike `moveInSpreadFraction`, you can't set this too high: if the price moves
  against you and you don't cancel, you will probably get taken out adverserially.

# Onboarding to the CLOB Taker Bot

Please read the setup notes for the [AMM trading bot](OnboardingAMM.md) if you
still need to set up node.js or the Aptos CLI.

Very similar to the AMM arbitrage bot, we

- Buy from the orderbook if it is cheaper than the bidding price at FTX by a margin

- Sell if it is more expensive than the asking price at FTX by a margin

## Configuring your Bot

The same arbitrage logic runs on our CLOB arbitrage bot as our AMM arb bot. Please refer to the [configuration parameters](OnboardingAMM.md#configuring-your-bot) here.

# Running the CLOB Arb Bot on Mainnet

- If you have your own Aptos full node, great! Your bot won't be hindered by
  rate limiting. Run `APTOS_NODE=https://your/node/address yarn ts-node mainnet-clob-maker.ts`

- The requirements for CLOB trading are generally higher than for AMM. We
  highly, highly recommend using your own dedicated full node. But if you really
  insist on using the public node, you can try `yarn ts-node mainnet-clob-maker.ts`

- Note that CLOB market making can be more gas intensive than AMM trading for
  certain parameter combinations. Proceed with caution, and if ever in doubt, add
  throttling to new orders to make sure you aren't blowing through your capital
  due to a bug.
