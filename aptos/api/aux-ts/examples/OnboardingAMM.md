# Onboarding to the AMM Arb Bot 
Here we will try running an arbitrage bot on AUX, with reference to prices from FTX. The basic idea is that we will buy if it is cheaper than the bidding price at FTX, and sell if it is more expensive than the asking price at FTX by a margin.    
At the end of this tutorial, we will be able to successfully run `mainnet-amm-limit-trader.ts`. 

## Assumptions
- You have `node.js` and `yarn` set up.
- You have successfully setup Aptos. (If not, follow the steps [here](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/))
- You have an Aptos wallet set up. Follow instructions [here](https://aptos.dev/tutorials/your-first-dapp/#prerequisites) if you need to set it up. Try running
```aptos account list``` to check your balance
- You have enough APT for gas payments (check under `0x1::aptos_coin::AptosCoin` from the result above). This may actually be the hardest step - some ways to get your hands on APT may be
    - Bug a friend who got some APT airdropped
    - Buy off APT from FTX, and send to your wallet you created from step 2
- You have enough tokens on both side of the pool you are about to run the bot on    
ex) Check under `0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T` for your Wrapped ETH balance

## Configuring your Bot
The example runs on the [Wrapped Ether / USDC pool](https://mainnet.aux.exchange/pool?coinx=0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb%3A%3Acoin%3A%3AT&coiny=0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea%3A%3Acoin%3A%3AT).    
- The example we have written buys or sells if the pool price of ETH deviates from the price at FTX by `deviationThreshold`, currently set to 0.15%. Lower the threshold to be more aggressive, or higher the threshold to be more conservative.     
Word of advice - you probably won't want it to be lower than 0.1%.
- In our example, per swap, we put in exactly `ethPerSwap` (0.005 ETH), or `usdcPerSwap` (10 USDC).     
Note that your wallet *MUST* have a higher balance than these values for both assets. Tone down these values a bit if you are too broke. 
- If you want to extend to other crypto, you may want to look at changing lines `21 ~ 25, 44, 51, 67, 68`

## Running the AMM Arb Bot on Mainnet
- If you have your own Aptos validator node, great! Your bot won't be hindered by rate limiting.     
Run `APTOS_NODE=https://your/validator/address yarn ts-node mainnet-amm-limit-trader.ts`
- If not, your bot will be able to make 1 swap per second max, which is not too bad.    
Run `yarn ts-node mainnet-amm-limit-trader.ts`


Enjoy losing money faster!
