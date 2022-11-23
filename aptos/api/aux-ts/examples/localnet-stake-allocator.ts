/**
 * Stake across two available pools to maximize combined reward.
 */

import { AptosAccount } from "aptos";
import { DU } from "../src";
import { StakePoolClient } from "../src/stake/client";
import { AuxEnv } from "../src/env";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";

const AUX_STAKER_CONFIG = {
  // Total amount to stake in two available pools
  stakeAmount: DU(1), // 1 BTC
};
const M = AUX_STAKER_CONFIG.stakeAmount.toNumber();

// Start an AUX client
const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);

// Get the account that has authority over the module from local profile
// This is also the account that deployed the Aux program
const moduleAuthority: AptosAccount = auxClient.moduleAuthority!;

// We create a new Aptos account for the staker
const staker: AptosAccount = new AptosAccount();
const stakerAddress = staker.address().toString();

// We create another Aptos account to simulate other stakers
const stakerOthers: AptosAccount = new AptosAccount();

const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
const oneYearUs = 3600 * 24 * 365 * 1_000_000; // 1 year

// Set the sender for all future txs to the staker. Note you can override this for individual txs
// by passing in `options`.
auxClient.sender = staker;

interface PoolRecords {
  p1: number;
  p2: number;
}

// We fund staker and module authority with Aptos, BTC and USDC coins
async function setupAccount(account: AptosAccount): Promise<void> {
  await auxClient.fundAccount({
    account: account.address(),
    quantity: DU(1_000_000),
  });

  // We're rich! Use canonical fake types for trading. Fake coins can be freely
  // minted by anybody. All AUX test markets use these canonical fake coins.
  await auxClient.registerAndMintFakeCoin(FakeCoin.BTC, DU(1000), {
    sender: account,
  });
  await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, DU(1_000_000), {
    sender: account,
  });
}

// Query staker positions in pools
async function queryPoolPositions(poolIds: PoolRecords): Promise<PoolRecords> {
  let poolClient: StakePoolClient = new StakePoolClient(auxClient, {
    coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
    coinInfoStake: await auxClient.getCoinInfo(btcCoin),
  });
  let p1 = 0,
    p2 = 0;
  try {
    let tx1 = await poolClient.queryUserPosition({
      poolId: poolIds.p1,
      userAddress: stakerAddress,
    });
    p1 = tx1.amountStaked.toNumber();
    let tx2 = await poolClient.queryUserPosition({
      poolId: poolIds.p2,
      userAddress: stakerAddress,
    });
    p2 = tx2.amountStaked.toNumber();
  } catch (e) {
    console.log("  Querying user position failed with error. Default to 0");
  }
  return {
    p1: p1,
    p2: p2,
  };
}

// Calculate staker's optimal positions to maximize reward
async function calculateOptimalPositions(
  poolIds: PoolRecords
): Promise<PoolRecords> {
  let poolClient: StakePoolClient = new StakePoolClient(auxClient, {
    coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
    coinInfoStake: await auxClient.getCoinInfo(btcCoin),
  });

  let pool1 = await poolClient.query(poolIds.p1);
  let pool2 = await poolClient.query(poolIds.p2);

  let now = new Date();
  let now_us = now.getTime() * 1_000;
  const r1 = pool1.rewardRemaining.toNumber();
  const t1 = pool1.endTime.toNumber() - now_us;
  const s1 = pool1.amountStaked.toNumber();
  const r2 = pool2.rewardRemaining.toNumber();
  const t2 = pool2.endTime.toNumber() - now_us;
  const s2 = pool2.amountStaked.toNumber();

  const positions = await queryPoolPositions(poolIds);
  const p1 = positions.p1;
  const p2 = positions.p2;

  let x1 =
    (0.5 * (r1 * t2 * (M + s2 - p2) + r2 * t1 * (M - s1 + p1))) /
    (r1 * t2 + r2 * t1);
  x1 = Math.min(x1, M);
  x1 = Math.max(x1, 0);
  let x2 = M - x1;

  let poolRewardPerShareAnn1 = 0,
    poolRewardPerShareAnn2 = 0;
  if (x1 > 0) {
    poolRewardPerShareAnn1 = ((r1 * x1) / (s1 - p1 + x1) / t1) * oneYearUs;
  }
  if (x2 > 0) {
    poolRewardPerShareAnn2 = ((r2 * x2) / (s2 - p2 + x2) / t2) * oneYearUs;
  }
  let poolRewardPerShareAnnTotal =
    poolRewardPerShareAnn1 + poolRewardPerShareAnn2;

  console.log(
    ">>>> New optimal pool positions: %f BTC in pool1 and %f BTC in pool2",
    x1,
    x2
  );
  console.log(
    ">>>> Estimated future reward per share (annauzlied): %f USDC",
    poolRewardPerShareAnnTotal
  );
  return { p1: x1, p2: x2 };
}

// calculate trades as (optimalPositions - currentPositions)
async function calculateTrades(
  currentPositions: PoolRecords,
  optimalPositions: PoolRecords
): Promise<PoolRecords> {
  let trades: PoolRecords = {
    p1: optimalPositions.p1 - currentPositions.p1,
    p2: optimalPositions.p2 - currentPositions.p2,
  };
  console.log(
    ">>>> Suggested trades: %f BTC in pool1 and %f BTC in pool2",
    trades.p1,
    trades.p2
  );
  return trades;
}

// compute and place trades
async function placeTrades(poolIds: PoolRecords): Promise<void> {
  let poolClient = new StakePoolClient(auxClient, {
    coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
    coinInfoStake: await auxClient.getCoinInfo(btcCoin),
  });

  const pool1 = await poolClient.query(poolIds.p1);
  const pool2 = await poolClient.query(poolIds.p2);
  console.log(">>>> Current pool status:");
  console.log(
    ">>>> poo1 %d AmountStaked %f BTC RewardRemaining %f USDC",
    pool1.poolId,
    pool1.amountStaked,
    pool1.rewardRemaining
  );
  console.log(
    ">>>> poo2 %d AmountStaked %f BTC RewardRemaining %f USDC",
    pool2.poolId,
    pool2.amountStaked,
    pool2.rewardRemaining
  );

  const currentPositions = await queryPoolPositions(poolIds);
  console.log(
    ">>>> Current staker pool positions: %f BTC in pool1 and %f BTC in pool2",
    currentPositions.p1,
    currentPositions.p2
  );
  const optimalPositions = await calculateOptimalPositions(poolIds);
  const Trades = await calculateTrades(currentPositions, optimalPositions);

  let poolId1 = poolIds.p1;
  let poolId2 = poolIds.p2;

  try {
    if (Trades.p1 < 0 && Trades.p2 > 0) {
      console.log(
        ">>>> Withdrawing %f BTC from pool1, depositing %f BTC to pool2",
        Math.abs(Trades.p1),
        Trades.p2
      );
      await poolClient.withdraw({
        amount: DU(Math.abs(Trades.p1)),
        poolId: poolId1,
      });
      await poolClient.deposit({
        amount: DU(Trades.p2),
        poolId: poolId2,
      });
    } else if (Trades.p1 > 0 && Trades.p2 < 0) {
      console.log(
        ">>>> Withdrawing %f BTC from pool2, depositing %f BTC to pool1",
        Math.abs(Trades.p2),
        Trades.p1
      );
      await poolClient.withdraw({
        amount: DU(Math.abs(Trades.p2)),
        poolId: poolId2,
      });
      await poolClient.deposit({
        amount: DU(Trades.p1),
        poolId: poolId1,
      });
    } else if (Trades.p1 > 0 && Trades.p2 > 0) {
      console.log(
        ">>>> Depositing %f BTC from pool1, depositing %f BTC to pool2",
        Trades.p1,
        Trades.p2
      );
      await poolClient.deposit({
        amount: DU(Trades.p1),
        poolId: poolId1,
      });
      await poolClient.deposit({
        amount: DU(Trades.p2),
        poolId: poolId2,
      });
    } else if (Trades.p1 == 0 && Trades.p2 == 0) {
      console.log(">>>> No trades needed");
    } else {
      console.log("  Not expecting to withdraw from both pools");
    }
  } catch (e) {
    console.log("  Withdrawal/deposit failed with error");
  }
}

// staker allocate between two simulated BTC - USDC stake pools
async function stakeAllocator(): Promise<void> {
  let poolClient: StakePoolClient = new StakePoolClient(auxClient, {
    coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
    coinInfoStake: await auxClient.getCoinInfo(btcCoin),
  });

  const durationUs = 3600 * 24 * 365 * 1_000_000; // 1 year
  let tx1 = await poolClient.create({
    rewardAmount: DU(10_000),
    durationUs,
  });
  let tx2 = await poolClient.create({
    rewardAmount: DU(1_000),
    durationUs,
  });
  let poolIds: PoolRecords = {
    p1: tx1.result?.poolId ?? 0,
    p2: tx2.result?.poolId ?? 0,
  };
  console.log(
    ">>>> Created two stake pools with ids %d and %d",
    poolIds.p1,
    poolIds.p2
  );

  await placeTrades(poolIds);

  console.log("\n");
  console.log(">>>> Other stakers deposit 9 BTC into pool1 %d", poolIds.p1);
  try {
    const tx = await poolClient.deposit(
      {
        amount: DU(9),
        poolId: poolIds.p1,
      },
      { sender: stakerOthers }
    );
    if (!tx.transaction.success) {
      console.log("  Other stakers failed to deposit into pool1");
      console.log(tx.transaction);
    }
  } catch (e) {
    console.log("  Other stakers failed to deposit into pool1");
    console.log("  ", e);
  }

  await placeTrades(poolIds);
}

async function main() {
  await setupAccount(staker);
  await setupAccount(moduleAuthority);
  await setupAccount(stakerOthers);
  await stakeAllocator();
}

main().then(() => {});
