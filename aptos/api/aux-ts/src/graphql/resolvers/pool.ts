import { ConstantProductClient } from "../../pool/constant-product/client";
import { ALL_USD_STABLES, COIN_MAPPING, fakeMapping } from "../../coin";
import { auxClient, redisClient } from "../client";
import {
  AddLiquidity,
  Maybe,
  Pool,
  PoolPositionArgs,
  PoolPriceArgs,
  PoolQuoteExactInArgs,
  PoolQuoteExactOutArgs,
  PoolSummaryStatistics,
  Position,
  QuoteExactIn,
  QuoteExactOut,
  RatingColor,
  RemoveLiquidity,
  Scalars,
  Swap,
} from "../generated/types";
import { generatePythRating, LATEST_PYTH_PRICE } from "../pyth";

const PRICE_IMPACT_PCT_RED: number = 0.5;
const PRICE_IMPACT_PCT_YELLOW: number = 0.2;

export const pool = {
  async swaps({ coinInfos }: Pool): Promise<Swap[]> {
    const coinInfoX = coinInfos[0]!;
    const coinInfoY = coinInfos[1]!;
    const [coinTypeX, coinTypeY] = [coinInfoX.coinType, coinInfoY.coinType];
    const swaps = await new ConstantProductClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).swapEvents();
    return swaps.map((swap) => {
      const coinInfoIn = swap.coinTypeIn === coinTypeX ? coinInfoX : coinInfoY;
      const coinInfoOut =
        swap.coinTypeOut === coinTypeY ? coinInfoY : coinInfoX;
      return {
        ...swap,
        coinInfoIn,
        coinInfoOut,
        amountIn: swap.amountIn.toDecimalUnits(coinInfoIn.decimals).toNumber(),
        amountOut: swap.amountOut
          .toDecimalUnits(coinInfoOut.decimals)
          .toNumber(),
        time: swap.timestamp.divn(1000).toString(), // microseconds => milliseconds
      };
    });
  },

  async adds(parent: Pool): Promise<AddLiquidity[]> {
    const coinInfoX = parent.coinInfos[0]!;
    const coinInfoY = parent.coinInfos[1]!;
    const addLiquiditys = await new ConstantProductClient(auxClient, {
      coinTypeX: coinInfoX.coinType,
      coinTypeY: coinInfoY.coinType,
    }).addLiquidityEvents();
    return addLiquiditys.map((addLiquidity) => ({
      ...addLiquidity,
      amountsAdded: [
        addLiquidity.xAdded.toDecimalUnits(coinInfoX.decimals).toNumber(),
        addLiquidity.yAdded.toDecimalUnits(coinInfoY.decimals).toNumber(),
      ],
      amountMintedLP: addLiquidity.lpMinted
        .toDecimalUnits(parent.coinInfoLP.decimals)
        .toNumber(),
      time: addLiquidity.timestamp.divn(1000).toString(), // microseconds => milliseconds
    }));
  },

  async removes(parent: Pool): Promise<RemoveLiquidity[]> {
    const coinInfoX = parent.coinInfos[0]!;
    const coinInfoY = parent.coinInfos[1]!;
    const removeLiquiditys = await new ConstantProductClient(auxClient, {
      coinTypeX: coinInfoX.coinType,
      coinTypeY: coinInfoY.coinType,
    }).removeLiquidityEvents();
    return removeLiquiditys.map((removeLiquidity) => ({
      ...removeLiquidity,
      amountsRemoved: [
        removeLiquidity.xRemoved.toDecimalUnits(coinInfoX.decimals).toNumber(),
        removeLiquidity.yRemoved.toDecimalUnits(coinInfoY.decimals).toNumber(),
      ],
      amountBurnedLP: removeLiquidity.lpBurned
        .toDecimalUnits(parent.coinInfoLP.decimals)
        .toNumber(),
      time: removeLiquidity.timestamp.divn(1000).toString(), // microseconds => milliseconds
    }));
  },

  async position(
    parent: Pool,
    { owner }: PoolPositionArgs
  ): Promise<Maybe<Position>> {
    const coinInfoX = parent.coinInfos[0]!;
    const coinInfoY = parent.coinInfos[1]!;
    const position = await new ConstantProductClient(auxClient, {
      coinTypeX: coinInfoX.coinType,
      coinTypeY: coinInfoY.coinType,
    }).position(owner);
    return position
      ? {
          ...position,
          coinInfos: [position.coinInfoX, position.coinInfoY],
          amounts: [position.amountX.toNumber(), position.amountY.toNumber()],
          amountLP: position.amountLP.toNumber(),
        }
      : null;
  },

  price(parent: Pool, {coinTypeIn, amountIn}: PoolPriceArgs): Scalars['Float'] {
    // TODO n-pool stable swap
    const coinInfoX = parent.coinInfos[0]!;
    const amountX = parent.amounts[0]!;
    const amountY = parent.amounts[1]!;
    const inReserve =
      coinTypeIn === coinInfoX.coinType
        ? amountX
        : amountY;
    const outReserve =
      coinTypeIn === coinInfoX.coinType
        ? amountY
        : amountX; 
    
    const ratio = outReserve / inReserve;
    return ratio * amountIn;
  },

  quoteExactIn(
    parent: Pool,
    { coinTypeIn, amountIn, slippagePct }: PoolQuoteExactInArgs
  ): QuoteExactIn {
    const coinInfoX = parent.coinInfos[0]!;
    const coinInfoY = parent.coinInfos[1]!;
    const amountX = parent.amounts[0]!;
    const amountY = parent.amounts[1]!;
    const inReserve = coinTypeIn === coinInfoX.coinType ? amountX : amountY;
    const outReserve = coinTypeIn === coinInfoX.coinType ? amountY : amountX;
    const coinTypeOut =
      coinTypeIn === coinInfoX.coinType
        ? coinInfoY.coinType
        : coinInfoX.coinType;
    const coinInfoIn =
      coinTypeIn === coinInfoX.coinType ? coinInfoX : coinInfoY;

    if (inReserve === 0 || outReserve === 0) {
      throw new Error("Pool is empty");
    }

    const decimalUnitsInWithFee = amountIn * (1 - parent.feePercent / 100.0);
    const expectedAmountOutNoFee =
      (amountIn * outReserve) / (inReserve + amountIn);
    const expectedAmountOut =
      (decimalUnitsInWithFee * outReserve) /
      (inReserve + decimalUnitsInWithFee);
    const slippage = 1 - (slippagePct ?? 0.1) / 100.0;
    const minAmountOut = expectedAmountOut * slippage;
    const feeAmount = amountIn * (parent.feePercent / 100.0);
    const FAKE_MAPPING = fakeMapping(auxClient);
    const mappedCoinIn = FAKE_MAPPING.get(coinTypeIn) ?? coinTypeIn;
    const inputCoinSymbol = COIN_MAPPING.get(mappedCoinIn)?.pythSymbol;
    const pythPriceCoinIn = !!inputCoinSymbol
      ? ALL_USD_STABLES.includes(inputCoinSymbol)
        ? 1
        : LATEST_PYTH_PRICE.get(inputCoinSymbol)
      : null;
    const feeAmountDollars = !!pythPriceCoinIn
      ? pythPriceCoinIn * feeAmount
      : null;
    const instantaneousAmountOut = (outReserve / inReserve) * amountIn;
    const priceImpactPct =
      (100.0 * (instantaneousAmountOut - expectedAmountOutNoFee)) /
      instantaneousAmountOut;
    const priceIn = expectedAmountOut / amountIn;
    const priceOut = amountIn / expectedAmountOut;
    let ratio = null;
    if (!!pythPriceCoinIn) {
      ratio = (pythPriceCoinIn - priceIn) / pythPriceCoinIn;
    } else {
      const mappedCoinOut = FAKE_MAPPING.get(coinTypeOut) ?? coinTypeOut;
      const outputCoinSymbol = COIN_MAPPING.get(mappedCoinOut)?.pythSymbol;
      const pythPriceCoinOut = !!outputCoinSymbol
        ? ALL_USD_STABLES.includes(outputCoinSymbol)
          ? 1
          : LATEST_PYTH_PRICE.get(outputCoinSymbol)
        : null;
      if (!!pythPriceCoinOut) {
        ratio = (priceOut - pythPriceCoinOut) / pythPriceCoinOut;
      }
    }
    const pythRating = !!ratio
      ? generatePythRating({ ratio, price: priceOut, redPct: 2, yellowPct: 1 })
      : null;
    return {
      expectedAmountOut,
      minAmountOut,
      feeAmount,
      feeAmountDollars,
      priceImpactPct,
      priceIn,
      priceOut,
      pythRating,
      feeCurrency: coinInfoIn,
      priceImpactRating:
        priceImpactPct > PRICE_IMPACT_PCT_RED
          ? RatingColor.Red
          : priceImpactPct > PRICE_IMPACT_PCT_YELLOW
          ? RatingColor.Yellow
          : RatingColor.Green,
    };
  },

  quoteExactOut(
    parent: Pool,
    { coinTypeOut, amountOut, slippagePct }: PoolQuoteExactOutArgs
  ): QuoteExactOut {
    const coinInfoX = parent.coinInfos[0]!;
    const coinInfoY = parent.coinInfos[1]!;
    const amountX = parent.amounts[0]!;
    const amountY = parent.amounts[1]!;
    const inReserve = coinTypeOut == coinInfoY.coinType ? amountX : amountY;
    const outReserve = coinTypeOut == coinInfoY.coinType ? amountY : amountX;

    const coinInfoIn =
      coinTypeOut === coinInfoX.coinType ? coinInfoY : coinInfoX;

    const coinTypeIn = coinInfoIn.coinType;

    if (inReserve == 0 || outReserve == 0) {
      throw new Error("Pool is empty");
    }

    if (amountOut >= outReserve) {
      throw new Error("Insufficient pool reserves");
    }
    const numerator = inReserve * amountOut;
    const denominator =
      (outReserve - amountOut) * (1 - parent.feePercent / 100.0);
    const expectedAmountIn = numerator / denominator;
    const slippage = (1 + (slippagePct ?? 0.1)) / 100.0;
    const maxAmountIn = expectedAmountIn * slippage;
    const maxFeeAmount = maxAmountIn * (parent.feePercent / 100.0);
    const FAKE_MAPPING = fakeMapping(auxClient);
    const mappedCoinIn = FAKE_MAPPING.get(coinTypeIn) ?? coinTypeIn;
    const inputCoinSymbol = COIN_MAPPING.get(mappedCoinIn)?.pythSymbol;
    const pythPriceCoinIn = !!inputCoinSymbol
      ? ALL_USD_STABLES.includes(inputCoinSymbol)
        ? 1
        : LATEST_PYTH_PRICE.get(inputCoinSymbol)
      : null;
    const maxFeeAmountDollars = !!pythPriceCoinIn
      ? pythPriceCoinIn * maxFeeAmount
      : null;
    const instantaneousAmountOut =
      (outReserve / inReserve) *
      expectedAmountIn *
      (1 - parent.feePercent / 100.0);
    const priceImpactPct =
      (100.0 * (instantaneousAmountOut - amountOut)) / instantaneousAmountOut;
    const priceIn = amountOut / expectedAmountIn;
    const priceOut = expectedAmountIn / amountOut;
    let ratio = null;
    if (!!pythPriceCoinIn) {
      ratio = (pythPriceCoinIn - priceIn) / pythPriceCoinIn;
    } else {
      const mappedCoinOut = FAKE_MAPPING.get(coinTypeOut) ?? coinTypeOut;
      const outputCoinSymbol = COIN_MAPPING.get(mappedCoinOut)?.pythSymbol;
      const pythPriceCoinOut = !!outputCoinSymbol
        ? ALL_USD_STABLES.includes(outputCoinSymbol)
          ? 1
          : LATEST_PYTH_PRICE.get(outputCoinSymbol)
        : null;
      if (!!pythPriceCoinOut) {
        ratio = (priceOut - pythPriceCoinOut) / pythPriceCoinOut;
      }
    }
    const pythRating = !!ratio
      ? generatePythRating({ ratio, price: priceOut, redPct: 2, yellowPct: 1 })
      : null;
    return {
      maxAmountIn,
      expectedAmountIn,
      maxFeeAmount,
      maxFeeAmountDollars,
      priceImpactPct,
      priceIn,
      priceOut,
      pythRating,
      feeCurrency: coinInfoIn,
      priceImpactRating:
        priceImpactPct > PRICE_IMPACT_PCT_RED
          ? RatingColor.Red
          : priceImpactPct > PRICE_IMPACT_PCT_YELLOW
          ? RatingColor.Yellow
          : RatingColor.Green,
    };
  },
  
  async summaryStatistics(parent: Pool): Promise<PoolSummaryStatistics> {
    const volume24h = await stat("volume", parent, "24h");
    const fee24h = await stat("fee", parent, "24h");
    const userCount24h = await stat("usercount", parent, "24h");
    const transactionCount24h = await stat("txcount", parent, "24h");
    const volume1w = await stat("volume", parent, "1w");
    const fee1w = await stat("fee", parent, "1w");
    const userCount1w = await stat("usercount", parent, "1w");
    const transactionCount1w = await stat("txcount", parent, "1w");
    const tvl = await stat("tvl", parent, "1w");
    return {
      tvl,
      volume24h,
      fee24h,
      userCount24h,
      transactionCount24h,
      volume1w,
      fee1w,
      userCount1w,
      transactionCount1w,
    };
  },
};

async function stat(
  name: "tvl" | "volume" | "fee" | "usercount" | "txcount",
  pool: Pool,
  period: "1w" | "24h"
): Promise<Maybe<number>> {
  if (name === "tvl") {
    const value = await redisClient.get(
      `amm-${pool.coinInfos[0]!.coinType}-${
        pool.coinInfos[1]!.coinType
      }-${name}`
    );
    return value ? Number(value) : null;
  } else {
    const value = await redisClient.get(
      `amm-${pool.coinInfos[0]!.coinType}-${
        pool.coinInfos[1]!.coinType
      }-${name}-${period}`
    );
    return value ? Number(value) : null;
  }
}
