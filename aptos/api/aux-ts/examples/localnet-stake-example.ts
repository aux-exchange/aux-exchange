/**
 * Stake to a pool 
 */

 import { AptosAccount, AptosClient } from "aptos";
 import { DU } from "../src";
 import { StakePoolClient } from "../src/stake/client";
 import { AuxClient } from "../src/client";
 import { FakeCoin } from "../src/coin";
 
 const AUX_STAKER_CONFIG = {
     // Stake if pool's reward per share (annualized) is above this threshold
     // Unstake otherwise
     rewardPerShareAnnualizedThreshold: 1_000, // 1_000 USDC per 1 BTC (annualized)
     stakeAmount: DU(1), // 1 BTC
 }
  // Start an AUX client
 const auxClient = new AuxClient(
     "local",
     new AptosClient("http://localhost:8081")
   );
 
 // This is the address where the AUX module is published to
 auxClient.moduleAddress;
 
 // Get the account that has authority over the module from local profile
 // This is also the account that deployed the Aux program
 const moduleAuthority: AptosAccount = auxClient.moduleAuthority!;
 
 // We create a new Aptos account for the staker and pool authority
 const staker: AptosAccount = new AptosAccount();
 
 const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
 const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
 
 // Set the sender for all future txs to the staker. Note you can override this for individual txs
 // by passing in `options`.
 auxClient.sender = staker;
 
 // We fund staker and module authority with Aptos and USDC coins
 async function setupStaker(): Promise<void> {
     auxClient.sender = staker;
 
     await auxClient.fundAccount({
       account: staker.address(),
       quantity: DU(1_000_000),
     });
   
     await auxClient.fundAccount({
       account: moduleAuthority.address(),
       quantity: DU(1_000_000),
     });
   
     // We're rich! Use canonical fake types for trading. Fake coins can be freely
     // minted by anybody. All AUX test markets use these canonical fake coins.
     await auxClient.registerAndMintFakeCoin(FakeCoin.BTC, DU(1000));  
     await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, DU(1_000_000));
 }
 
 async function stakeAboveThreshold(): Promise<void> {
     let poolClient: StakePoolClient = new StakePoolClient(auxClient, {
         coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
         coinInfoStake: await auxClient.getCoinInfo(btcCoin),
     });
 
     const durationUs = 3600 * 24 * 365 * 1_000_000; // 1 year
     const oneYearUs = 3600 * 24 * 365 * 1_000_000; // 1 year
     const rewardAmount = DU(10_000);
     const tx = await poolClient.create({
         rewardAmount,
         durationUs,
     });
     console.log(">>>> Create stake pool event:", tx.result ?? [])        
     let poolId = tx.result?.poolId ?? 0;
     let pool = await poolClient.query(poolId);
 
     while (true) {
         console.log(new Date());
         let now = new Date();
         let now_us = now.getTime() * 1_000;
         const timeRemaining = pool.endTime.toNumber() - now_us; // TODO: check if they are in the same units
         const poolRewardPerShareAnn = pool.rewardRemaining.toNumber() / pool.amountStaked.toNumber() / timeRemaining * oneYearUs;
 
         if (poolRewardPerShareAnn > AUX_STAKER_CONFIG.rewardPerShareAnnualizedThreshold) {
             try {
                 console.log(">>>> Depositing BTC to the stake pool")
                 let tx = await poolClient.deposit({
                     amount: AUX_STAKER_CONFIG.stakeAmount,
                     poolId: poolId});
                 console.log(">>>> Deposit event:", tx.result?? []);
             } catch (e) {
                 console.log("  Depositing failed with error", e)
             }
         }
     }
 }
   
 async function main() {
     await setupStaker();
     await stakeAboveThreshold();
 }
   
 main().then(() => {});
 