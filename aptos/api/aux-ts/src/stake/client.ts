import type { Types } from "aptos";
import BN from "bn.js";
import * as assert from "assert";
import _ from "lodash";
import type {
  AuxClient,
  AuxClientOptions,
  AuxTransaction,
  CoinInfo,
} from "../client";
import { getUsdPrice } from "../graphql/pyth";
import {
  AnyUnits,
  AtomicUnits,
  AU,
  DecimalUnits,
  toAtomicUnits,
} from "../units";
import {
  ClaimEvent,
  claimPayload,
  CreatePoolEvent,
  createStakePoolPayload,
  deleteEmptyPoolPayload,
  depositPayload,
  endRewardEarlyPayload,
  modifyAuthorityPayload,
  ModifyPoolEvent,
  modifyPoolPayload,
  parseRawClaimEvent,
  parseRawCreatePoolEvent,
  parseRawModifyPoolEvent,
  parseRawStakeDepositEvent,
  parseRawStakeWithdrawEvent,
  RawClaimEvent,
  RawCreatePoolEvent,
  RawModifyPoolEvent,
  RawStakeDepositEvent,
  RawStakePool,
  RawStakePoolEvent,
  RawStakeWithdrawEvent,
  RawUserPosition,
  StakeDepositEvent,
  StakePool,
  StakePoolEvent,
  StakePoolInput,
  StakeWithdrawEvent,
  UserPosition,
  withdrawPayload,
} from "./schema";

const REWARD_PER_SHARE_MUL = 1e12;

/**
 * Client for interfacing with the staking reward pools (stake.move).
 */
export class StakePoolClient {
  readonly auxClient: AuxClient;
  readonly type: Types.MoveStructTag;
  readonly coinInfoStake: CoinInfo;
  readonly coinInfoReward: CoinInfo;

  /********************/
  /* Public functions */
  /********************/

  constructor(
    auxClient: AuxClient,
    { coinInfoReward, coinInfoStake }: StakePoolInput
  ) {
    this.auxClient = auxClient;
    this.type = `${auxClient.moduleAddress}::stake::Pool<${coinInfoStake.coinType}, ${coinInfoReward.coinType}>`;
    this.coinInfoStake = coinInfoStake;
    this.coinInfoReward = coinInfoReward;
  }

  /******************/
  /* READ FUNCTIONS */
  /******************/

  /**
   * Get the current on-chain stake pool state.
   * @returns
   */
  async query(): Promise<StakePool> {
    const pool: RawStakePool = (
      (await this.auxClient.aptosClient.getAccountResource(
        this.auxClient.moduleAddress,
        this.type
      )) as any
    ).data;
    return {
      coinInfoStake: this.coinInfoStake,
      coinInfoReward: this.coinInfoReward,
      authority: pool.authority,
      startTime: new BN(pool.start_time),
      endTime: new BN(pool.end_time),
      amountStaked: new AtomicUnits(pool.stake.value).toDecimalUnits(
        this.coinInfoStake.decimals
      ),
      amountReward: new AtomicUnits(pool.reward.value).toDecimalUnits(
        this.coinInfoReward.decimals
      ),
      rewardRemaining: new AtomicUnits(pool.reward_remaining).toDecimalUnits(
        this.coinInfoReward.decimals
      ),
      lastUpdateTime: new BN(pool.last_update_time),
      accRewardPerShare: new BN(pool.acc_reward_per_share),
    };
  }

  /**
   * Calculate the current accumulated reward per share for the given pool ID. Does not modify on-chain state.
   * @returns
   */
  async calcAccRewardPerShare({
    lastPoolState,
    currentTimeUs,
  }: {
    lastPoolState?: StakePool | undefined;
    currentTimeUs?: BN | undefined;
  }): Promise<BN> {
    let pool = lastPoolState;
    if (!pool) {
      pool = await this.query();
    }
    let timestamp = currentTimeUs;
    if (!timestamp) {
      const latestInfo = await this.auxClient.aptosClient.getLedgerInfo();
      timestamp = new BN(latestInfo.ledger_timestamp);
    }
    const timeSinceUpdate = timestamp.sub(pool.lastUpdateTime);

    // Pool is expired
    if (pool.endTime.lte(timestamp)) {
      return pool.accRewardPerShare;
    }

    const durationReward = Math.floor(
      (timeSinceUpdate.toNumber() *
        pool.rewardRemaining
          .toAtomicUnits(this.coinInfoReward.decimals)
          .toNumber()) /
        pool.endTime.sub(pool.lastUpdateTime).toNumber()
    );
    const stakeAu = pool.amountStaked
      .toAtomicUnits(this.coinInfoStake.decimals)
      .toBN();

    if (stakeAu.toNumber() == 0) {
      return pool.accRewardPerShare;
    }
    const accRewardPerShare = Math.floor(
      (durationReward * REWARD_PER_SHARE_MUL) / stakeAu.toNumber()
    );
    return pool.accRewardPerShare.add(new BN(accRewardPerShare));
  }

  /**
   * Returns current pool APR (dollar denominated)
   * @param poolId
   * @returns
   */
  async calcApr(
    poolState?: StakePool,
    currentTimeUs?: BN
  ): Promise<number | undefined> {
    let pool = poolState;
    if (!pool) {
      pool = await this.query();
    }
    assert.ok(!!pool);
    let currentTime = currentTimeUs;
    if (!currentTime) {
      currentTime = new BN(
        (await this.auxClient.aptosClient.getLedgerInfo()).ledger_timestamp
      );
    }
    if (pool.endTime < currentTime) {
      return 0;
    }
    const rewardUsdPrice = await getUsdPrice(
      this.auxClient,
      this.coinInfoReward.coinType
    );
    const stakeUsdPrice = await getUsdPrice(
      this.auxClient,
      this.coinInfoStake.coinType
    );
    if (!!rewardUsdPrice && !!stakeUsdPrice) {
      const remainingRewardUSD =
        pool.rewardRemaining.toNumber() * rewardUsdPrice;
      const remainingDays =
        pool.endTime.sub(currentTime).toNumber() / (24 * 3600 * 1_000_000);
      const dailyReward = remainingRewardUSD / remainingDays;
      const dailyRewardPerShare =
        pool.amountStaked.toNumber() == 0
          ? dailyReward
          : dailyReward / pool.amountStaked.toNumber();
      const dailyReturn = dailyRewardPerShare / stakeUsdPrice;
      return dailyReturn * 365 * 100;
    }
    return undefined;
  }

  /**
   * Get on-chain state of a user's stake position for the given pool ID
   * @returns UserPosition
   */
  async queryUserPosition(userAddress: Types.Address): Promise<UserPosition> {
    const userPositionType = `${this.auxClient.moduleAddress}::stake::UserPosition<${this.coinInfoStake.coinType}, ${this.coinInfoReward.coinType}>`;
    const position: RawUserPosition = (
      (await this.auxClient.aptosClient.getAccountResource(
        userAddress,
        userPositionType
      )) as any
    ).data;
    return {
      owner: userAddress,
      coinInfoStake: this.coinInfoStake,
      coinInfoReward: this.coinInfoReward,
      amountStaked: AU(position.amount_staked).toDecimalUnits(
        this.coinInfoStake.decimals
      ),
      lastAccRewardPerShare: new BN(position.last_acc_reward_per_share),
    };
  }

  /**
   * Calculate a user's current pending reward. Does not modify on-chain state.
   * @returns pending reward as decimal units
   */
  async calcPendingUserReward({
    userAddress,
    userPosition,
    currentTimeUs,
    lastPoolState,
  }: {
    userAddress: Types.Address;
    userPosition?: UserPosition;
    currentTimeUs?: BN;
    lastPoolState?: StakePool;
  }): Promise<DecimalUnits> {
    let userPositionState = userPosition;
    if (!userPositionState) {
      userPositionState = await this.queryUserPosition(userAddress);
    }
    const accRewardPerShare = await this.calcAccRewardPerShare({
      currentTimeUs,
      lastPoolState,
    });
    const stakeAu = userPositionState.amountStaked
      .toAtomicUnits(this.coinInfoStake.decimals)
      .toNumber();
    return AU(
      Math.floor(
        ((accRewardPerShare.toNumber() -
          userPositionState.lastAccRewardPerShare.toNumber()) *
          stakeAu) /
          1e12
      )
    ).toDecimalUnits(this.coinInfoReward.decimals);
  }

  async createEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<CreatePoolEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "create_pool_events",
      queryParameter
    )) as RawCreatePoolEvent[];
    const ret = events.map((e) =>
      parseRawCreatePoolEvent(e, this.auxClient.moduleAddress)
    );
    return ret;
  }

  async depositEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<StakeDepositEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "deposit_events",
      queryParameter
    )) as RawStakeDepositEvent[];
    const ret = events.map((e) =>
      parseRawStakeDepositEvent(e, this.auxClient.moduleAddress)
    );
    return ret;
  }

  async withdrawEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<StakeWithdrawEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "withdraw_events",
      queryParameter
    )) as RawStakeWithdrawEvent[];
    const ret = events.map((e) =>
      parseRawStakeWithdrawEvent(e, this.auxClient.moduleAddress)
    );
    return ret;
  }

  async claimEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<ClaimEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "claim_events",
      queryParameter
    )) as RawClaimEvent[];
    const ret = events.map((e) =>
      parseRawClaimEvent(e, this.auxClient.moduleAddress)
    );
    return ret;
  }

  async modifyPoolEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<ModifyPoolEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "modify_pool_events",
      queryParameter
    )) as RawModifyPoolEvent[];
    const ret = events.map((e) =>
      parseRawModifyPoolEvent(e, this.auxClient.moduleAddress)
    );
    return ret;
  }

  /*******************/
  /* WRITE FUNCTIONS */
  /*******************/

  /**
   * Create a stake pool, specifying reward amount and duration.
   */
  async create(
    { rewardAmount, durationUs }: { rewardAmount: AnyUnits; durationUs: BN },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<CreatePoolEvent>> {
    const rewardAmountAu = toAtomicUnits(
      rewardAmount,
      this.coinInfoReward.decimals
    );
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      rewardAmount: rewardAmountAu.toU64(),
      durationUs: durationUs.toString(),
    };
    const payload = createStakePoolPayload(this.auxClient.moduleAddress, input);
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseCreatePoolTransaction(transaction);
  }

  /**
   * Deposit stake coin to the incentive pool to start earning rewards.
   * All pending rewards will be transferred to `sender`.
   */
  async deposit(
    amount: AnyUnits,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeDepositEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      amount: toAtomicUnits(amount, this.coinInfoStake.decimals).toU64(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      depositPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseStakeDepositTransaction(transaction);
  }

  /**
   * Withdraw stake coin from the incentive pool.
   * All pending rewards will be transferred to `sender`.
   **/
  async withdraw(
    amount: AnyUnits,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeWithdrawEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      amount: toAtomicUnits(amount, this.coinInfoStake.decimals).toU64(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      withdrawPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseStakeWithdrawTransaction(transaction);
  }

  async claim(
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ClaimEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      claimPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseClaimTransaction(transaction);
  }

  async modifyPool(
    {
      rewardAmount,
      rewardIncrease,
      timeAmountUs,
      timeIncrease,
    }: {
      rewardAmount?: AnyUnits | null;
      rewardIncrease?: boolean | null;
      timeAmountUs?: BN | null;
      timeIncrease?: boolean | null;
    },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      rewardAmount: rewardAmount
        ? toAtomicUnits(rewardAmount, this.coinInfoReward.decimals).toU64() ??
          "0"
        : "0",
      rewardIncrease: rewardIncrease ?? false,
      timeAmountUs: timeAmountUs?.toString() ?? "0",
      timeIncrease: timeIncrease ?? false,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      modifyPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseModifyPoolTransaction(transaction);
  }

  /**
   * Modify incentive pool authority.
   * Only the pool's authority can modify authority.
   * @param input newAuthority: address of the new authority
   * @param options transaction options
   * @returns
   */
  async modifyAuthority(
    newAuthority: Types.Address,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      newAuthority,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      modifyAuthorityPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseModifyPoolTransaction(transaction);
  }

  async deleteEmptyPool(
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
    };
    return this.auxClient.sendOrSimulateTransaction(
      deleteEmptyPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
  }

  async endRewardEarly(
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      endRewardEarlyPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseModifyPoolTransaction(transaction);
  }

  /*********************/
  /* Parsing Functions */
  /*********************/

  parseCreatePoolTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<CreatePoolEvent> {
    return this.parseStakePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stake::CreatePoolEvent`,
      parseRawCreatePoolEvent
    );
  }

  parseStakeDepositTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<StakeDepositEvent> {
    return this.parseStakePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stake::DepositEvent`,
      parseRawStakeDepositEvent
    );
  }

  parseStakeWithdrawTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<StakeWithdrawEvent> {
    return this.parseStakePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stake::WithdrawEvent`,
      parseRawStakeWithdrawEvent
    );
  }

  parseClaimTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<ClaimEvent> {
    return this.parseStakePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stake::ClaimEvent`,
      parseRawClaimEvent
    );
  }

  parseModifyPoolTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<ModifyPoolEvent> {
    return this.parseStakePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stake::ModifyPoolEvent`,
      parseRawModifyPoolEvent
    );
  }

  private parseStakePoolTransaction<
    RawType extends RawStakePoolEvent,
    ParsedType extends StakePoolEvent
  >(
    transaction: Types.UserTransaction,
    poolEventType: Types.MoveStructTag,
    parse: (raw: RawType, moduleAddress: string) => ParsedType
  ): AuxTransaction<ParsedType> {
    const events = transaction.events.filter(
      (event) => event.type.split("<")[0] === poolEventType
    );
    if (!transaction.success) {
      return { transaction, result: undefined };
    }
    if (events.length > 1) {
      throw new Error(
        `Got unexpected number of events: ${transaction.hash} ${JSON.stringify(
          events,
          undefined,
          4
        )}`
      );
    }
    if (events.length === 0) {
      return { transaction, result: undefined };
    }
    return {
      transaction,
      result: parse(events[0]! as RawType, this.auxClient.moduleAddress),
    };
  }
}
