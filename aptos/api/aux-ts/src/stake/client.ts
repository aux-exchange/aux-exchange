import type { Types } from "aptos";
import BN from "bn.js";
import _ from "lodash";
import type {
  AuxClient,
  AuxClientOptions,
  AuxTransaction,
  CoinInfo,
} from "../client";
import { AnyUnits, AtomicUnits, toAtomicUnits } from "../units";
import {
  ClaimEvent,
  claimPayload,
  CreatePoolEvent,
  createStakePoolPayload,
  deleteEmptyPoolPayload,
  depositPayload,
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
  StakeDepositEvent,
  StakePool,
  StakePoolEvent,
  StakePoolInput,
  StakeWithdrawEvent,
  withdrawPayload,
} from "./schema";

/**
 * Client for interfacing with the AMM liquidity pools.
 *
 * Currently only binary liquidity pools are assumed and supported. In the future, should n-ary
 * pools of 3 or more be introduced, users can expect a separate `NPool` (or similarly named)
 * client use.
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
    { coinTypeStake, coinTypeReward }: StakePoolInput
  ) {
    this.auxClient = auxClient;
    this.type = `${auxClient.moduleAddress}::stake::Pools<${coinTypeStake}, ${coinTypeReward}>`;
    this.coinInfoStake = coinTypeStake;
    this.coinInfoReward = coinTypeReward;
  }

  async query({ poolID }: { poolID: number }): Promise<StakePool> {
    const resource = await this.auxClient.aptosClient.getAccountResource(
      this.auxClient.moduleAddress,
      this.type
    );
    // const rawPools = resource.data as any;
    const poolsTable = (resource.data as any).pools;
    let data: Types.TableItemRequest = {
      key_type: "u64",
      value_type: `${this.auxClient.moduleAddress}::stake::Pool<${this.coinInfoStake.coinType}, ${this.coinInfoReward.coinType}>`,
      key: poolID.toString(),
    };
    const pool: RawStakePool = await this.auxClient.aptosClient.getTableItem(
      poolsTable,
      data
    );
    return {
      poolID: poolID,
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
   * Create a stake pool, specifying reward amount and end time.
   */
  async create(
    { rewardAmount, endTimeUs }: { rewardAmount: AnyUnits; endTimeUs: number },
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
      endTimeUs: endTimeUs.toString(),
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
    { amount, poolID }: { amount: AnyUnits; poolID: number },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeDepositEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolID: poolID.toString(),
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
    { amount, poolID }: { amount: AnyUnits; poolID: number },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<StakeWithdrawEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolID: poolID.toString(),
      amount: toAtomicUnits(amount, this.coinInfoStake.decimals).toU64(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      withdrawPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseStakeWithdrawTransaction(transaction);
  }

  async claim(
    poolID: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ClaimEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolID: poolID.toString(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      claimPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseClaimTransaction(transaction);
  }

  async modifyPool(
    {
      poolID,
      rewardAmount,
      rewardIncrease,
      timeAmount,
      timeIncrease,
    }: {
      poolID: number;
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
      poolID: poolID.toString(),
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
   * @param input poolID: ID of the pool to modify, newAuthority: address of the new authority
   * @param options transaction options
   * @returns
   */
  async modifyAuthority(
    { poolID, newAuthority }: { poolID: number; newAuthority: Types.Address },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<ModifyPoolEvent>> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolID: poolID.toString(),
      newAuthority,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      modifyAuthorityPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseModifyPoolTransaction(transaction);
  }

  async deleteEmptyPool(
    poolID: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const input = {
      coinTypeStake: this.coinInfoStake.coinType,
      coinTypeReward: this.coinInfoReward.coinType,
      poolID: poolID.toString(),
    };
    return this.auxClient.sendOrSimulateTransaction(
      deleteEmptyPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
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
      (event) => event.type === poolEventType
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
