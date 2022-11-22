import type { Types } from "aptos";
import BN from "bn.js";
import _ from "lodash";
import type {
  AuxClient,
  AuxClientOptions,
  AuxTransaction,
  CoinInfo,
} from "../client";
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
  RawStakePool,
  RawStakePoolEvent,
  RawUserPosition,
  StakeDepositEvent,
  StakePool,
  StakePoolEvent,
  StakePoolInput,
  StakeWithdrawEvent,
  UserPosition,
  withdrawPayload,
} from "./schema";

const REWARD_PER_SHARE_MUL = new BN(1e12);

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
    this.type = `${auxClient.moduleAddress}::stake::Pools<${coinInfoStake.coinType}, ${coinInfoReward.coinType}>`;
    this.coinInfoStake = coinInfoStake;
    this.coinInfoReward = coinInfoReward;
  }

  /******************/
  /* READ FUNCTIONS */
  /******************/

  /**
   * Get the current on-chain stake pool state.
   * @param poolId ID of the pool to query
   * @returns
   */
  async query(poolId: number): Promise<StakePool> {
    const resource = await this.auxClient.aptosClient.getAccountResource(
      this.auxClient.moduleAddress,
      this.type
    );
    const poolsTable = (resource.data as any).pools.handle;
    const value_type = `${this.auxClient.moduleAddress}::stake::Pool<${this.coinInfoStake.coinType}, ${this.coinInfoReward.coinType}>`;
    let data: Types.TableItemRequest = {
      key_type: "u64",
      value_type,
      key: poolId.toString(),
    };
    const pool: RawStakePool = await this.auxClient.aptosClient.getTableItem(
      poolsTable,
      data
    );
    return {
      poolId: poolId,
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
    poolId,
    lastPoolState,
  }: {
    poolId: number;
    lastPoolState?: StakePool;
  }): Promise<BN> {
    let pool = lastPoolState;
    if (!pool) {
      pool = await this.query(poolId);
    }
    const latestInfo = await this.auxClient.aptosClient.getLedgerInfo();
    const timestamp = new BN(latestInfo.ledger_timestamp);
    const timeSinceUpdate = timestamp.sub(pool.lastUpdateTime);
    const durationReward = timeSinceUpdate
      .mul(
        pool.rewardRemaining.toAtomicUnits(this.coinInfoReward.decimals).toBN()
      )
      .divRound(pool.endTime.sub(pool.lastUpdateTime));
    const stakeAu = pool.amountStaked
      .toAtomicUnits(this.coinInfoStake.decimals)
      .toBN();
    return durationReward.mul(REWARD_PER_SHARE_MUL).divRound(stakeAu);
  }

  /**
   * Get on-chain state of a user's stake position for the given pool ID
   * @returns UserPosition
   */
  async queryUserPosition({
    poolId,
    userAddress,
  }: {
    poolId: number;
    userAddress: Types.Address;
  }): Promise<UserPosition> {
    const userPositionsType = `${this.auxClient.moduleAddress}::stake::UserPositions<${this.coinInfoStake.coinType}, ${this.coinInfoReward.coinType}>`;
    const resource = await this.auxClient.aptosClient.getAccountResource(
      userAddress,
      userPositionsType
    );
    const userPositionsTable = (resource.data as any).positions.handle;
    const value_type = `${this.auxClient.moduleAddress}::stake::UserPosition<${this.coinInfoStake.coinType}, ${this.coinInfoReward.coinType}>`;
    let data: Types.TableItemRequest = {
      key_type: "u64",
      value_type,
      key: poolId.toString(),
    };
    const position: RawUserPosition =
      await this.auxClient.aptosClient.getTableItem(userPositionsTable, data);
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
    poolId,
    userAddress,
    lastUserPositionState,
  }: {
    poolId: number;
    userAddress: Types.Address;
    lastUserPositionState?: UserPosition;
  }): Promise<DecimalUnits> {
    let userPosition = lastUserPositionState;
    if (!userPosition) {
      userPosition = await this.queryUserPosition({ poolId, userAddress });
    }
    const accRewardPerShare = await this.calcAccRewardPerShare({ poolId });
    return AU(
      accRewardPerShare
        .sub(userPosition.lastAccRewardPerShare)
        .mul(
          userPosition.amountStaked
            .toAtomicUnits(this.coinInfoStake.decimals)
            .toBN()
        )
        .div(REWARD_PER_SHARE_MUL)
    ).toDecimalUnits(this.coinInfoReward.decimals);
  }

  /*******************/
  /* WRITE FUNCTIONS */
  /*******************/

  /**
   * Create a stake pool, specifying reward amount and end time.
   */
  async create(
    {
      rewardAmount,
      durationUs,
    }: { rewardAmount: AnyUnits; durationUs: number },
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
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      createStakePoolPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseCreatePoolTransaction(transaction);
  }

  /**
   * Deposit stake coin to the incentive pool to start earning rewards.
   * All pending rewards will be transferred to `sender`.
   */
  async deposit(
    { amount, poolId }: { amount: AnyUnits; poolId: number },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeDepositEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
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
    { amount, poolId }: { amount: AnyUnits; poolId: number },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeWithdrawEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
      amount: toAtomicUnits(amount, this.coinInfoStake.decimals).toU64(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      withdrawPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseStakeWithdrawTransaction(transaction);
  }

  async claim(
    poolId: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ClaimEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      claimPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseClaimTransaction(transaction);
  }

  async modifyPool(
    {
      poolId,
      rewardAmount,
      rewardIncrease,
      timeAmount,
      timeIncrease,
    }: {
      poolId: number;
      rewardAmount?: AnyUnits;
      rewardIncrease?: boolean;
      timeAmount?: BN;
      timeIncrease?: boolean;
    },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
      rewardAmount:
        toAtomicUnits(rewardAmount, this.coinInfoReward.decimals).toU64() ??
        "0",
      rewardIncrease: rewardIncrease ?? false,
      timeAmountUs: timeAmount?.toString() ?? "0",
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
   * @param input poolId: ID of the pool to modify, newAuthority: address of the new authority
   * @param options transaction options
   * @returns
   */
  async modifyAuthority(
    { poolId, newAuthority }: { poolId: number; newAuthority: Types.Address },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
      newAuthority,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      modifyAuthorityPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseModifyPoolTransaction(transaction);
  }

  async deleteEmptyPool(
    poolId: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
    };
    return this.auxClient.sendOrSimulateTransaction(
      deleteEmptyPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
  }

  async endRewardEarly(
    poolId: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolId: poolId.toString(),
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
