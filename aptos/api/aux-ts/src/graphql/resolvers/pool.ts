import * as aux from "../../";
import { auxClient } from "../connection";
import type {
  AddLiquidity,
  Maybe,
  Pool,
  PoolPositionArgs,
  PoolQuoteExactInArgs,
  PoolQuoteExactOutArgs,
  Position,
  RemoveLiquidity,
  Swap,
} from "../generated/types";

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
    { coinTypeIn, amountIn }: PoolQuoteExactInArgs
  ): number {
    const inReserve =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountX
        : parent.amountY;
    const outReserve =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountY
        : parent.amountX;

    if (inReserve === 0 || outReserve === 0) {
      throw new Error("Pool is empty");
    }

    const decimalUnitsInWithFee = amountIn * (1 - parent.feePercent / 100.0);
    return (
      (decimalUnitsInWithFee * outReserve) / (inReserve + decimalUnitsInWithFee)
    );
  },
  quoteExactOut(
    parent: Pool,
    { coinTypeOut, amountOut }: PoolQuoteExactOutArgs
  ): number {
    const inReserve =
      coinTypeOut == parent.coinInfoY.coinType
        ? parent.amountX
        : parent.amountY;
    const outReserve =
      coinTypeOut == parent.coinInfoY.coinType
        ? parent.amountY
        : parent.amountX;

    if (inReserve == 0 || outReserve == 0) {
      throw new Error("Pool is empty");
    }

    if (amountOut >= outReserve) {
      throw new Error("Insufficient pool reserves");
    }
    const numerator = inReserve * amountOut;
    const denominator =
      (outReserve - amountOut) * (1 - parent.feePercent / 100.0);
    return numerator / denominator;
  },
};
