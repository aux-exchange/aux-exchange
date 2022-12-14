import { ApiError, AptosAccount } from "aptos";
ApiError;
import * as assert from "assert";
import { describe, it } from "mocha";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AU, DU } from "../src/units";
import { StakePoolClient } from "../src/stake/client";
import type {
  ClaimEvent,
  CreatePoolEvent,
  ModifyPoolEvent,
  StakeDepositEvent,
  StakePool,
  StakeWithdrawEvent,
  UserPosition,
} from "../src/stake/schema";
import BN from "bn.js";

describe("Stake Pool tests", function () {
  this.timeout(30000);

  const auxEnv = new AuxEnv();
  const auxClient = new AuxClient(
    auxEnv.aptosNetwork,
    auxEnv.aptosClient,
    auxEnv.faucetClient
  );
  const moduleAuthority = auxClient.moduleAuthority!;
  const sender = new AptosAccount();
  const senderAddr = sender.address().toShortString();
  let lastUserPosition: UserPosition;
  let lastPoolState: StakePool;
  let lastPoolUpdateTime = 0;
  let lastAccRewardPerShare = 0;
  let lastRewardRemaining = 0;
  let lastRewardAmount = 0;
  let lastEndTime = 0;
  auxClient.sender = sender;

  // STAKE COIN
  // const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
  const usdtCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDT);
  // REWARD COIN
  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);

  let poolClient: StakePoolClient;
  let pool: StakePool;

  it("fundAccount", async function () {
    await auxClient.fundAccount({
      account: sender.address(),
      quantity: DU(1_000_000),
    });
  });

  it("createStakePoolClient", async function () {
    poolClient = new StakePoolClient(auxClient, {
      coinInfoReward: await auxClient.getCoinInfo(usdcCoin),
      coinInfoStake: await auxClient.getCoinInfo(usdtCoin),
    });
    assert.ok(!!poolClient.coinInfoReward);
    assert.ok(!!poolClient.coinInfoStake);
  });

  it("mintAux", async function () {
    await auxClient.registerAuxCoin();
    let tx = await auxClient.mintAux(
      sender.address().toString(),
      AU(2_000_000_000_000),
      { sender: moduleAuthority }
    );

    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
  });

  it("mintCoins", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(2_000_000_000_000)
    );
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
    let tx2 = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDT,
      AU(2_000_000_000_000)
    );
    assert.ok(tx2.success, `${JSON.stringify(tx2, undefined, "  ")}`);
  });

  it("createStakePool", async function () {
    const durationUs = new BN(3600 * 24 * 1_000_000);
    const rewardAmount = DU(1_000_000);
    const createEvent = await poolClient.create({
      rewardAmount,
      durationUs,
    });
    assert.ok(createEvent.transaction.success);
    const event = createEvent.result;
    assert.ok(!!event);
    pool = await poolClient.query();
    assert.equal(pool.accRewardPerShare, 0);
    assert.equal(pool.authority, senderAddr);
    assert.equal(
      pool.endTime.toNumber() - pool.startTime.toNumber(),
      durationUs
    );
    assert.equal(pool.rewardRemaining.toNumber(), rewardAmount.toNumber());
    assert.equal(event.stakeCoinType, pool.coinInfoStake.coinType);
    assert.equal(poolClient.coinInfoStake.coinType, event.stakeCoinType);
    assert.equal(
      pool.coinInfoReward.coinType,
      poolClient.coinInfoReward.coinType
    );
    assert.equal(event.rewardCoinType, pool.coinInfoReward.coinType);
  });

  it("deposit", async function () {
    const initStakeCoin = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoStake.coinType,
    });
    const tx = await poolClient.deposit(DU(500));
    assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
    const depositAu = DU(500)
      .toAtomicUnits(pool.coinInfoStake.decimals)
      .toNumber();
    const event = tx.result;
    assert.ok(!!event);
    assert.equal(event.depositAmount.toNumber(), depositAu);
    assert.equal(event.user, senderAddr);
    assert.equal(event.userAmountStaked, depositAu);
    assert.equal(event.userRewardAmount, 0);

    pool = await poolClient.query();
    assert.equal(pool.amountStaked.toNumber(), 500);
    const finalStakeCoin = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoStake.coinType,
    });
    assert.equal(initStakeCoin.toNumber() - finalStakeCoin.toNumber(), 500);
    lastPoolState = pool;
    lastPoolUpdateTime = pool.lastUpdateTime.toNumber();
    lastAccRewardPerShare = pool.accRewardPerShare.toNumber();
    lastRewardRemaining = pool.rewardRemaining
      .toAtomicUnits(pool.coinInfoReward.decimals)
      .toNumber();
    lastUserPosition = await poolClient.queryUserPosition(senderAddr);

    const currentTime = new BN(
      (await poolClient.auxClient.aptosClient.getLedgerInfo()).ledger_timestamp
    );
    const daysRemaining =
      pool.endTime.sub(currentTime).toNumber() / (3600 * 1000000 * 24);
    const rewardRemaining = event.rewardRemaining;
    const expectedApr =
      (rewardRemaining
        .toDecimalUnits(poolClient.coinInfoReward.decimals)
        .toNumber() /
        daysRemaining /
        500) *
      365 *
      100;
    const apr = await poolClient.calcApr(pool, currentTime);
    assert.equal(apr, expectedApr);
  });

  it("claim", async function () {
    const initRewardBalance = await auxClient.getCoinBalance({
      account: sender.address(),
      coinType: pool.coinInfoReward.coinType,
    });
    console.log("Sleeping for 2 seconds");
    await new Promise((r) => setTimeout(r, 2000));
    const tx = await poolClient.claim();
    assert.ok(tx.transaction.success);
    const event = tx.result;
    assert.ok(!!event);
    pool = await poolClient.query();
    assert.equal(
      event.accRewardPerShare.toNumber(),
      pool.accRewardPerShare.toNumber()
    );
    assert.equal(
      event.rewardRemaining.toNumber(),
      pool.rewardRemaining
        .toAtomicUnits(poolClient.coinInfoReward.decimals)
        .toNumber()
    );
    assert.equal(
      event.totalAmountStaked.toNumber(),
      pool.amountStaked
        .toAtomicUnits(poolClient.coinInfoStake.decimals)
        .toNumber()
    );
    const duration = pool.lastUpdateTime.toNumber() - lastPoolUpdateTime;
    const durationReward = Math.floor(
      (duration * lastRewardRemaining) /
        (pool.endTime.toNumber() - lastPoolUpdateTime)
    );
    const stakeAu = DU(500)
      .toAtomicUnits(pool.coinInfoStake.decimals)
      .toNumber();
    const accRewardPerShare = Math.floor((durationReward * 1e12) / stakeAu);
    const calcAccRewardPerShare = await poolClient.calcAccRewardPerShare({
      lastPoolState,
      currentTimeUs: pool.lastUpdateTime,
    });
    assert.equal(
      pool.accRewardPerShare.toNumber() - lastAccRewardPerShare,
      accRewardPerShare
    );
    assert.equal(
      calcAccRewardPerShare.toNumber(),
      pool.accRewardPerShare.toNumber()
    );
    const finalRewardBalance = await auxClient.getCoinBalance({
      account: sender.address(),
      coinType: pool.coinInfoReward.coinType,
    });
    const expectedReward = Math.floor((accRewardPerShare * stakeAu) / 1e12);
    const calcReward = await poolClient.calcPendingUserReward({
      userAddress: senderAddr,
      userPosition: lastUserPosition,
      lastPoolState,
      currentTimeUs: pool.lastUpdateTime,
    });
    assert.equal(
      calcReward.toAtomicUnits(pool.coinInfoReward.decimals).toNumber(),
      expectedReward
    );
    assert.equal(event.userRewardAmount.toNumber(), expectedReward);
    assert.equal(
      finalRewardBalance.toNumber() - initRewardBalance.toNumber(),
      expectedReward
    );
    lastRewardRemaining = pool.rewardRemaining.toNumber();
    lastRewardAmount = pool.amountReward.toNumber();
    lastEndTime = pool.endTime.toNumber();
  });

  it("modifyPool", async function () {
    const rewardAmount = DU(1000);
    const timeAmountUs = new BN(1_000_000 * 3600 * 24);
    const modifyPoolResult = await poolClient.modifyPool({
      rewardAmount,
      rewardIncrease: true,
      timeAmountUs,
      timeIncrease: true,
    });
    assert.ok(modifyPoolResult.transaction.success);
    const event = modifyPoolResult.result;
    assert.ok(!!event);
    pool = await poolClient.query();

    assert.equal(
      pool.amountReward.toNumber(),
      lastRewardAmount + rewardAmount.toNumber()
    );
    assert.equal(
      event.rewardRemaining.toNumber(),
      pool.rewardRemaining
        .toAtomicUnits(poolClient.coinInfoReward.decimals)
        .toNumber()
    );
    assert.equal(pool.endTime, lastEndTime + timeAmountUs.toNumber());
    assert.equal(event.endTimeUs.toNumber(), pool.endTime.toNumber());
  });

  it("modifyAuthority", async function () {
    const tx = await poolClient.modifyAuthority(
      moduleAuthority.address().toShortString()
    );
    assert.ok(tx.transaction.success);
    const event = tx.result;
    assert.ok(!!event);
    assert.equal(event.authority, moduleAuthority.address().toShortString());
    pool = await poolClient.query();
    assert.equal(pool.authority, event.authority);

    // Try to modify authority again (sender == sender, so this will fail)
    const tx2 = await poolClient.modifyAuthority(senderAddr);
    assert.ok(!tx2.transaction.success);

    const tx3 = await poolClient.modifyAuthority(senderAddr, {
      sender: moduleAuthority,
    });
    assert.ok(tx3.transaction.success);
    const event2 = tx3.result;
    assert.ok(!!event2);
    assert.equal(event2.authority, senderAddr);
    pool = await poolClient.query();
    assert.equal(pool.authority, event2.authority);
  });

  it("endRewardEarly", async function () {
    // end the reward early and claim all remaining reward
    const tx = await poolClient.endRewardEarly();
    assert.ok(tx.transaction.success);
    const event = tx.result;
    assert.ok(!!event);
    const tx2 = await poolClient.claim();
    assert.ok(tx2.transaction.success);
    pool = await poolClient.query();

    assert.equal(event.endTimeUs.toNumber(), pool.endTime.toNumber());
    assert.equal(event.rewardRemaining.toNumber(), 0);

    assert.equal(pool.amountReward.toNumber(), 0);
    assert.equal(pool.rewardRemaining.toNumber(), 0);
    assert.equal(pool.endTime.toNumber(), pool.lastUpdateTime.toNumber());
    assert.equal(pool.amountStaked.toNumber(), 500);
  });

  it("withdraw", async function () {
    const userPosInit = await poolClient.queryUserPosition(senderAddr);
    assert.equal(userPosInit.amountStaked.toNumber(), 500);
    const initStakeBalance = await auxClient.getCoinBalance({
      account: sender.address(),
      coinType: pool.coinInfoStake.coinType,
    });
    const tx = await poolClient.withdraw(DU(500));

    assert.ok(tx.transaction.success);
    const event = tx.result;
    assert.ok(!!event);

    assert.equal(event.user, senderAddr);
    // User should not receive any reward since they claimed after the reward ended
    assert.equal(event.userRewardAmount.toNumber(), 0);
    const stakeAu = DU(500)
      .toAtomicUnits(pool.coinInfoStake.decimals)
      .toNumber();
    assert.equal(event.withdrawAmount.toNumber(), stakeAu);
    const finalStakeBalance = await auxClient.getCoinBalance({
      account: sender.address(),
      coinType: pool.coinInfoStake.coinType,
    });
    assert.equal(
      finalStakeBalance.toNumber() - initStakeBalance.toNumber(),
      stakeAu
    );
    const userPosFinal = await poolClient.queryUserPosition(senderAddr);
    assert.equal(userPosFinal.amountStaked, 0);
  });

  it("createEvents", async function () {
    const events = await poolClient.createEvents();
    assert.equal(events.length, 1);
    const createEvent: CreatePoolEvent = events[0]!;
    assert.equal(createEvent.stakeCoinType, poolClient.coinInfoStake.coinType);
  });

  it("depositEvents", async function () {
    const events = await poolClient.depositEvents();
    assert.equal(events.length, 1);
    const depositEvent: StakeDepositEvent = events[0]!;
    assert.equal(depositEvent.user, senderAddr);
  });

  it("withdrawEvents", async function () {
    const events = await poolClient.withdrawEvents();
    assert.equal(events.length, 1);
    const withdrawEvent: StakeWithdrawEvent = events[0]!;
    assert.equal(withdrawEvent.user, senderAddr);
  });

  it("claimEvents", async function () {
    const events = await poolClient.claimEvents();
    assert.equal(events.length, 2);
    const claimEvent: ClaimEvent = events[0]!;
    assert.equal(claimEvent.user, senderAddr);
  });

  it("modifyPoolEvents", async function () {
    const events = await poolClient.modifyPoolEvents();
    assert.equal(events.length, 4);
    let modifyPoolEvent: ModifyPoolEvent = events[0]!;
    // last event modified authority back to sender
    assert.equal(modifyPoolEvent.authority, senderAddr);
    modifyPoolEvent = events[1]!;
    assert.equal(
      modifyPoolEvent.authority,
      moduleAuthority.address().toShortString()
    );
    modifyPoolEvent = events[2]!;
    assert.equal(modifyPoolEvent.authority, senderAddr);
    modifyPoolEvent = events[3]!;
    assert.equal(modifyPoolEvent.authority, senderAddr);
  });

  it("deleteEmptyPool", async function () {
    const tx = await poolClient.deleteEmptyPool();
    assert.ok(tx.success);
    let threw = false;
    try {
      await poolClient.query();
    } catch (e) {
      assert.equal((e as ApiError).errorCode, "resource_not_found");
      threw = true;
    }
    assert.ok(threw);
  });
});
