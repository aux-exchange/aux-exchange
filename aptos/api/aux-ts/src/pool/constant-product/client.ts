import type { Types } from "aptos";
import BN from "bn.js";
import _ from "lodash";
import type {
  AuxClient,
  AuxClientOptions,
  AuxTransaction,
  CoinInfo,
} from "../../client";
import {
  AnyUnits,
  AtomicUnits,
  AU,
  Bps,
  DecimalUnits,
  DU,
  Pct,
  toAtomicUnits,
  toAtomicUnitsRatio,
} from "../../units";
import {
  AddApproximateLiquidityInput,
  addApproximateLiquidityPayload,
  AddExactLiquidityInput,
  addExactLiquidityPayload,
  AddLiquidityEvent,
  AddLiquidityInput,
  addLiquidityPayload,
  addLiquidityWithAccountPayload,
  createPoolPayload,
  parseRawAddLiquidityEvent,
  parseRawRemoveLiquidityEvent,
  parseRawSwapEvent,
  PoolEvent,
  ConstantProductInput,
  Position,
  RawAddLiquidityEvent,
  RawPoolEvent,
  RawRemoveLiquidityEvent,
  RawSwapEvent,
  RemoveLiquidityEvent,
  removeLiquidityPayload,
  removeLiquidityWithAccountPayload,
  resetPoolPayload,
  swapCoinForExactCoinLimitPayload,
  swapCoinForExactCoinPayload,
  SwapEvent,
  swapExactCoinForCoinLimitPayload,
  swapExactCoinForCoinPayload,
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
export class ConstantProductClient {
  static readonly defaultSlippage: Bps = new Bps(50);

  readonly auxClient: AuxClient;
  readonly type: Types.MoveStructTag;
  readonly coinTypeX: Types.MoveStructTag;
  readonly coinTypeY: Types.MoveStructTag;
  readonly coinTypeLP: Types.MoveStructTag;

  /********************/
  /* Public functions */
  /********************/

  constructor(
    auxClient: AuxClient,
    { coinTypeX, coinTypeY }: ConstantProductInput
  ) {
    this.auxClient = auxClient;
    this.type = `${auxClient.moduleAddress}::amm::Pool<${coinTypeX}, ${coinTypeY}>`;
    this.coinTypeX = coinTypeX;
    this.coinTypeY = coinTypeY;
    this.coinTypeLP = `${auxClient.moduleAddress}::amm::LP<${coinTypeX}, ${coinTypeY}>`;
  }

  async transpose(): Promise<ConstantProductClient> {
    try {
      await this.query();
      return this;
    } catch {
      const transposed = new ConstantProductClient(this.auxClient, {
        coinTypeX: this.coinTypeY,
        coinTypeY: this.coinTypeX,
      });
      try {
        await transposed.query(); // allow exception to propagate
        return transposed;
      } catch {
        throw new Error(`Unable to find pool using ${this} or ${transposed}.`);
      }
    }
  }

  /**
   * Loads and parses resources and events associated with a pool.
   *
   * Make sure to call this after pool operations to refresh your local state.
   */
  async query() {
    const [coinInfoX, coinInfoY, coinInfoLP] = await Promise.all([
      this.auxClient.getCoinInfo(this.coinTypeX),
      this.auxClient.getCoinInfo(this.coinTypeY),
      this.auxClient.getCoinInfo(this.coinTypeLP, true), // refresh the LP token supply
    ]);
    const resource = await this.auxClient.aptosClient.getAccountResource(
      this.auxClient.moduleAddress,
      this.type
    );
    const rawPool = resource.data as any;
    return {
      fee: new Bps(rawPool.fee_bps),
      coinInfoX: coinInfoX,
      coinInfoY: coinInfoY,
      coinInfoLP: coinInfoLP,
      timestamp: new BN.BN(rawPool.timestamp),
      amountX: new AtomicUnits(rawPool.x_reserve.value).toDecimalUnits(
        coinInfoX.decimals
      ),
      amountY: new AtomicUnits(rawPool.y_reserve.value).toDecimalUnits(
        coinInfoY.decimals
      ),
      amountLP: new AtomicUnits(
        coinInfoLP.supply[0]!.integer.vec[0]!.value
      ).toDecimalUnits(coinInfoLP.decimals),
    };
  }

  /**
   * Create a pool, specifying a swap fee. This fee goes entirely to LPs.
   */
  async create(
    { fee }: { fee: Pct | Bps },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<Types.MoveStructTag>> {
    const input = {
      coinTypeX: this.coinTypeX,
      coinTypeY: this.coinTypeY,
      feeBps: (fee.toNumber() * 10000).toString(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      createPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
    return {
      transaction,
      result: this.type,
    };
  }

  /**
   * Swaps the input coin for the output coin. This can be specified either as:
   * 1. "exact in" => swap an exact amount of input coin for some minimum amount of output coin.
   * 2. "exact out" => swap some maximum amount of input coin for an exact amount of output coin.
   *
   * There are four mutually-exclusive kinds of swap parameters:
   * 1. Price Impact & Slippage
   * 3. Total Cost (minAmountOut / maxAmountIn).
   * 4. Marginal Cost (minAmountOutPerIn). Only applies to "exact in".
   * 5. Total Cost & Marginal Cost (maxAmountIn & maxAmountInPerOut). Only applies to "exact out".
   *
   * === Price Impact ===
   * How much your swap itself can shift the pool's price point.
   *
   * Note that price impact is separate from slippage, and most users will most likely not need
   * this parameter. It is primarily useful for simulation and other SDKs to compose with.
   *
   * === Slippage ===
   * The change in a pool's price point between when you submitted your swap and when your swap is
   * actually executed.
   *
   * Setting slippage to 0.5 means you are allowing your amountOut to be at most 0.5% less at
   * execution time than what was estimated from the pool price at submission time.
   *
   * Note the inverse does not hold. If the pool has shifted favorably such that you will receive
   * over 0.5% more than expected, your swap will continue to successfully execute.
   *
   * === Total Cost (minAmountOut / maxAmountIn) ===
   * Swaps the input coin for the output coin.
   *
   * Exact In: fails if the user does not receive at least the specified minimum output quantity.
   * Exact Out: fails if the user needs to provide more than specified maximum input quantity.
   *
   * === Marginal Cost (minAmountOutPerIn / maxAmountInPerOut) ===
   * Swaps the input coin for the output coin.
   *
   * Fails if the marginal price of the output coin, denominated in the input coin, would fall
   * below the specified quantity.
   *
   * Example: a marginal cost of 5 means only swap if the pool's price point _after swapping_ is
   * less than or equal to 5 input coins for 1 output coin (ie. limit price of 5).
   *
   * === Total Cost and Marginal Cost ===
   * This is only available when specifying your swap as "exact amount out" (vs. exact amount in).
   *
   * Swaps at most the input coin for the exact amount of output, where the maximum per-unit cost
   * of output is bounded by the given limit price denominated in quantity of input per output.
   *
   * Fails if the exact amount cannot be received with the user's maximum input quantity and limit
   * price.
   */
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
    { amountX, amountY, slippage, useAuxAccount }: AddLiquidityInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<AddLiquidityEvent>> {
    const pool = await this.query();
    const amountAuX = toAtomicUnits(amountX, pool.coinInfoX.decimals).toU64();
    const amountAuY = toAtomicUnits(amountY, pool.coinInfoY.decimals).toU64();
    const input = {
      coinTypeX: pool.coinInfoX.coinType,
      coinTypeY: pool.coinInfoY.coinType,
      amountAuX,
      amountAuY,
      maxSlippageBps: (slippage ?? ConstantProductClient.defaultSlippage)
        .toBps()
        .toString(),
    };
    const payload =
      useAuxAccount ?? false
        ? addLiquidityWithAccountPayload(this.auxClient.moduleAddress, input)
        : addLiquidityPayload(this.auxClient.moduleAddress, input);
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseAddLiquidityTransaction(transaction);
  }

  /**
   * Adds the exact liquidity to the pool. If the amounts do not match the pool ratio, tx fails.
   */
  async addExactLiquidity(
    { amountX, amountY }: AddExactLiquidityInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<AddLiquidityEvent>> {
    const pool = await this.query();
    const amountAuX = toAtomicUnits(amountX, pool.coinInfoX.decimals).toU64();
    const amountAuY = toAtomicUnits(amountY, pool.coinInfoY.decimals).toU64();
    const input = {
      amountAuX,
      amountAuY,
      coinTypeX: pool.coinInfoX.coinType,
      coinTypeY: pool.coinInfoY.coinType,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      addExactLiquidityPayload(this.auxClient.moduleAddress, input),
      options
    );
    return this.parseAddLiquidityTransaction(transaction);
  }

  /**
   * Adds liquidity to the pool.
   *
   * - The amount added may deviate from the ratio in the pool.
   * - Any rounding is advantageous to the pool.
   * - maxX and maxY are the upper limits on what will be added to the pool.
   * - minLP is the minimum required amount of LP token that the user will receive in order for the
   *   transaction to pass.
   * - maxPoolLP is the maximum LP of the pool *after* your contribution has been accounted for.
   * - minPoolX and minPoolY are the minimum X and Y in the pool *after* your contribution has been
   *   accounted for.
   *
   * If any of these conditions fail, the `addApproximateLiquidity` tx will fail.
   */
  async addApproximateLiquidity(
    {
      maxX,
      maxY,
      minLP,
      maxPoolLP,
      minPoolX,
      minPoolY,
    }: AddApproximateLiquidityInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<AddLiquidityEvent>> {
    const pool = await this.query();
    const input = {
      coinTypeX: pool.coinInfoX.coinType,
      coinTypeY: pool.coinInfoY.coinType,
      maxAuX: toAtomicUnits(maxX, pool.coinInfoX.decimals).toString(),
      maxAuY: toAtomicUnits(maxY, pool.coinInfoY.decimals).toString(),
      minAuLP: toAtomicUnits(minLP, pool.coinInfoLP.decimals).toString(),
      maxPoolAuLP: toAtomicUnits(
        maxPoolLP,
        pool.coinInfoLP.decimals
      ).toString(),
      minPoolAuX: toAtomicUnits(minPoolX, pool.coinInfoX.decimals).toString(),
      minPoolAuY: toAtomicUnits(minPoolY, pool.coinInfoY.decimals).toString(),
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      addApproximateLiquidityPayload(this.auxClient.moduleAddress, input),
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
    {
      amountLP,
      useAuxAccount,
    }: { amountLP: AnyUnits; useAuxAccount?: boolean },
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<RemoveLiquidityEvent>> {
    const pool = await this.query();
    const amountAuLP = toAtomicUnits(
      amountLP,
      pool.coinInfoLP.decimals
    ).toU64();
    const input = {
      amountAuLP,
      coinTypeX: pool.coinInfoX.coinType,
      coinTypeY: pool.coinInfoY.coinType,
      coinInfoLP: pool.coinInfoLP,
    };
    const payload =
      useAuxAccount ?? false
        ? removeLiquidityWithAccountPayload(this.auxClient.moduleAddress, input)
        : removeLiquidityPayload(this.auxClient.moduleAddress, input);
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseRemoveLiquidityTransaction(transaction);
  }

  /**
   * Drain the pool of the locked LP tokens from the initial addLiquidity. Only succeeds when all
   * available LP tokens have been burned.
   */
  async drain(
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<Types.MoveStructTag>> {
    const pool = await this.query();
    const input = {
      sender: this.auxClient.sender!,
      coinTypeX: pool.coinInfoX.coinType,
      coinTypeY: pool.coinInfoY.coinType,
    };
    const transaction = await this.auxClient.sendOrSimulateTransaction(
      resetPoolPayload(this.auxClient.moduleAddress, input),
      options
    );
    return {
      transaction,
      result: this.type,
    };
  }

  /**
   * Returns the owner's position in the pool. It will be undefined if not found.
   */
  async position(owner: Types.Address): Promise<Position | undefined> {
    const pool = await this.query();
    const resources = await this.auxClient.aptosClient.getAccountResources(
      owner
    );
    const coinStoreLP = `0x1::coin::CoinStore<${this.auxClient.moduleAddress}::amm::LP<${this.coinTypeX}, ${this.coinTypeY}>>`;
    const position = resources.find(
      (resource) => resource.type === coinStoreLP
    );
    if (_.isUndefined(position)) {
      return undefined;
    }
    const amountLP = AU((position.data as any).coin.value).toDecimalUnits(
      pool.coinInfoLP.decimals
    );
    const share =
      amountLP.toNumber() === 0
        ? 0
        : amountLP.toNumber() / pool.amountLP.toNumber();
    return {
      owner,
      coinInfoX: pool.coinInfoX,
      coinInfoY: pool.coinInfoY,
      coinInfoLP: pool.coinInfoLP,
      // do ops in AU then convert
      amountX: DU(share * pool.amountX.toNumber()),
      amountY: DU(share * pool.amountY.toNumber()),
      amountLP,
      share,
    };
  }

  /**
   * Quotes the amountIn / amountOut from executing a swap at the pool's current price point.
   * 1. "exact in" => quote `amountOut` of the output coin
   * 2. "exact out" => quote `amountIn` of the input coin
   *
   * Includes gasUsed and gasUnitPrice, estimated via simulation.
   */
  quote(
    input:
      | {
          coinTypeIn: Types.MoveStructTag;
          exactAmountIn: AnyUnits;
        }
      | {
          coinTypeOut: Types.MoveStructTag;
          exactAmountOut: AnyUnits;
        }
  ) {
    if ("coinTypeIn" in input) {
      return this.quoteExactIn(input);
    }
    return this.quoteExactOut(input);
  }

  async poolEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<PoolEvent[]> {
    const [swaps, adds, removes] = await Promise.all([
      this.swapEvents(query),
      this.addLiquidityEvents(query),
      this.removeLiquidityEvents(query),
    ]);
    return [swaps, adds, removes].flat();
  }

  async swapEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<SwapEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);

    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "swap_events",
      queryParameter
    )) as RawSwapEvent[];
    return events.map(parseRawSwapEvent);
  }

  async addLiquidityEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<AddLiquidityEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);
    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "add_liquidity_events",
      queryParameter
    )) as RawAddLiquidityEvent[];
    return events.map(parseRawAddLiquidityEvent);
  }

  async removeLiquidityEvents(
    query?: { start: BN } | { limit: BN }
  ): Promise<RemoveLiquidityEvent[]> {
    query = query ?? { limit: new BN(100) };
    const queryParameter = "limit" in query ? query.limit : query.start;
    const queryFunction =
      "limit" in query
        ? this.auxClient.getEventsByEventHandleWithLookback.bind(this.auxClient)
        : this.auxClient.getEventsByEventHandleSince.bind(this.auxClient);
    const events = (await queryFunction(
      this.auxClient.moduleAddress,
      this.type,
      "remove_liquidity_events",
      queryParameter
    )) as RawRemoveLiquidityEvent[];
    return events.map(parseRawRemoveLiquidityEvent);
  }

  /*********************/
  /* Private functions */
  /*********************/

  private async swapExactIn(
    { coinTypeIn, exactAmountIn, parameters }: SwapExactInInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<SwapEvent>> {
    parameters = parameters ?? {};
    const [coinInfoIn, coinInfoOut] = await this.exactInCoinInfos(coinTypeIn);
    const coinTypeOut = coinInfoOut.coinType;
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      coinInfoIn.decimals
    ).toString();

    let payload;
    if ("minAmountOut" in parameters) {
      payload = swapExactCoinForCoinPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        exactAmountAuIn,
        minAmountAuOut: toAtomicUnits(
          parameters.minAmountOut,
          coinInfoOut.decimals
        ).toString(),
      });
    } else if ("minAmountOutPerIn" in parameters) {
      const [numerator, denominator] = toAtomicUnitsRatio(
        parameters.minAmountOutPerIn,
        coinInfoOut.decimals,
        coinInfoIn.decimals
      );
      payload = swapExactCoinForCoinLimitPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        exactAmountAuIn,
        limitPriceNumerator: numerator.toString(),
        limitPriceDenominator: denominator.toString(),
      });
    } else {
      const quote = await this.quoteExactIn({
        coinTypeIn,
        exactAmountIn,
      });
      if (!_.isUndefined(parameters.priceImpact)) {
        const pool = await this.query();
        const spotPrice = pool.amountY.toNumber() / pool.amountX.toNumber();
        const estimatedPriceImpact = (quote.toNumber() - spotPrice) / spotPrice;
        if (estimatedPriceImpact > parameters.priceImpact.toNumber()) {
          throw new Error(
            `Swap exceeded price impact bound ${estimatedPriceImpact} > ${parameters.priceImpact.toNumber()}`
          );
        }
      }
      const slippageMultiplier =
        1 -
        (
          parameters.slippage ?? ConstantProductClient.defaultSlippage
        ).toNumber();
      const minAmountAuOut = DU(quote.toNumber() * slippageMultiplier)
        .toAtomicUnits(coinInfoOut.decimals)
        .toString();
      payload = swapExactCoinForCoinPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        exactAmountAuIn,
        minAmountAuOut,
      });
    }

    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseSwapTransaction(transaction);
  }

  private async swapExactOut(
    { coinTypeOut, exactAmountOut, parameters }: SwapExactOutInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<SwapEvent>> {
    parameters = parameters ?? {};
    const [coinInfoIn, coinInfoOut] = await this.exactOutCoinInfos(coinTypeOut);
    const coinTypeIn = coinInfoIn.coinType;
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      coinInfoOut.decimals
    ).toString();

    let payload;
    if ("maxAmountIn" in parameters && "maxAmountInPerOut" in parameters) {
      const [numerator, denominator] = toAtomicUnitsRatio(
        // @ts-ignore typescript narrowing is confused
        parameters.maxAmountInPerOut,
        coinInfoIn.decimals,
        coinInfoOut.decimals
      );
      payload = swapCoinForExactCoinLimitPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        maxAmountAuIn: toAtomicUnits(
          // @ts-ignore typescript narrowing is confused
          parameters.maxAmountIn,
          coinInfoIn.decimals
        ).toString(),
        limitPriceNumerator: numerator.toString(),
        limitPriceDenominator: denominator.toString(),
        exactAmountAuOut,
      });
    } else if ("maxAmountIn" in parameters) {
      payload = swapCoinForExactCoinPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        exactAmountAuOut,
        maxAmountAuIn: toAtomicUnits(
          parameters.maxAmountIn,
          coinInfoIn.decimals
        ).toString(),
      });
    } else {
      const quote = await this.quoteExactOut({
        coinTypeOut,
        exactAmountOut,
      });
      if (!_.isUndefined(parameters.priceImpact)) {
        const pool = await this.query();
        const spotPrice = pool.amountY.toNumber() / pool.amountX.toNumber();
        const estimatedPriceImpact = (quote.toNumber() - spotPrice) / spotPrice;
        if (estimatedPriceImpact > parameters.priceImpact.toNumber()) {
          throw new Error(
            `Swap exceeded price impact bound ${estimatedPriceImpact} > ${parameters.priceImpact.toNumber()}`
          );
        }
      }
      const slippageMultiplier =
        1 +
        (
          parameters.slippage ?? ConstantProductClient.defaultSlippage
        ).toNumber();
      const maxAmountAuIn = DU(quote.toNumber() * slippageMultiplier)
        .toAtomicUnits(coinInfoIn.decimals)
        .toString();
      payload = swapCoinForExactCoinPayload(this.auxClient.moduleAddress, {
        coinTypeIn,
        coinTypeOut,
        exactAmountAuOut,
        maxAmountAuIn,
      });
    }

    const transaction = await this.auxClient.sendOrSimulateTransaction(
      payload,
      options
    );
    return this.parseSwapTransaction(transaction);
  }

  /**
   * Quotes the expectedAmountOut and minAmountOut from `swapExactIn`
   */
  private async quoteExactIn({
    coinTypeIn,
    exactAmountIn,
  }: {
    coinTypeIn: Types.MoveStructTag;
    exactAmountIn: AnyUnits;
  }): Promise<DecimalUnits> {
    const pool = await this.query();
    const [coinInfoIn, _] = await this.exactInCoinInfos(coinTypeIn);
    const [reserveIn, reserveOut] =
      coinTypeIn === pool.coinInfoX.coinType
        ? [pool.amountX, pool.amountY]
        : [pool.amountY, pool.amountX];
    const amountIn =
      toAtomicUnits(exactAmountIn, coinInfoIn.decimals)
        .toDecimalUnits(coinInfoIn.decimals)
        .toNumber() *
      (1 - pool.fee.toNumber() / 100.0);
    const expectedAmountOut =
      (amountIn * reserveOut.toNumber()) / (reserveIn.toNumber() + amountIn);
    return DU(expectedAmountOut);
  }

  /**
   * Quotes the amountIn from `swapExactOut`
   */
  private async quoteExactOut({
    coinTypeOut,
    exactAmountOut,
  }: {
    coinTypeOut: Types.MoveStructTag;
    exactAmountOut: AnyUnits;
  }): Promise<DecimalUnits> {
    const pool = await this.query();
    const [_, coinInfoOut] = await this.exactOutCoinInfos(coinTypeOut);
    const [reserveIn, reserveOut] =
      coinTypeOut === pool.coinInfoY.coinType
        ? [pool.amountX, pool.amountY]
        : [pool.amountY, pool.amountX];
    const feeRatio = 1 - pool.fee.toNumber() / 100.0;
    const amountOut = toAtomicUnits(exactAmountOut, coinInfoOut.decimals)
      .toDecimalUnits(coinInfoOut.decimals)
      .toNumber();
    const expectedAmountOut =
      (reserveIn.toNumber() * amountOut) /
      ((reserveOut.toNumber() - amountOut) * feeRatio);
    return DU(expectedAmountOut);
  }

  private async exactInCoinInfos(
    coinTypeIn: Types.MoveStructTag
  ): Promise<[CoinInfo, CoinInfo]> {
    const pool = await this.query();
    const [coinInfoIn, coinInfoOut] =
      coinTypeIn === pool.coinInfoX.coinType
        ? [pool.coinInfoX, pool.coinInfoY]
        : [pool.coinInfoY, pool.coinInfoX];
    return [coinInfoIn, coinInfoOut];
  }

  private async exactOutCoinInfos(
    coinTypeOut: Types.MoveStructTag
  ): Promise<[CoinInfo, CoinInfo]> {
    const pool = await this.query();
    const [coinInfoIn, coinInfoOut] =
      coinTypeOut === pool.coinInfoY.coinType
        ? [pool.coinInfoX, pool.coinInfoY]
        : [pool.coinInfoY, pool.coinInfoX];
    return [coinInfoIn, coinInfoOut];
  }

  private parseSwapTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<SwapEvent> {
    return this.parsePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::amm::SwapEvent`,
      parseRawSwapEvent
    );
  }

  private parseAddLiquidityTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<AddLiquidityEvent> {
    return this.parsePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::amm::AddLiquidityEvent`,
      parseRawAddLiquidityEvent
    );
  }

  private parseRemoveLiquidityTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<RemoveLiquidityEvent> {
    return this.parsePoolTransaction(
      transaction,
      `${this.auxClient.moduleAddress}::amm::RemoveLiquidityEvent`,
      parseRawRemoveLiquidityEvent
    );
  }

  private parsePoolTransaction<
    RawType extends RawPoolEvent,
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
