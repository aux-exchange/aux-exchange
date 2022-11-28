/**
 * Stake across two available pools to maximize combined rewards.
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
const oneYearUs = 3600 * 24 * 365 * 1_000_000; // 1 year in micro-seconds
const decimalPoints = 2; // up to 2 decimal points for position & trade accuracy

// Set the sender for all future txs to the staker. Note you can override this for individual txs
// by passing in `options`.
auxClient.sender = staker;

// Interface to store pool values e.g. staker's positions in the two pools
interface PoolRecords {
  p1: number;
  p2: number;
}

// We fund an Aptos account with Aptos, BTC and USDC coins
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

async function calculateRewardPerShareAnn(
  x1: number, // new position in pool1
  r1: number, // remainig reward in pool1
  _s1: number, // total amount staked in pool1 excluding staker's position
  t1: number, // time remainig in pool1
  r2: number, // remainig reward in pool2
  _s2: number, // total amount staked in pool2 excluding staker's position
  t2: number // time remainig in pool2
): Promise<number> {
  let x2 = M - x1;
  let poolRewardPerShareAnn1 = 0,
    poolRewardPerShareAnn2 = 0;
  if (x1 > 0) {
    poolRewardPerShareAnn1 = ((r1 * x1) / (_s1 + x1) / t1) * oneYearUs;
  }
  if (x2 > 0) {
    poolRewardPerShareAnn2 = ((r2 * x2) / (_s2 + x2) / t2) * oneYearUs;
  }
  let poolRewardPerShareAnnTotal =
    poolRewardPerShareAnn1 + poolRewardPerShareAnn2;
  return poolRewardPerShareAnnTotal;
}

// Calculate staker's optimal positions across two pools to maximize combined rewards
// Brute-force search for now in a 100 data point grid
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

  const _s1 = s1 - p1;
  const _s2 = s2 - p2;
  
  let x1Optimal = 0.;
  if (_s1 == 0.) {
    x1Optimal = 0.01 * M;
  } else if (_s2 == 0.) {
    x1Optimal = 0.99 * M;
  } else {
    let poolRewardPerShareAnnTotalOptimal: number = 0.;
    let x1: number = 0.;
    while (x1 <= M) {
      let poolRewardPerShareAnnTotal = await calculateRewardPerShareAnn(
        x1,
        r1,
        _s1,
        t1,
        r2,
        _s2,
        t2
      );
      if (poolRewardPerShareAnnTotal > poolRewardPerShareAnnTotalOptimal) {
        x1Optimal = x1 * M;
        poolRewardPerShareAnnTotalOptimal = poolRewardPerShareAnnTotal;
      }
      x1 += 0.01 * M;
    }
  }
  
  console.log(
    ">>>> New optimal pool positions: %f BTC in pool1 and %f BTC in pool2",
    x1Optimal.toFixed(decimalPoints),
    (M - x1Optimal).toFixed(decimalPoints)
  );

  const poolRewardPerShareAnnTotalOptimal = await calculateRewardPerShareAnn(
    x1Optimal,
    r1,
    _s1,
    t1,
    r2,
    _s2,
    t2
  );
  console.log(
    ">>>> Estimated future reward per share (annualized): %f USDC",
    poolRewardPerShareAnnTotalOptimal
  );
  return { p1: x1Optimal, p2: M - x1Optimal };
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
  trades = {
    p1: Math.round(trades.p1 * 10 ** decimalPoints) / 10 ** decimalPoints,
    p2: Math.round(trades.p2 * 10 ** decimalPoints) / 10 ** decimalPoints
  }
  console.log(
    ">>>> Suggested trades: %f BTC in pool1 and %f BTC in pool2",
    trades.p1.toFixed(decimalPoints),
    trades.p2.toFixed(decimalPoints)
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
    pool1.amountStaked.toNumber().toFixed(decimalPoints),
    pool1.rewardRemaining.toNumber().toFixed(decimalPoints)
  );
  console.log(
    ">>>> poo2 %d AmountStaked %f BTC RewardRemaining %f USDC",
    pool2.poolId,
    pool2.amountStaked.toNumber().toFixed(decimalPoints),
    pool2.rewardRemaining.toNumber().toFixed(decimalPoints)
  );

  const currentPositions = await queryPoolPositions(poolIds);
  console.log(
    ">>>> Current staker pool positions: %f BTC in pool1 and %f BTC in pool2",
    currentPositions.p1.toFixed(decimalPoints),
    currentPositions.p2.toFixed(decimalPoints)
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
      const tx1 = await poolClient.withdraw({
        amount: DU(Math.abs(Trades.p1)),
        poolId: poolId1,
      });
      if (!tx1.transaction.success) {
        console.log("  Staker failed to withdraw from pool1");
        console.log("  ", tx1.transaction);
      }
      const tx2 = await poolClient.deposit({
        amount: DU(Trades.p2),
        poolId: poolId2,
      });
      if (!tx2.transaction.success) {
        console.log("  Staker failed to deposit to pool2");
        console.log("  ", tx2.transaction);
      }
    } else if (Trades.p1 > 0 && Trades.p2 < 0) {
      console.log(
        ">>>> Withdrawing %f BTC from pool2, depositing %f BTC to pool1",
        Math.abs(Trades.p2),
        Trades.p1
      );
      const tx1 = await poolClient.withdraw({
        amount: DU(Math.abs(Trades.p2)),
        poolId: poolId2,
      });
      if (!tx1.transaction.success) {
        console.log("  Staker failed to withdraw from pool2");
        console.log("  ", tx1.transaction);
      }      
      const tx2 = await poolClient.deposit({
        amount: DU(Trades.p1),
        poolId: poolId1,
      });
      if (!tx2.transaction.success) {
        console.log("  Staker failed to deposit to pool1");
        console.log("  ", tx2.transaction);
      }
    } else if (Trades.p1 > 0 && Trades.p2 > 0) {
      console.log(
        ">>>> Depositing %f BTC from pool1, depositing %f BTC to pool2",
        Trades.p1,
        Trades.p2
      );
      const tx1 = await poolClient.deposit({
        amount: DU(Trades.p1),
        poolId: poolId1,
      });
      if (!tx1.transaction.success) {
        console.log("  Staker failed to deposit to pool 1");
        console.log("  ", tx1.transaction);
      }    
      const tx2 = await poolClient.deposit({
        amount: DU(Trades.p2),
        poolId: poolId2,
      });
      if (!tx2.transaction.success) {
        console.log("  Staker failed to deposit to pool 2");
        console.log("  ", tx2.transaction);
      }  
    } else if (Trades.p1 == 0 && Trades.p2 == 0) {
      console.log(">>>> No trades needed");
    } else {
      console.log("  Not expecting to withdraw from both pools");
    }
  } catch (e) {
    console.log("  Withdrawal/deposit failed with error");
    console.log("  ", e);
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

  let numBTCArray= [1, 0.1, 20];
  let poolIDArray = [1, 2, 1];
  for (var index in numBTCArray) {
    let numBTC: number = numBTCArray[index] ?? 0;
    let poolIdMap = [poolIds.p1, poolIds.p2];
    let poolOrder = poolIDArray[index] ?? 0;
    let poolId: number = poolIdMap[poolOrder - 1] ?? 0;
    console.log("\n");
    console.log(
      ">>>> Other stakers deposit %f BTC into pool%d (ID: %d)",
      numBTC,
      poolOrder,
      poolId
    );    
    try {      
      const tx = await poolClient.deposit(
        {
          amount: DU(numBTC),
          poolId: poolId
        },
        { sender: stakerOthers }
      );
      if (!tx.transaction.success) {
        console.log(
          "  Other stakers failed to deposit into pool%d (ID: %d)",
          poolOrder,
          poolId
        );
        console.log(tx.transaction);
      }
    } catch (e) {
      console.log(
        "  Other stakers failed to deposit into pool%d (ID: %d)",
        poolOrder,
        poolId
      );
      console.log("  ", e);
    }

    await placeTrades(poolIds);
  }  
}

async function main() {
  await setupAccount(staker);
  await setupAccount(moduleAuthority);
  await setupAccount(stakerOthers);
  await stakeAllocator();
}

main().then(() => {});
