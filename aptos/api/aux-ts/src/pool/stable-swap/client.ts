import type { Types } from "aptos";
import BN from "bn.js";
import type { AuxClient, AuxClientOptions, AuxTransaction } from "../../client";
import { AnyUnits, AtomicUnits, Bps, Pct, toAtomicUnits } from "../../units";
import {
  addLiquidity2PoolPayload,
  addLiquidity3PoolPayload,
  AddLiquidityEvent,
  AddLiquidityInput,
  createPool2PoolPayload,
  createPool3PoolPayload,
  parseRaw2PoolAddLiquidityEvent,
  parseRaw2PoolRemoveLiquidityEvent,
  parseRaw2PoolSwapEvent,
  parseRaw3PoolAddLiquidityEvent,
  parseRaw3PoolRemoveLiquidityEvent,
  PoolEvent,
  removeLiquidity2PoolPayload,
  removeLiquidity3PoolPayload,
  RemoveLiquidityEvent,
  swapCoinForExactCoin2PoolPayload,
  SwapEvent,
  swapExactCoinForCoin2PoolPayload,
  SwapExactInInput,
  SwapExactOutInput,
  SwapInput,
} from "./schema";

/**
 * Client for interfacing with the AMM liquidity pools.
 *
 * Currently only binary liquidity pools are assumed and supported. In the future, should n-ary
 * pools of 3 or more be introduced, users can expect a separate `NPool` (or similarly named)
 * client use.
 */
export class StableSwapClient {
  static readonly defaultSlippage: Bps = new Bps(50);

  readonly auxClient: AuxClient;
  readonly kind: "2pool" | "3pool";
  readonly type: Types.MoveStructTag;
  readonly coinTypes: Types.MoveStructTag[];
  readonly coinTypeLP: Types.MoveStructTag;

  /********************/
  /* Public functions */
  /********************/

  constructor(auxClient: AuxClient, coinTypes: Types.MoveStructTag[]) {
    this.auxClient = auxClient;
    if (coinTypes.length === 2) {
      this.kind = "2pool";
      this.type = `${auxClient.moduleAddress}::stable_2pool::Pool<${coinTypes[0]}, ${coinTypes[1]}>`;
      this.coinTypeLP = `${auxClient.moduleAddress}::stable_2pool::LP<${coinTypes[0]}, ${coinTypes[1]}>`;
    } else if (coinTypes.length === 3) {
      this.kind = "3pool";
      this.type = `${auxClient.moduleAddress}::stable_3pool::Pool<${coinTypes[0]}, ${coinTypes[1]}, ${coinTypes[2]}>`;
      this.coinTypeLP = `${auxClient.moduleAddress}::stable_3pool::LP<${coinTypes[0]}, ${coinTypes[1]}, ${coinTypes[2]}>`;
    } else {
      throw new Error("Unsupported number of coinTypes.");
    }
    this.coinTypes = coinTypes;
  }


  /**
   * Loads and parses resources and events associated with a pool.
   *
   * Make sure to call this after pool operations to refresh your local state.
   */
  async query() {
    const coinInfoLP = await this.auxClient.getCoinInfo(this.coinTypeLP, true); // refresh the LP token supply
    const coinInfos = await Promise.all(
      this.coinTypes.map((coinType) => this.auxClient.getCoinInfo(coinType))
    );
    const resource = await this.auxClient.aptosClient.getAccountResource(
      this.auxClient.moduleAddress,
      this.type
    );
    const rawPool = resource.data as any;
    const amounts = [];
    switch (this.kind) {
      case "2pool":
        amounts.push(
          new AtomicUnits(rawPool.reserve_0.value).toDecimalUnits(
            coinInfos[0]!.decimals
          )
        );
        amounts.push(
          new AtomicUnits(rawPool.reserve_1.value).toDecimalUnits(
            coinInfos[1]!.decimals
          )
        );
        break;
      case "3pool":
        amounts.push(
          new AtomicUnits(rawPool.reserve_0.value).toDecimalUnits(
            coinInfos[0]!.decimals
          )
        );
        amounts.push(
          new AtomicUnits(rawPool.reserve_1.value).toDecimalUnits(
            coinInfos[1]!.decimals
          )
        );
        amounts.push(
          new AtomicUnits(rawPool.reserve_2.value).toDecimalUnits(
            coinInfos[2]!.decimals
          )
        );
        break;
      default:
        const _exhaustiveCheck: never = this.kind;
        return _exhaustiveCheck;
    }
    return {
      coinInfos,
      coinInfoLP: coinInfoLP,
      amounts,
      amountLP: new AtomicUnits(
        coinInfoLP.supply[0]!.integer.vec[0]!.value
      ).toDecimalUnits(coinInfoLP.decimals),
      fee: new Bps(rawPool.fee_numerator / 10000000000),
      timestamp: new BN.BN(rawPool.timestamp),
    };
  }

  /**
   * Create a pool, specifying a swap fee. This fee goes entirely to LPs.
   */
  async create(
    { fee }: { fee: Pct | Bps },
    amp: number,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<Types.MoveStructTag>> {
    const input = {
      coinTypes: this.coinTypes,
      feeBps: (fee.toNumber() * 10000).toString(),
      amp: amp.toString(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      this.kind === "2pool"
        ? createPool2PoolPayload(this.auxClient.moduleAddress, {
            coinType0: input.coinTypes[0]!,
            coinType1: input.coinTypes[1]!,
            // BN multiplication not working
            feeNumerator: (new BN(fee.toBps()).mul(new BN(10_000_000_000))).toString(),
            amp: amp.toString(),
          })
        : createPool3PoolPayload(this.auxClient.moduleAddress, {
            coinType0: input.coinTypes[0]!,
            coinType1: input.coinTypes[1]!,
            coinType2: input.coinTypes[2]!,
            feeNumerator: (new BN(fee.toBps()).mul(new BN(10_000_000_000))).toString(),
            amp: amp.toString(),
          }),
      options
    );
    return {
      transaction,
      result: this.type,
    };
  }

  async swap(
    input: SwapInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<SwapEvent>> {
    if ("coinTypeIn" in input) {
      return this.swapExactIn(input, options);
    }
    return this.swapExactOut(input, options);
  }

  /**
   * Adds liquidity to the pool.
   *
   * - Sender transfers amounts X and Y. If the amounts do not match the pool ratio, the pool will
   *   round down to match the ratio and refund any unused coin.
   * - Pool mints and transfers LP tokens to sender, representing their position.
   */
  async addLiquidity(
    { amounts, minLP }: AddLiquidityInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<AddLiquidityEvent>> {
    const pool = await this.query();
    let payload;
    if (this.kind === "2pool") {
      payload = addLiquidity2PoolPayload(this.auxClient.moduleAddress, {
        coinType0: this.coinTypes[0]!,
        coinType1: this.coinTypes[1]!,
        coin0Amount: toAtomicUnits(
          amounts[0]!,
          pool.coinInfos[0]!.decimals
        ).toString(),
        coin1Amount: toAtomicUnits(
          amounts[1]!,
          pool.coinInfos[1]!.decimals
        ).toString(),
        minLpAmount: toAtomicUnits(minLP, pool.coinInfoLP.decimals).toString(),
      });
    } else {
      payload = addLiquidity3PoolPayload(this.auxClient.moduleAddress, {
        coinType0: this.coinTypes[0]!,
        coinType1: this.coinTypes[1]!,
        coinType2: this.coinTypes[2]!,
        coin0Amount: toAtomicUnits(
          amounts[0]!,
          pool.coinInfos[0]!.decimals
        ).toString(),
        coin1Amount: toAtomicUnits(
          amounts[1]!,
          pool.coinInfos[1]!.decimals
        ).toString(),
        coin2Amount: toAtomicUnits(
          amounts[2]!,
          pool.coinInfos[2]!.decimals
        ).toString(),
        minLpAmount: toAtomicUnits(minLP, pool.coinInfoLP.decimals).toString(),
      });
    }
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseAddLiquidityTransaction(transaction);
  }

  /**
   * Removes liquidity from the pool.
   * - Sender transfers LP tokens to the pool.
   * - Pool burns LP tokens and transfers amounts X and Y to the sender, derived from the current
   *   pool ratio.
   */
  async removeLiquidity(
    { amountLP }: { amountLP: AnyUnits; useAuxAccount?: boolean },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<RemoveLiquidityEvent>> {
    const pool = await this.query();
    let payload;
    if (this.kind === "2pool") {
      payload = removeLiquidity2PoolPayload(this.auxClient.moduleAddress, {
        coinType0: this.coinTypes[0]!,
        coinType1: this.coinTypes[1]!,
        lpAmount: toAtomicUnits(amountLP, pool.coinInfoLP.decimals).toString(),
      });
    } else {
      payload = removeLiquidity3PoolPayload(this.auxClient.moduleAddress, {
        coinType0: this.coinTypes[0]!,
        coinType1: this.coinTypes[1]!,
        coinType2: this.coinTypes[2]!,
        lpAmount: toAtomicUnits(amountLP, pool.coinInfoLP.decimals).toString(),
      });
    }
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseRemoveLiquidityTransaction(transaction);
  }

  /*********************/
  /* Private functions */
  /*********************/

  private async swapExactIn(
    { coinTypeIn, exactAmountIn, parameters }: SwapExactInInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<SwapEvent>> {
    parameters = parameters ?? {};
    const coinInfoIn = await this.auxClient.getCoinInfo(coinTypeIn);
    const coinInfoOut = await this.auxClient.getCoinInfo(
      coinTypeIn === this.coinTypes[0]!
        ? this.coinTypes[1]!
        : this.coinTypes[0]!
    );
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      coinInfoIn.decimals
    ).toString();

    const [coin0Amount, coin1Amount] =
      coinTypeIn === this.coinTypes[0]
        ? [exactAmountAuIn, "0"]
        : ["0", exactAmountAuIn];

    let payload;
    payload = swapExactCoinForCoin2PoolPayload(this.auxClient.moduleAddress, {
      coinType0: this.coinTypes[0]!,
      coinType1: this.coinTypes[1]!,
      coin0Amount,
      coin1Amount,
      outCoinIndex: coinTypeIn === this.coinTypes[0]! ? 1 : 0,
      minQuantityOut: toAtomicUnits(
        parameters.minAmountOut,
        coinInfoOut.decimals
      ).toString(),
    });
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parsePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stable_2pool::SwapEvent`,
      parseRaw2PoolSwapEvent
    );
  }

  private async swapExactOut(
    { coinTypeOut, exactAmountOut, parameters }: SwapExactOutInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<SwapEvent>> {
    parameters = parameters ?? {};
    const coinInfoIn = await this.auxClient.getCoinInfo(
      coinTypeOut === this.coinTypes[1]!
        ? this.coinTypes[0]!
        : this.coinTypes[1]!
    );
    const coinInfoOut = await this.auxClient.getCoinInfo(coinTypeOut);
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      coinInfoIn.decimals
    ).toString();

    const [requestedQuantity0, requestedQuantity1] =
      coinTypeOut === this.coinTypes[1]
        ? ["0", exactAmountAuOut]
        : [exactAmountAuOut, "0"];

    let payload;
    payload = swapCoinForExactCoin2PoolPayload(this.auxClient.moduleAddress, {
      coinType0: this.coinTypes[0]!,
      coinType1: this.coinTypes[1]!,
      requestedQuantity0,
      requestedQuantity1,
      inCoinIndex: coinTypeOut === this.coinTypes[1]! ? 0 : 1,
      maxInCoinAmount: toAtomicUnits(
        parameters.maxAmountIn,
        coinInfoOut.decimals
      ).toString(),
    });
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parsePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::stable_2pool::SwapEvent`,
      parseRaw2PoolSwapEvent
    );
  }

  private parseAddLiquidityTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<AddLiquidityEvent> {
    if (this.kind === "2pool") {
      return this.parsePoolTransaction(
        transaction,
        `${this.auxClient.moduleAddress}::stable_2pool::AddLiquidityEvent`,
        parseRaw2PoolAddLiquidityEvent
      );
    } else {
      return this.parsePoolTransaction(
        transaction,
        `${this.auxClient.moduleAddress}::stable_3pool::AddLiquidityEvent`,
        parseRaw3PoolAddLiquidityEvent
      );
    }
  }

  private parseRemoveLiquidityTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<RemoveLiquidityEvent> {
    if (this.kind === "2pool") {
      return this.parsePoolTransaction(
        transaction,
        `${this.auxClient.moduleAddress}::stable_2pool::RemoveLiquidityEvent`,
        parseRaw2PoolRemoveLiquidityEvent
      );
    } else {
      return this.parsePoolTransaction(
        transaction,
        `${this.auxClient.moduleAddress}::stable_3pool::RemoveLiquidityEvent`,
        parseRaw3PoolRemoveLiquidityEvent
      );
    }
  }

  private parsePoolTransaction<
    RawType extends Types.Event,
    ParsedType extends PoolEvent
  >(
    transaction: Types.UserTransaction,
    poolEventType: Types.MoveStructTag,
    parse: (raw: RawType) => ParsedType
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
      result: parse(events[0]! as RawType),
    };
  }
}
