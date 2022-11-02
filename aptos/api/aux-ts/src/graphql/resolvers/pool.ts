import * as aux from "../../";
import { ALL_USD_STABLES, COIN_MAPPING, fakeMapping } from "../../coins";
import { auxClient } from "../connection";
import {
  AddLiquidity,
  Maybe,
  Pool,
  PoolPositionArgs,
  PoolQuoteExactInArgs,
  PoolQuoteExactOutArgs,
  Position,
  RatingColor,
  QuoteExactIn,
  QuoteExactOut,
  RemoveLiquidity,
  Swap,
} from "../generated/types";
import { generatePythRating, LATEST_PYTH_PRICE } from "../pyth";

export const pool = {
  priceX(parent: Pool): number {
    return parent.amountX === 0 ? 0 : parent.amountY / parent.amountX;
  },
  priceY(parent: Pool): number {
    return parent.amountY === 0 ? 0 : parent.amountX / parent.amountY;
  },
  async swaps(parent: Pool): Promise<Swap[]> {
    const swaps = await aux.amm.core.query.swapEvents(auxClient, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    });
    return swaps.map((swap) => {
      const coinInfoIn =
        swap.inCoinType === parent.coinInfoX.coinType
          ? parent.coinInfoX
          : parent.coinInfoY;
      const coinInfoOut =
        swap.outCoinType === parent.coinInfoY.coinType
          ? parent.coinInfoY
          : parent.coinInfoX;
      return {
        ...swap,
        coinInfoIn,
        coinInfoOut,
        amountIn: swap.in.toDecimalUnits(coinInfoIn.decimals).toNumber(),
        amountOut: swap.out.toDecimalUnits(coinInfoOut.decimals).toNumber(),
        time: swap.timestamp.divn(1000).toString(), // microseconds => milliseconds
      };
    });
  },
  async adds(parent: Pool): Promise<AddLiquidity[]> {
    const addLiquiditys = await aux.amm.core.query.addLiquidityEvents(
      auxClient,
      {
        coinTypeX: parent.coinInfoX.coinType,
        coinTypeY: parent.coinInfoY.coinType,
      }
    );
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
    const removeLiquiditys = await aux.amm.core.query.removeLiquidityEvents(
      auxClient,
      {
        coinTypeX: parent.coinInfoX.coinType,
        coinTypeY: parent.coinInfoY.coinType,
      }
    );
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
    const position = await aux.amm.core.query.position(auxClient, owner, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    });
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
    { coinTypeIn, amountIn, slippagePct }: PoolQuoteExactInArgs
  ): QuoteExactIn {
    const inReserve =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountX
        : parent.amountY;
    const outReserve =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountY
        : parent.amountX;
    const coinTypeOut =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.coinInfoY.coinType
        : parent.coinInfoX.coinType;
    const coinInfoIn =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.coinInfoX
        : parent.coinInfoY;

    if (inReserve === 0 || outReserve === 0) {
      throw new Error("Pool is empty");
    }

    const decimalUnitsInWithFee = amountIn * (1 - parent.feePercent / 100.0);
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
      (100.0 * (instantaneousAmountOut - expectedAmountOut)) /
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
        priceImpactPct > 0.2
          ? RatingColor.Red
          : priceImpactPct > 0.1
          ? RatingColor.Yellow
          : RatingColor.Green,
    };
  },
  quoteExactOut(
    parent: Pool,
    { coinTypeOut, amountOut, slippagePct }: PoolQuoteExactOutArgs
  ): QuoteExactOut {
    const inReserve =
      coinTypeOut == parent.coinInfoY.coinType
        ? parent.amountX
        : parent.amountY;
    const outReserve =
      coinTypeOut == parent.coinInfoY.coinType
        ? parent.amountY
        : parent.amountX;

    const coinInfoIn =
      coinTypeOut === parent.coinInfoX.coinType
        ? parent.coinInfoY
        : parent.coinInfoX;

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
      100.0 * (instantaneousAmountOut - amountOut) / instantaneousAmountOut;
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
        priceImpactPct > 0.2
          ? RatingColor.Red
          : priceImpactPct > 0.1
          ? RatingColor.Yellow
          : RatingColor.Green,
    };
  },
};
