import type { Types } from "aptos";
import type { CoinInfo } from "../client";
import { AtomicUnits, DecimalUnits } from "../units";
import BN from "bn.js";

/**********************/
/* Stake pool schemas */
/**********************/

export interface StakePool {
  coinInfoStake: CoinInfo;
  coinInfoReward: CoinInfo;
  authority: Types.Address;
  startTime: BN;
  endTime: BN;
  amountStaked: DecimalUnits;
  amountReward: DecimalUnits;
  rewardRemaining: DecimalUnits;
  lastUpdateTime: BN;
  accRewardPerShare: BN;
}

export interface RawStakePool {
  authority: Types.Address;
  start_time: Types.U64;
  end_time: Types.U64;
  reward_remaining: Types.U64;
  stake: { value: Types.U64 };
  reward: { value: Types.U64 };
  last_update_time: Types.U64;
  acc_reward_per_share: Types.U64;
}

export interface UserPosition {
  owner: Types.Address;
  coinInfoStake: CoinInfo;
  coinInfoReward: CoinInfo;
  amountStaked: DecimalUnits;
  lastAccRewardPerShare: BN;
}

export interface RawUserPosition {
  amount_staked: Types.U64;
  last_acc_reward_per_share: Types.U128;
}

/********************************************************************/
/* Event schemas (the shape of Stake pool data in an Aptos "event") */
/********************************************************************/

export interface StakePoolEvent {
  kind:
    | "CreatePoolEvent"
    | "StakeDepositEvent"
    | "StakeWithdrawEvent"
    | "ClaimEvent"
    | "ModifyPoolEvent";
  type: Types.MoveStructTag;
  sequenceNumber: BN;
  timestamp: BN;
  version: string;
  stakeCoinType: Types.MoveStructTag;
  rewardCoinType: Types.MoveStructTag;
}

export interface CreatePoolEvent extends StakePoolEvent {
  kind: "CreatePoolEvent";
  authority: Types.Address;
  startTimeUs: BN;
  endTimeUs: BN;
  rewardAmount: AtomicUnits;
}

export interface StakeDepositEvent extends StakePoolEvent {
  kind: "StakeDepositEvent";
  user: Types.Address;
  depositAmount: AtomicUnits;
  userRewardAmount: AtomicUnits;
  userAmountStaked: AtomicUnits;
  totalAmountStaked: AtomicUnits;
  rewardRemaining: AtomicUnits;
  accRewardPerShare: BN;
}

export interface StakeWithdrawEvent extends StakePoolEvent {
  kind: "StakeWithdrawEvent";
  user: Types.Address;
  withdrawAmount: AtomicUnits;
  userRewardAmount: AtomicUnits;
  userAmountStaked: AtomicUnits;
  totalAmountStaked: AtomicUnits;
  rewardRemaining: AtomicUnits;
  accRewardPerShare: BN;
}

export interface ClaimEvent extends StakePoolEvent {
  kind: "ClaimEvent";
  user: Types.Address;
  userRewardAmount: AtomicUnits;
  totalAmountStaked: AtomicUnits;
  rewardRemaining: AtomicUnits;
  accRewardPerShare: BN;
}

export interface ModifyPoolEvent extends StakePoolEvent {
  kind: "ModifyPoolEvent";
  authority: Types.Address;
  startTimeUs: BN;
  endTimeUs: BN;
  totalAmountStaked: AtomicUnits;
  rewardRemaining: AtomicUnits;
  accRewardPerShare: BN;
}
export interface RawStakePoolEvent extends Types.Event {
  kind:
    | "RawCreatePoolEvent"
    | "RawStakeDepositEvent"
    | "RawStakeWithdrawEvent"
    | "RawClaimEvent"
    | "RawModifyPoolEvent";
}

export interface RawCreatePoolEvent extends RawStakePoolEvent {
  kind: "RawCreatePoolEvent";
  version: string;
  data: {
    pool_id: Types.U64;
    authority: Types.Address;
    start_time: Types.U64;
    end_time: Types.U64;
    reward_amount: Types.U64;
    timestamp: Types.U64;
  };
}

export interface RawStakeDepositEvent extends RawStakePoolEvent {
  kind: "RawStakeDepositEvent";
  version: string;
  data: {
    pool_id: Types.U64;
    user: Types.Address;
    deposit_amount: Types.U64;
    user_reward_amount: Types.U64;
    user_amount_staked: Types.U64;
    total_amount_staked: Types.U64;
    reward_remaining: Types.U64;
    acc_reward_per_share: Types.U64;
    timestamp: Types.U64;
  };
}

export interface RawStakeWithdrawEvent extends RawStakePoolEvent {
  kind: "RawStakeWithdrawEvent";
  version: string;
  data: {
    pool_id: Types.U64;
    user: Types.Address;
    withdraw_amount: Types.U64;
    user_reward_amount: Types.U64;
    user_amount_staked: Types.U64;
    total_amount_staked: Types.U64;
    reward_remaining: Types.U64;
    acc_reward_per_share: Types.U64;
    timestamp: Types.U64;
  };
}

export interface RawClaimEvent extends RawStakePoolEvent {
  kind: "RawClaimEvent";
  version: string;
  data: {
    pool_id: Types.U64;
    user: Types.Address;
    reward_amount: Types.U64;
    total_amount_staked: Types.U64;
    reward_remaining: Types.U64;
    acc_reward_per_share: Types.U64;
    timestamp: Types.U64;
  };
}

export interface RawModifyPoolEvent extends RawStakePoolEvent {
  kind: "RawModifyPoolEvent";
  version: string;
  data: {
    pool_id: Types.U64;
    authority: Types.Address;
    start_time: Types.U64;
    end_time: Types.U64;
    total_amount_staked: Types.U64;
    reward_remaining: Types.U64;
    acc_reward_per_share: Types.U64;
    timestamp: Types.U64;
  };
}

export function parseRawCreatePoolEvent(
  event: RawCreatePoolEvent,
  moduleAddress: string
): CreatePoolEvent {
  const coinTypes = parseEventType(event.type, moduleAddress);
  return {
    kind: "CreatePoolEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    version: event.version,
    timestamp: new BN(event.data.timestamp),
    authority: event.data.authority,
    stakeCoinType: coinTypes.stakeCoinType,
    rewardCoinType: coinTypes.rewardCoinType,
    startTimeUs: new BN(event.data.start_time),
    endTimeUs: new BN(event.data.end_time),
    rewardAmount: new AtomicUnits(event.data.reward_amount),
  };
}

export function parseRawStakeDepositEvent(
  event: RawStakeDepositEvent,
  moduleAddress: string
): StakeDepositEvent {
  const coinTypes = parseEventType(event.type, moduleAddress);
  return {
    kind: "StakeDepositEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    version: event.version,
    timestamp: new BN(event.data.timestamp),
    user: event.data.user,
    stakeCoinType: coinTypes.stakeCoinType,
    rewardCoinType: coinTypes.rewardCoinType,
    depositAmount: new AtomicUnits(event.data.deposit_amount),
    userRewardAmount: new AtomicUnits(event.data.user_reward_amount),
    userAmountStaked: new AtomicUnits(event.data.user_amount_staked),
    totalAmountStaked: new AtomicUnits(event.data.total_amount_staked),
    rewardRemaining: new AtomicUnits(event.data.reward_remaining),
    accRewardPerShare: new BN(event.data.acc_reward_per_share),
  };
}

export function parseRawStakeWithdrawEvent(
  event: RawStakeWithdrawEvent,
  moduleAddress: string
): StakeWithdrawEvent {
  const coinTypes = parseEventType(event.type, moduleAddress);
  return {
    kind: "StakeWithdrawEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    version: event.version,
    timestamp: new BN(event.data.timestamp),
    user: event.data.user,
    stakeCoinType: coinTypes.stakeCoinType,
    rewardCoinType: coinTypes.rewardCoinType,
    withdrawAmount: new AtomicUnits(event.data.withdraw_amount),
    userRewardAmount: new AtomicUnits(event.data.user_reward_amount),
    userAmountStaked: new AtomicUnits(event.data.user_amount_staked),
    totalAmountStaked: new AtomicUnits(event.data.total_amount_staked),
    rewardRemaining: new AtomicUnits(event.data.reward_remaining),
    accRewardPerShare: new BN(event.data.acc_reward_per_share),
  };
}

export function parseRawClaimEvent(
  event: RawClaimEvent,
  moduleAddress: string
): ClaimEvent {
  const coinTypes = parseEventType(event.type, moduleAddress);
  return {
    kind: "ClaimEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    version: event.version,
    timestamp: new BN(event.data.timestamp),
    user: event.data.user,
    stakeCoinType: coinTypes.stakeCoinType,
    rewardCoinType: coinTypes.rewardCoinType,
    userRewardAmount: new AtomicUnits(event.data.reward_amount),
    totalAmountStaked: new AtomicUnits(event.data.total_amount_staked),
    rewardRemaining: new AtomicUnits(event.data.reward_remaining),
    accRewardPerShare: new BN(event.data.acc_reward_per_share),
  };
}

export function parseRawModifyPoolEvent(
  event: RawModifyPoolEvent,
  moduleAddress: string
): ModifyPoolEvent {
  const coinTypes = parseEventType(event.type, moduleAddress);
  return {
    kind: "ModifyPoolEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    version: event.version,
    timestamp: new BN(event.data.timestamp),
    authority: event.data.authority,
    startTimeUs: new BN(event.data.start_time),
    endTimeUs: new BN(event.data.end_time),
    stakeCoinType: coinTypes.stakeCoinType,
    rewardCoinType: coinTypes.rewardCoinType,
    totalAmountStaked: new AtomicUnits(event.data.total_amount_staked),
    rewardRemaining: new AtomicUnits(event.data.reward_remaining),
    accRewardPerShare: new BN(event.data.acc_reward_per_share),
  };
}

function parseEventType(
  type: Types.MoveStructTag,
  moduleAddress: string
): {
  stakeCoinType: Types.MoveStructTag;
  rewardCoinType: Types.MoveStructTag;
} {
  const poolRegex = new RegExp(
    `${moduleAddress}::stake::(?<event>[a-zA-Z]+)<(?<stake>.*), (?<reward>.*)>`
  );
  const found = type.match(poolRegex);
  let stakeCoinType = found?.groups?.["stake"]!;
  let rewardCoinType = found?.groups?.["reward"]!;

  return {
    stakeCoinType,
    rewardCoinType,
  };
}
/******************************/
/* Input schemas (Stake pool) */
/******************************/

export interface StakePoolInput {
  coinInfoStake: CoinInfo;
  coinInfoReward: CoinInfo;
}

/********************************/
/* EntryFunctionPayload schemas */
/********************************/

export function createStakePoolPayload(
  moduleAddress: Types.Address,
  input: CreateStakePoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::create`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [input.rewardAmount, input.durationUs],
  };
}

export function depositPayload(
  moduleAddress: Types.Address,
  input: DepositWithdrawPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::deposit`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [input.amount],
  };
}

export function withdrawPayload(
  moduleAddress: Types.Address,
  input: DepositWithdrawPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::withdraw`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [input.amount],
  };
}

export function claimPayload(
  moduleAddress: Types.Address,
  input: {
    coinTypeStake: Types.MoveStructTag;
    coinTypeReward: Types.MoveStructTag;
  }
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::claim`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [],
  };
}

export function modifyAuthorityPayload(
  moduleAddress: Types.Address,
  input: {
    coinTypeStake: Types.MoveStructTag;
    coinTypeReward: Types.MoveStructTag;
    newAuthority: Types.Address;
  }
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::modify_authority`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [input.newAuthority],
  };
}

export function modifyPoolPayload(
  moduleAddress: Types.Address,
  input: {
    coinTypeStake: Types.MoveStructTag;
    coinTypeReward: Types.MoveStructTag;
    rewardAmount: Types.U64;
    rewardIncrease: boolean;
    timeAmountUs: Types.U64;
    timeIncrease: boolean;
  }
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::modify_pool`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [
      input.rewardAmount,
      input.rewardIncrease,
      input.timeAmountUs,
      input.timeIncrease,
    ],
  };
}

export function deleteEmptyPoolPayload(
  moduleAddress: Types.Address,
  input: {
    coinTypeStake: Types.MoveStructTag;
    coinTypeReward: Types.MoveStructTag;
  }
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::delete_empty_pool`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [],
  };
}

export function endRewardEarlyPayload(
  moduleAddress: Types.Address,
  input: {
    coinTypeStake: Types.MoveStructTag;
    coinTypeReward: Types.MoveStructTag;
  }
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stake::end_reward_early`,
    type_arguments: [input.coinTypeStake, input.coinTypeReward],
    arguments: [],
  };
}

/****************************************/
/* Input schemas (EntryFunctionPayload) */
/****************************************/

export interface CreateStakePoolPayloadInput {
  coinTypeStake: Types.MoveStructTag;
  coinTypeReward: Types.MoveStructTag;
  rewardAmount: Types.U64;
  durationUs: Types.U64;
}

export interface DepositWithdrawPayloadInput {
  coinTypeStake: Types.MoveStructTag;
  coinTypeReward: Types.MoveStructTag;
  amount: Types.U64;
}
