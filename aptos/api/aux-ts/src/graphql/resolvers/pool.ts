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
  async swapHistory(parent: Pool): Promise<Swap[]> {
    const swaps = await aux.amm.core.query.swapEvents(auxClient, {
      coinTypeX: parent.coinInfoX.coinType,
      coinTypeY: parent.coinInfoY.coinType,
    });
    return swaps.map((swap) => ({
      ...swap,
      coinInfoIn:
        swap.inCoinType === parent.coinInfoX.coinType
          ? parent.coinInfoX
          : parent.coinInfoY,
      coinInfoOut:
        swap.outCoinType === parent.coinInfoY.coinType
          ? parent.coinInfoY
          : parent.coinInfoX,
      amountIn: swap.in.toNumber(),
      amountOut: swap.out.toNumber(),
    }));
  },
  async addLiquidityHistory(parent: Pool) {
    const addLiquiditys = await aux.amm.core.query.addLiquidityEvents(
      auxClient,
      {
        coinTypeX: parent.coinInfoX.coinType,
        coinTypeY: parent.coinInfoY.coinType,
      }
    );
    return addLiquiditys.map((addLiquidity) => ({
      ...addLiquidity,
      amountAddedX: addLiquidity.xAdded.toNumber(),
      amountAddedY: addLiquidity.yAdded.toNumber(),
      amountMintedLP: addLiquidity.lpMinted.toNumber(),
    }));
  },
  async removeLiquidityHistory(parent: Pool) {
    const removeLiquiditys = await aux.amm.core.query.removeLiquidityEvents(
      auxClient,
      {
        coinTypeX: parent.coinInfoX.coinType,
        coinTypeY: parent.coinInfoY.coinType,
      }
    );
    return removeLiquiditys.map((removeLiquidity) => ({
      ...removeLiquidity,
      amountRemovedX: removeLiquidity.xRemoved.toNumber(),
      amountRemovedY: removeLiquidity.yRemoved.toNumber(),
      amountBurnedLP: removeLiquidity.lpBurned.toNumber(),
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
    console.log(parent.amountX, parent.amountY);
    // console.log(parent.amountY)
    const ratio =
      coinTypeIn === parent.coinInfoX.coinType
        ? parent.amountY / parent.amountX
        : parent.amountX / parent.amountY;
    // console.log(ratio, amount)
    return amount * ratio;
    // const coinInfoOut =
    //   coinTypeIn === parent.coinInfoX.coinType
    //     ? parent.coinInfoY
    //     : parent.coinInfoX;
    // const router = new aux.Router({ client: auxClient });
    // router.sender = new AptosAccount();
    // const quote = await router.quoteExactCoinForCoin({
    //   exactAmountIn: DU(amount),
    //   coinTypeIn,
    //   coinTypeOut: coinInfoOut.coinType,
    // });
    // return (
    //   quote.payload?.amount.toDecimalUnits(coinInfoOut.decimals).toNumber() ??
    //   null
    // );
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
    // console.log(ratio, amount)
    return amount * ratio;
    // const coinInfoIn =
    //   coinTypeOut === parent.coinInfoY.coinType
    //     ? parent.coinInfoX
    //     : parent.coinInfoY;
    // const router = new aux.Router({ client: auxClient });
    // const quote = await router.quoteCoinForExactCoin({
    //   exactAmountOut: DU(amount),
    //   coinTypeIn: coinInfoIn.coinType,
    //   coinTypeOut,
    // });
    // return (
    //   quote.payload?.amount.toDecimalUnits(coinInfoIn.decimals).toNumber() ??
    //   null
    // );
  },
};
