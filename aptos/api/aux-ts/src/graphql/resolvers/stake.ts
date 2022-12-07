import { StakePoolClient } from "../../stake/client";
import { auxClient } from "../client";
import type {
  ClaimEvent,
  CreateStakePoolEvent,
  ModifyPoolEvent,
  StakeDepositEvent,
  StakePool,
  StakePoolPendingUserRewardArgs,
  StakePoolUserPositionArgs,
  StakeWithdrawEvent,
  UserPosition,
} from "../generated/types";

export const stakePool = {
  async apr(parent: StakePool) {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    return await poolClient.calcApr();
  },
  async pendingUserReward(
    parent: StakePool,
    { owner }: StakePoolPendingUserRewardArgs
  ): Promise<number> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    return (
      await poolClient.calcPendingUserReward({
        userAddress: owner,
      })
    ).toNumber();
  },
  async userPosition(
    parent: StakePool,
    { owner }: StakePoolUserPositionArgs
  ): Promise<UserPosition> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const userPosition = await poolClient.queryUserPosition(owner);
    return {
      amountStaked: userPosition.amountStaked.toNumber(),
      coinInfoReward: parent.coinInfoReward,
      coinInfoStake: parent.coinInfoStake,
      lastAccRewardPerShare: userPosition.lastAccRewardPerShare.toNumber(),
      owner,
    };
  },
  async createEvents(parent: StakePool): Promise<CreateStakePoolEvent[]> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const events = await poolClient.createEvents();
    return events.map((e) => {
      return {
        ...e,
        startTime: e.startTimeUs.divn(1000).toString(),
        endTime: e.endTimeUs.divn(1000).toString(),
        rewardCoinInfo: coinInfoReward,
        stakeCoinInfo: coinInfoStake,
        time: e.timestamp.divn(1000).toString(),
        rewardAmount: e.rewardAmount
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
      };
    });
  },
  async depositEvents(parent: StakePool): Promise<StakeDepositEvent[]> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const events = await poolClient.depositEvents();
    return events.map((e) => {
      return {
        ...e,
        accRewardPerShare: e.accRewardPerShare.toNumber(),
        rewardCoinInfo: coinInfoReward,
        stakeCoinInfo: coinInfoStake,
        time: e.timestamp.divn(1000).toString(),
        rewardRemaining: e.rewardRemaining
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
        totalAmountStaked: e.totalAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
        userAmountStaked: e.userAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
        userRewardAmount: e.userRewardAmount
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
      };
    });
  },
  async withdrawEvents(parent: StakePool): Promise<StakeWithdrawEvent[]> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const events = await poolClient.withdrawEvents();
    return events.map((e) => {
      return {
        ...e,
        accRewardPerShare: e.accRewardPerShare.toNumber(),
        rewardCoinInfo: coinInfoReward,
        stakeCoinInfo: coinInfoStake,
        time: e.timestamp.divn(1000).toString(),
        rewardRemaining: e.rewardRemaining
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
        totalAmountStaked: e.totalAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
        userAmountStaked: e.userAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
        userRewardAmount: e.userRewardAmount
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
        withdrawAmount: e.withdrawAmount
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
      };
    });
  },
  async claimEvents(parent: StakePool): Promise<ClaimEvent[]> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const events = await poolClient.claimEvents();
    return events.map((e) => {
      return {
        ...e,
        accRewardPerShare: e.accRewardPerShare.toNumber(),
        rewardCoinInfo: coinInfoReward,
        stakeCoinInfo: coinInfoStake,
        time: e.timestamp.divn(1000).toString(),
        rewardRemaining: e.rewardRemaining
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
        totalAmountStaked: e.totalAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
        userRewardAmount: e.userRewardAmount
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
      };
    });
  },
  async modifyPoolEvents(parent: StakePool): Promise<ModifyPoolEvent[]> {
    const coinInfoReward = await auxClient.getCoinInfo(
      parent.coinInfoReward.coinType
    );
    const coinInfoStake = await auxClient.getCoinInfo(
      parent.coinInfoStake.coinType
    );
    const poolClient = new StakePoolClient(auxClient, {
      coinInfoReward,
      coinInfoStake,
    });
    const events = await poolClient.modifyPoolEvents();
    return events.map((e) => {
      return {
        ...e,
        startTime: e.startTimeUs.divn(1000).toString(),
        endTime: e.endTimeUs.divn(1000).toString(),
        rewardCoinInfo: coinInfoReward,
        stakeCoinInfo: coinInfoStake,
        time: e.timestamp.divn(1000).toString(),
        accRewardPerShare: e.accRewardPerShare.toNumber(),
        rewardRemaining: e.rewardRemaining
          .toDecimalUnits(coinInfoReward.decimals)
          .toNumber(),
        totalAmountStaked: e.totalAmountStaked
          .toDecimalUnits(coinInfoStake.decimals)
          .toNumber(),
      };
    });
  },
};
