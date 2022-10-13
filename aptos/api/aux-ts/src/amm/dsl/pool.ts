import type { AptosAccount, Types } from "aptos";
import type BN from "bn.js";
import type { AuxClient, CoinInfo, TransactionOptions } from "../../client";
import type { TransactionResult } from "../../transaction";
import {
  AnyUnits,
  AtomicUnits,
  AU,
  DecimalUnits,
  DU,
  toAtomicUnits,
  toAtomicUnitsRatio,
} from "../../units";
import * as core from "../core";
import type {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from "../core/events";
import { addLiquidityTxResult } from "../core/mutation";
import type { PoolInput } from "../core/query";

export default class Pool implements core.query.Pool {
  auxClient: AuxClient;
  type: Types.MoveStructTag;
  timestamp: BN;
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  coinInfoLP: CoinInfo;

  amountAuX: AtomicUnits;
  amountAuY: AtomicUnits;
  amountAuLP: AtomicUnits;
  feeBps: BN;

  amountX: DecimalUnits;
  amountY: DecimalUnits;
  amountLP: DecimalUnits;
  feePct: number;

  static async index(auxClient: AuxClient): Promise<ReadParams[]> {
    return core.query.pools(auxClient);
  }

  static async create(
    auxClient: AuxClient,
    { sender, coinTypeX, coinTypeY, feePct }: CreateParams,
    transactionOptions?: TransactionOptions
  ): Promise<Pool> {
    await core.mutation.createPool(
      auxClient,
      {
        sender,
        coinTypeX,
        coinTypeY,
        feeBps: (feePct * 100).toString(),
      },
      transactionOptions
    );
    const pool = await Pool.read(auxClient, { coinTypeX, coinTypeY });
    if (pool == undefined) {
      throw new Error("Failed to find pool after creation.");
    }
    return pool;
  }

  static async read(
    auxClient: AuxClient,
    { coinTypeX, coinTypeY }: ReadParams
  ): Promise<Pool | undefined> {
    const pool = await core.query.pool(auxClient, {
      coinTypeX,
      coinTypeY,
    });
    if (pool == undefined) {
      return undefined;
    }
    return new Pool({
      auxClient,
      amountX: DecimalUnits.fromAtomicUnits(
        pool.amountAuX,
        pool.coinInfoX.decimals
      ),
      amountY: DecimalUnits.fromAtomicUnits(
        pool.amountAuY,
        pool.coinInfoY.decimals
      ),
      amountLP: DecimalUnits.fromAtomicUnits(
        pool.amountAuLP,
        pool.coinInfoLP.decimals
      ),
      feePct: pool.feeBps.toNumber() / 100,
      ...pool,
    });
  }

  private constructor(kwargs: {
    auxClient: AuxClient;
    type: Types.MoveStructTag;
    timestamp: BN;
    coinInfoX: CoinInfo;
    coinInfoY: CoinInfo;
    coinInfoLP: CoinInfo;

    amountAuX: AtomicUnits;
    amountAuY: AtomicUnits;
    amountAuLP: AtomicUnits;
    feeBps: BN;

    amountX: DecimalUnits;
    amountY: DecimalUnits;
    amountLP: DecimalUnits;
    feePct: number;
  }) {
    this.auxClient = kwargs.auxClient;
    this.type = kwargs.type;
    this.timestamp = kwargs.timestamp;
    this.coinInfoX = kwargs.coinInfoX;
    this.coinInfoY = kwargs.coinInfoY;
    this.coinInfoLP = kwargs.coinInfoLP;

    this.amountAuX = kwargs.amountAuX;
    this.amountAuY = kwargs.amountAuY;
    this.amountAuLP = kwargs.amountAuLP;
    this.feeBps = kwargs.feeBps;

    this.amountX = kwargs.amountX;
    this.amountY = kwargs.amountY;
    this.amountLP = kwargs.amountLP;
    this.feePct = kwargs.feePct;
  }

  /**
   * @param owner
   * @returns user position in the pool
   */
  async position(
    owner: Types.Address
  ): Promise<core.query.Position | undefined> {
    return core.query.position(this.auxClient, owner, this.poolInput());
  }

  async swap(
    sender: AptosAccount,
    params: SwapInParams | SwapOutParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    switch (params.kind) {
      case "in":
        return this.swapIn(sender, params, transactionOptions);
      case "out":
        return this.swapOut(sender, params, transactionOptions);
      default:
        const _exhaustiveCheck: never = params;
        return _exhaustiveCheck;
    }
  }

  private async swapIn(
    sender: AptosAccount,
    params: SwapInParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const slippage = params.slippage ?? {
      kind: "total",
      minAmountOut: AU(42), // TODO
    };
    const [coinInfoIn, coinInfoOut] =
      params.coinTypeIn === this.coinInfoX.coinType
        ? [this.coinInfoX, this.coinInfoY]
        : [this.coinInfoY, this.coinInfoX];
    switch (slippage.kind) {
      case "total":
        return core.mutation.swapExactCoinForCoin(
          this.auxClient,
          {
            sender,
            coinTypeIn: params.coinTypeIn,
            coinTypeOut: coinInfoOut.coinType,
            exactAmountAuIn: toAtomicUnits(
              params.amountIn,
              coinInfoIn.decimals
            ).toString(),
            minAmountAuOut: toAtomicUnits(
              slippage.minAmountOut,
              coinInfoOut.decimals
            ).toString(),
          },
          transactionOptions
        );
      case "marginal":
        return core.mutation.swapExactCoinForCoinLimit(
          this.auxClient,
          {
            sender,
            coinTypeIn: params.coinTypeIn,
            coinTypeOut: coinInfoOut.coinType,
            exactAmountAuIn: toAtomicUnits(
              params.amountIn,
              coinInfoIn.decimals
            ).toString(),
            limitPriceNumerator: toAtomicUnits(
              slippage.minAmountOutPerIn,
              coinInfoIn.decimals
            ).toString(),
            limitPriceDenominator: toAtomicUnits(
              DU(1),
              coinInfoOut.decimals
            ).toString(),
          },
          transactionOptions
        );
      default:
        const _exhaustiveCheck: never = slippage;
        return _exhaustiveCheck;
    }
  }

  private async swapOut(
    sender: AptosAccount,
    params: SwapOutParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const slippage = params.slippage ?? {
      kind: "total",
      maxAmountIn: AU(42), // TODO
    };
    const [coinInfoIn, coinInfoOut] =
      params.coinTypeOut === this.coinInfoX.coinType
        ? [this.coinInfoX, this.coinInfoY]
        : [this.coinInfoY, this.coinInfoX];
    switch (slippage.kind) {
      case "total":
        return core.mutation.swapCoinForExactCoin(
          this.auxClient,
          {
            sender,
            coinTypeIn: coinInfoIn.coinType,
            coinTypeOut: params.coinTypeOut,
            exactAmountAuOut: toAtomicUnits(
              params.amountOut,
              coinInfoIn.decimals
            ).toString(),
            maxAmountAuIn: toAtomicUnits(
              slippage.maxAmountIn,
              coinInfoOut.decimals
            ).toString(),
          },
          transactionOptions
        );
      case "marginal":
        return core.mutation.swapCoinForExactCoinLimit(
          this.auxClient,
          {
            sender,
            coinTypeIn: coinInfoIn.coinType,
            coinTypeOut: params.coinTypeOut,
            exactAmountAuOut: toAtomicUnits(
              params.amountOut,
              coinInfoIn.decimals
            ).toString(),
            maxAmountAuIn: "0",
            limitPriceNumerator: toAtomicUnits(
              slippage.maxAmountInPerOut,
              coinInfoIn.decimals
            ).toString(),
            limitPriceDenominator: toAtomicUnits(
              DU(1),
              coinInfoOut.decimals
            ).toString(),
          },
          transactionOptions
        );
      default:
        const _exhaustiveCheck: never = slippage;
        return _exhaustiveCheck;
    }
  }

  /**
   * Swaps the input coin for the output coin. The transaction fails if the user
   * does not receive at least the specified minimum output quantity.
   */
  async swapXForY(
    { sender, exactAmountIn, minAmountOut }: SwapExactInParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      this.coinInfoX.decimals
    ).toU64();
    const minAmountAuOut = toAtomicUnits(
      minAmountOut,
      this.coinInfoY.decimals
    ).toU64();
    return core.mutation.swapExactCoinForCoin(
      this.auxClient,
      {
        sender,
        exactAmountAuIn,
        minAmountAuOut,
        coinTypeIn: this.coinInfoX.coinType,
        coinTypeOut: this.coinInfoY.coinType,
      },
      transactionOptions
    );
  }

  /**
   * Swaps the input coin for the output coin. The transaction fails if the user
   * does not receive at least the specified minimum output quantity.
   */
  async swapYForX(
    { sender, exactAmountIn, minAmountOut }: SwapExactInParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      this.coinInfoY.decimals
    ).toU64();
    const minAmountAuOut = toAtomicUnits(
      minAmountOut,
      this.coinInfoX.decimals
    ).toU64();
    return core.mutation.swapExactCoinForCoin(
      this.auxClient,
      {
        sender,
        exactAmountAuIn,
        minAmountAuOut,
        coinTypeIn: this.coinInfoY.coinType,
        coinTypeOut: this.coinInfoX.coinType,
      },
      transactionOptions
    );
  }

  /**
   * Swaps the input coin for the output coin. Stop swapping when the marginal
   * price of the output coin, denominated in the input coin, would exceed the
   * specified quantity.
   */
  async swapXForYLimit(
    { sender, exactAmountIn, minOutPerIn }: SwapExactInLimitParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const ratio = toAtomicUnitsRatio(
      minOutPerIn,
      this.coinInfoY.decimals,
      this.coinInfoX.decimals
    );
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      this.coinInfoX.decimals
    ).toString();
    return core.mutation.swapExactCoinForCoinLimit(
      this.auxClient,
      {
        sender,
        exactAmountAuIn,
        limitPriceNumerator: ratio[0].toString(),
        limitPriceDenominator: ratio[1].toString(),
        coinTypeIn: this.coinInfoX.coinType,
        coinTypeOut: this.coinInfoY.coinType,
      },
      transactionOptions
    );
  }
  /**
   * Swaps the input coin for the output coin. Stop swapping when the marginal
   * price of the output coin, denominated in the input coin, would exceed the
   * specified quantity.
   */
  async swapYForXLimit(
    { sender, exactAmountIn, minOutPerIn }: SwapExactInLimitParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const ratio = toAtomicUnitsRatio(
      minOutPerIn,
      this.coinInfoX.decimals,
      this.coinInfoY.decimals
    );
    const exactAmountAuIn = toAtomicUnits(
      exactAmountIn,
      this.coinInfoY.decimals
    ).toString();
    return core.mutation.swapExactCoinForCoinLimit(
      this.auxClient,
      {
        sender,
        exactAmountAuIn,
        limitPriceNumerator: ratio[0].toString(),
        limitPriceDenominator: ratio[1].toString(),
        coinTypeIn: this.coinInfoY.coinType,
        coinTypeOut: this.coinInfoX.coinType,
      },
      transactionOptions
    );
  }

  /**
   * Swaps at most the input coin for the exact amount of output. Fail if the
   * exact amount cannot be received with the user's maximum input quantity.
   */
  async swapXForYExact(
    { sender, maxAmountIn, exactAmountOut }: SwapExactOutParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const maxAmountAuIn = toAtomicUnits(
      maxAmountIn,
      this.coinInfoX.decimals
    ).toString();
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      this.coinInfoY.decimals
    ).toString();
    return core.mutation.swapCoinForExactCoin(
      this.auxClient,
      {
        sender,
        coinTypeIn: this.coinInfoX.coinType,
        coinTypeOut: this.coinInfoY.coinType,
        maxAmountAuIn,
        exactAmountAuOut,
      },
      transactionOptions
    );
  }

  /**
   * Swaps at most the input coin for the exact amount of output. Fail if the
   * exact amount cannot be received with the user's maximum input quantity.
   */
  async swapYForXExact(
    { sender, maxAmountIn, exactAmountOut }: SwapExactOutParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const maxAmountAuIn = toAtomicUnits(
      maxAmountIn,
      this.coinInfoY.decimals
    ).toString();
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      this.coinInfoX.decimals
    ).toString();
    return core.mutation.swapCoinForExactCoin(
      this.auxClient,
      {
        sender,
        coinTypeIn: this.coinInfoY.coinType,
        coinTypeOut: this.coinInfoX.coinType,
        maxAmountAuIn,
        exactAmountAuOut,
      },
      transactionOptions
    );
  }

  /**
   * Swaps at most the input coin for the exact amount of output, where the
   * maximum per-unit cost of output is bounded by the given limit price
   * denominated in quantity of input per output. Fail if the exact amount
   * cannot be received with the user's maximum input quantity and limit price.
   */
  async swapXForYExactLimit(
    {
      sender,
      maxAmountIn,
      maxInPerOut,
      exactAmountOut,
    }: SwapExactOutLimitParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const ratio = toAtomicUnitsRatio(
      maxInPerOut,
      this.coinInfoX.decimals,
      this.coinInfoY.decimals
    );
    const maxAmountAuIn = toAtomicUnits(
      maxAmountIn,
      this.coinInfoX.decimals
    ).toString();
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      this.coinInfoY.decimals
    ).toString();
    return core.mutation.swapCoinForExactCoinLimit(
      this.auxClient,
      {
        sender,
        coinTypeIn: this.coinInfoX.coinType,
        coinTypeOut: this.coinInfoY.coinType,
        maxAmountAuIn,
        exactAmountAuOut,
        limitPriceNumerator: ratio[0].toString(),
        limitPriceDenominator: ratio[1].toString(),
      },
      transactionOptions
    );
  }

  /**
   * Swaps at most the input coin for the exact amount of output, where the
   * maximum per-unit cost of output is bounded by the given limit price
   * denominated in quantity of input per output. Fail if the exact amount
   * cannot be received with the user's maximum input quantity and limit price.
   */
  async swapYForXExactLimit(
    {
      sender,
      maxAmountIn,
      maxInPerOut,
      exactAmountOut,
    }: SwapExactOutLimitParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<SwapEvent | undefined>> {
    const ratio = toAtomicUnitsRatio(
      maxInPerOut,
      this.coinInfoY.decimals,
      this.coinInfoX.decimals
    );
    const maxAmountAuIn = toAtomicUnits(
      maxAmountIn,
      this.coinInfoY.decimals
    ).toString();
    const exactAmountAuOut = toAtomicUnits(
      exactAmountOut,
      this.coinInfoX.decimals
    ).toString();
    return core.mutation.swapCoinForExactCoinLimit(
      this.auxClient,
      {
        sender,
        coinTypeIn: this.coinInfoY.coinType,
        coinTypeOut: this.coinInfoX.coinType,
        maxAmountAuIn,
        exactAmountAuOut,
        limitPriceNumerator: ratio[0].toString(),
        limitPriceDenominator: ratio[1].toString(),
      },
      transactionOptions
    );
  }

  /**
   * Adds up to the given amounts of liquidity to the pool. Add as much
   * liquidity as possible in as close of a ratio as possible to the pool. Any
   * rounding benefits the pool. If rounding would reduce the LP tokens received
   * by more than the specified slippage, abort.
   */
  async addLiquidity(
    { sender, amountX, amountY, maxSlippageBps }: AddLiquidityParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<AddLiquidityEvent | undefined>> {
    const amountAuX = toAtomicUnits(amountX, this.coinInfoX.decimals).toU64();
    const amountAuY = toAtomicUnits(amountY, this.coinInfoY.decimals).toU64();
    const tx = await this.auxClient.generateSignSubmitWaitForTransaction({
      sender,
      payload: {
        function: `${this.auxClient.moduleAddress}::amm::add_liquidity`,
        type_arguments: [this.coinInfoX.coinType, this.coinInfoY.coinType],
        arguments: [amountAuX, amountAuY, maxSlippageBps.toU64()],
      },
      transactionOptions,
    });
    if (tx.success) {
      return addLiquidityTxResult(this.auxClient, tx);
    } else {
      return {
        tx,
        payload: undefined,
      };
    }
  }

  /**
   * Adds liquidity to the pool. The amount added must be in the exact ratio of
   * the pool.
   */
  async addExactLiquidity(
    { sender, amountX, amountY }: AddExactLiquidityParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<AddLiquidityEvent | undefined>> {
    const amountAuX = toAtomicUnits(amountX, this.coinInfoX.decimals).toU64();
    const amountAuY = toAtomicUnits(amountY, this.coinInfoY.decimals).toU64();
    return core.mutation.addExactLiquidity(
      this.auxClient,
      {
        sender,
        amountAuX,
        amountAuY,
        coinTypeX: this.coinInfoX.coinType,
        coinTypeY: this.coinInfoY.coinType,
      },
      transactionOptions
    );
  }

  /**
   * Adds liquidity to the pool. The amount added may deviate from the ratio in
   * the pool. Any rounding is advantageous to the pool. maxX and maxY are the
   * upper limits on what will be added to the pool. minLP is the minimum
   * required amount of LP token that the user will receive in order for the
   * transaction to pass. maxPoolLP is the maximum LP of the pool *after* your
   * contribution has been accounted for. minPoolX and minPoolY are the minimum
   * X and Y in the pool *after* your contribution has been accounted for.
   *
   * If any of these conditions fail, the LP fails.
   */
  async addApproximateLiquidity(
    {
      sender,
      maxX,
      maxY,
      minLP,
      maxPoolLP,
      minPoolX,
      minPoolY,
    }: AddApproximateLiquidityParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<AddLiquidityEvent | undefined>> {
    return this.auxClient
      .generateSignSubmitWaitForTransaction({
        sender,
        payload: {
          function: `${this.auxClient.moduleAddress}::amm::add_approximate_liquidity`,
          type_arguments: [this.coinInfoX.coinType, this.coinInfoY.coinType],
          arguments: [
            toAtomicUnits(maxX, this.coinInfoX.decimals).toString(),
            toAtomicUnits(maxY, this.coinInfoY.decimals).toString(),
            toAtomicUnits(minLP, this.coinInfoLP.decimals).toString(),
            toAtomicUnits(maxPoolLP, this.coinInfoLP.decimals).toString(),
            toAtomicUnits(minPoolX, this.coinInfoX.decimals).toString(),
            toAtomicUnits(minPoolY, this.coinInfoY.decimals).toString(),
          ],
        },
        transactionOptions,
      })
      .then(async (tx) => {
        if (!tx.success) {
          return { tx, payload: undefined };
        }

        return await addLiquidityTxResult(this.auxClient, tx);
      });
  }

  /**
   * Redeem LP tokens from the pool.
   */
  async removeLiquidity(
    { sender, amountLP }: RemoveLiquidityParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<RemoveLiquidityEvent | undefined>> {
    const amountAuLP = toAtomicUnits(
      amountLP,
      this.coinInfoLP.decimals
    ).toU64();
    return core.mutation.removeLiquidity(
      this.auxClient,
      {
        sender,
        amountAuLP,
        coinTypeX: this.coinInfoX.coinType,
        coinTypeY: this.coinInfoY.coinType,
        coinInfoLP: this.coinInfoLP,
      },
      transactionOptions
    );
  }

  /**
   * reset the pool when all the available lp tokens are redeemed.
   */
  async resetPool(
    { sender }: ResetPoolParams,
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<RemoveLiquidityEvent | undefined>> {
    return core.mutation.resetPool(
      this.auxClient,
      {
        sender,
        coinTypeX: this.coinInfoX.coinType,
        coinTypeY: this.coinInfoY.coinType,
      },
      transactionOptions
    );
  }
  /**
   * Update the public state variables of the Pool.
   */
  async update(): Promise<void> {
    const pool = await core.query.pool(this.auxClient, {
      coinTypeX: this.coinInfoX.coinType,
      coinTypeY: this.coinInfoY.coinType,
    });
    if (pool == undefined) {
      throw new Error("Failed to find pool to update.");
    }
    this.coinInfoX = pool.coinInfoX;
    this.coinInfoY = pool.coinInfoY;
    this.coinInfoLP = pool.coinInfoLP;
    this.amountAuX = pool.amountAuX;
    this.amountAuY = pool.amountAuY;
    this.amountAuLP = pool.amountAuLP;
    this.feeBps = pool.feeBps;
    this.amountX = this.amountAuX.toDecimalUnits(pool.coinInfoX.decimals);
    this.amountY = this.amountAuY.toDecimalUnits(pool.coinInfoY.decimals);
    this.amountLP = this.amountAuLP.toDecimalUnits(pool.coinInfoLP.decimals);
    this.feePct = pool.feeBps.toNumber() / 10_000;
  }

  /**
   * @returns all swap events from the pool.
   */
  async swapEvents(): Promise<core.events.SwapEvent[]> {
    return core.query.swapEvents(this.auxClient, this.poolInput());
  }

  /**
   * @returns all add liquidity events from the pool.
   */
  async addLiquidityEvents(): Promise<core.events.AddLiquidityEvent[]> {
    return core.query.addLiquidityEvents(this.auxClient, this.poolInput());
  }

  /**
   * @returns all remove liquidity events from the pool.
   */
  async removeLiquidityEvents(): Promise<core.events.RemoveLiquidityEvent[]> {
    return core.query.removeLiquidityEvents(this.auxClient, this.poolInput());
  }

  private poolInput(): PoolInput {
    return {
      coinTypeX: this.coinInfoX.coinType,
      coinTypeY: this.coinInfoY.coinType,
    };
  }
}

interface CreateParams {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  feePct: number;
}

interface ReadParams {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
}

interface SwapExactInParams {
  sender: AptosAccount;
  exactAmountIn: AnyUnits;
  minAmountOut: AnyUnits;
}

interface SwapExactOutParams {
  sender: AptosAccount;
  maxAmountIn: AnyUnits;
  exactAmountOut: AnyUnits;
}
interface SwapExactInLimitParams {
  sender: AptosAccount;
  exactAmountIn: AnyUnits;
  minOutPerIn: AnyUnits;
}

interface SwapExactOutLimitParams {
  sender: AptosAccount;
  maxAmountIn: AnyUnits;
  maxInPerOut: AnyUnits;
  exactAmountOut: AnyUnits;
}

interface SwapInParams {
  kind: "in";
  coinTypeIn: Types.MoveStructTag;
  amountIn: AnyUnits;
  slippage?:
    | { kind: "total"; minAmountOut: AnyUnits }
    | { kind: "marginal"; minAmountOutPerIn: AnyUnits };
  // | { kind: "ratio"; bps: number };  // TODO
}

interface SwapOutParams {
  kind: "out";
  coinTypeOut: Types.MoveStructTag;
  amountOut: AnyUnits;
  slippage?:
    | { kind: "total"; maxAmountIn: AnyUnits }
    | { kind: "marginal"; maxAmountInPerOut: AnyUnits };
  // | { kind: "ratio"; bps: number };  // TODO
}

interface AddLiquidityParams {
  sender: AptosAccount;
  amountX: AnyUnits;
  amountY: AnyUnits;
  maxSlippageBps: AtomicUnits;
}

interface AddExactLiquidityParams {
  sender: AptosAccount;
  amountX: AnyUnits;
  amountY: AnyUnits;
}

interface AddApproximateLiquidityParams {
  sender: AptosAccount;
  maxX: AnyUnits;
  maxY: AnyUnits;
  minLP?: AnyUnits;
  maxPoolLP?: AnyUnits;
  minPoolX?: AnyUnits;
  minPoolY?: AnyUnits;
}

interface RemoveLiquidityParams {
  sender: AptosAccount;
  amountLP: AnyUnits;
}

interface ResetPoolParams {
  sender: AptosAccount;
}
