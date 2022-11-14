import { PoolClient } from "../../pool/client";
import { auxClient, redisClient } from "../client";
import {
  AddLiquidity,
  Maybe,
  Pool,
  PoolPositionArgs,
  PoolQuoteExactInArgs,
  PoolQuoteExactOutArgs,
  PoolSummaryStatistics,
  Position,
  QuoteExactIn,
  QuoteExactOut,
  RatingColor,
  RemoveLiquidity,
  Swap,
} from "../generated/types";

export const pool = {
  async swaps({ coinInfoX, coinInfoY }: Pool): Promise<Swap[]> {
    const [coinTypeX, coinTypeY] = [coinInfoX.coinType, coinInfoY.coinType];
    const swaps = await new PoolClient(auxClient, {
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
    const addLiquiditys = await new PoolClient(auxClient, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    }).addLiquidityEvents();
    return addLiquiditys.map((addLiquidity) => ({
      ...addLiquidity,
      amountAddedX: addLiquidity.xAdded
        .toDecimalUnits(parent.coinInfoX.decimals)
        .toNumber(),
      amountAddedY: addLiquidity.yAdded
        .toDecimalUnits(parent.coinInfoY.decimals)
        .toNumber(),
      amountMintedLP: addLiquidity.lpMinted
        .toDecimalUnits(parent.coinInfoLP.decimals)
        .toNumber(),
      time: addLiquidity.timestamp.divn(1000).toString(), // microseconds => milliseconds
    }));
  },

  async removes(parent: Pool): Promise<RemoveLiquidity[]> {
    const removeLiquiditys = await new PoolClient(auxClient, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    }).removeLiquidityEvents();
    return removeLiquiditys.map((removeLiquidity) => ({
      ...removeLiquidity,
      amountRemovedX: removeLiquidity.xRemoved
        .toDecimalUnits(parent.coinInfoX.decimals)
        .toNumber(),
      amountRemovedY: removeLiquidity.yRemoved
        .toDecimalUnits(parent.coinInfoY.decimals)
        .toNumber(),
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
    const position = await new PoolClient(auxClient, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    }).position(owner);
    return position
      ? {
          ...position,
          amountX: position.amountX.toNumber(),
          amountY: position.amountY.toNumber(),
          amountLP: position.amountLP.toNumber(),
        }
      : null;
  },

  quoteExactIn(
    parent: Pool,
    { coinTypeIn }: PoolQuoteExactInArgs
  ): QuoteExactIn {
    const coinInfoIn =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.coinInfoX
        : parent.coinInfoY;
    return {
      expectedAmountOut: 42,
      minAmountOut: 41,
      feeAmount: 0.42,
      feeCurrency: coinInfoIn,
      feeAmountDollars: 0.42,
      priceImpactPct: 4.2,
      priceImpactRating: RatingColor.Green,
      priceOut: 42,
      priceIn: 42,
    };
  },

  quoteExactOut(
    parent: Pool,
    { coinTypeOut }: PoolQuoteExactOutArgs
  ): QuoteExactOut {
    const coinInfoIn =
      coinTypeOut === parent.coinInfoY.coinType
        ? parent.coinInfoX
        : parent.coinInfoY;
    return {
      expectedAmountIn: 42,
      maxAmountIn: 41,
      maxFeeAmount: 0.42,
      feeCurrency: coinInfoIn,
      maxFeeAmountDollars: 0.42,
      priceImpactPct: 4.2,
      priceImpactRating: RatingColor.Green,
      priceOut: 42,
      priceIn: 42,
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
      `amm-${pool.coinInfoX.coinType}-${pool.coinInfoY.coinType}-${name}`
    );
    return value ? Number(value) : null;
  } else {
    const value = await redisClient.get(
      `amm-${pool.coinInfoX.coinType}-${pool.coinInfoY.coinType}-${name}-${period}`
    );
    return value ? Number(value) : null;
  }
}
