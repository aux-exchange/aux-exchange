import { AptosAccount } from "aptos";
import * as aux from "../../";
import { DU } from "../../";
import { auxClient } from "../connection";
import type {
  Maybe,
  Pool,
  PoolPositionArgs,
  PoolPriceInArgs,
  PoolPriceOutArgs,
  Position,
  Swap,
} from "../types";

export const pool = {
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
      };
    });
  },
  async adds(parent: Pool) {
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
    }));
  },
  async removes(parent: Pool) {
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
  async priceIn(
    parent: Pool,
    { coinTypeIn, amount }: PoolPriceInArgs
  ): Promise<Maybe<number>> {
    const ratio =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountY / parent.amountX
        : parent.amountX / parent.amountY;
    return amount * ratio;
  },
  async priceOut(
    parent: Pool,
    { coinTypeOut, amount }: PoolPriceOutArgs
  ): Promise<Maybe<number>> {
    DU;
    AptosAccount;
    const ratio =
      coinTypeOut === parent.coinInfoY.coinType
        ? parent.amountY / parent.amountX
        : parent.amountX / parent.amountY;
    return amount * ratio;
  },
};
