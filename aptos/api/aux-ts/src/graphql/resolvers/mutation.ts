// TODO GraphQL currently uses a hack where it simulates a tx, and then extracts the tx payload.
//
// Note the `simulate` is unnecesssary: the payload is already known before simulate.
//
// The TODO is to refactor the API to support a "builder" interface (but it is somewhat tricky to
// do this cleanly)

import _ from "lodash";
import * as aux from "../../";
import { PoolClient } from "../../pool/client";
import { OrderType as AuxOrderType } from "../../clob/core/mutation";
import { Bps, DU, Pct } from "../../units";
import { auxClient } from "../client";
import {
  MutationAddLiquidityArgs,
  MutationCancelOrderArgs,
  MutationCreateMarketArgs,
  MutationCreatePoolArgs,
  MutationDepositArgs,
  MutationPlaceOrderArgs,
  MutationRegisterCoinArgs,
  MutationRemoveLiquidityArgs,
  MutationSwapExactInArgs,
  MutationSwapExactOutArgs,
  MutationTransferArgs,
  MutationWithdrawArgs,
  OrderType,
  Side,
} from "../generated/types";

export const mutation = {
  registerCoin(_parent: any, { registerCoinInput }: MutationRegisterCoinArgs) {
    return {
      function: `0x1::managed_coin::register`,
      type_arguments: [registerCoinInput.coinType],
      arguments: [],
    };
  },

  async createPool(_parent: any, { createPoolInput }: MutationCreatePoolArgs) {
    const { coinTypeX, coinTypeY } = createPoolInput.poolInput;
    const poolClient = await new PoolClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    return poolClient.create({
      fee: new Bps(Number(createPoolInput.feeBasisPoints)),
    });
  },

  async swapExactIn(
    _parent: any,
    {
      swapExactInInput: {
        coinTypeIn,
        amountIn,
        poolInput: { coinTypeX, coinTypeY },
        slippagePct,
      },
    }: MutationSwapExactInArgs
  ) {
    const poolClient = await new PoolClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    const exactAmountIn = DU(amountIn);
    const parameters = _.isNil(slippagePct)
      ? {}
      : { slippage: new Pct(slippagePct) };
    // TODO this is a giant hack to grab a payload by simulating it, and then extracting the
    // simulated payload.
    // Need to refactor API to support "builder" (but somewhat tricky to do this cleanly / adding
    // way too much code)
    const tx = await poolClient.swap(
      { coinTypeIn, exactAmountIn, parameters },
      { simulate: true }
    );
    return tx.transaction.payload;
  },

  async swapExactOut(
    _parent: any,
    {
      swapExactOutInput: {
        coinTypeOut,
        amountOut,
        poolInput: { coinTypeX, coinTypeY },
        slippagePct,
      },
    }: MutationSwapExactOutArgs
  ) {
    const poolClient = await new PoolClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    const exactAmountOut = DU(amountOut);
    const parameters = _.isNil(slippagePct)
      ? {}
      : { slippage: new Pct(slippagePct) };
    const tx = await poolClient.swap(
      { coinTypeOut, exactAmountOut, parameters },
      { simulate: true }
    );
    return tx.transaction.payload;
  },

  async addLiquidity(
    _parent: any,
    {
      addLiquidityInput: {
        poolInput: { coinTypeX, coinTypeY },
        amountX,
        amountY,
        useAuxAccount,
      },
    }: MutationAddLiquidityArgs
  ) {
    const poolClient = await new PoolClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    useAuxAccount = useAuxAccount ?? false;
    return poolClient.addLiquidity(
      {
        amountX: DU(amountX),
        amountY: DU(amountY),
        useAuxAccount,
      },
      {
        simulate: true,
      }
    );
  },

  async removeLiquidity(
    _parent: any,
    {
      removeLiquidityInput: {
        poolInput: { coinTypeX, coinTypeY },
        amountLP,
        useAuxAccount,
      },
    }: MutationRemoveLiquidityArgs
  ) {
    const poolClient = await new PoolClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    useAuxAccount = useAuxAccount ?? false;
    const tx = await poolClient.removeLiquidity(
      { amountLP: DU(amountLP), useAuxAccount },
      { simulate: true }
    );
    return tx.transaction.payload;
  },

  async createMarket(
    _parent: any,
    { createMarketInput }: MutationCreateMarketArgs
  ) {
    const { baseCoinType, quoteCoinType } = createMarketInput.marketInput;
    const [baseCoinInfo, quoteCoinInfo] = await Promise.all([
      auxClient.getCoinInfo(baseCoinType),
      auxClient.getCoinInfo(quoteCoinType),
    ]);
    // @ts-ignore
    return aux.clob.core.mutation.createMarketPayload(auxClient, {
      // @ts-ignore
      sender: undefined,
      baseCoinType,
      quoteCoinType,
      baseLotSize: DU(createMarketInput.baseLotSize)
        .toAtomicUnits(baseCoinInfo.decimals)
        .toString(),
      quoteLotSize: DU(createMarketInput.quoteLotSize)
        .toAtomicUnits(quoteCoinInfo.decimals)
        .toString(),
    });
  },

  async placeOrder(_parent: any, { placeOrderInput }: MutationPlaceOrderArgs) {
    const { baseCoinType, quoteCoinType } = placeOrderInput.marketInput;
    const market = await aux.clob.core.query.market(
      auxClient,
      baseCoinType,
      quoteCoinType
    );
    return aux.clob.core.mutation.placeOrderPayload(auxClient, {
      // @ts-ignore
      sender: { address: () => placeOrderInput.sender },
      market,
      isBid: placeOrderInput.side === Side.Buy ? true : false,
      limitPriceAu: DU(placeOrderInput.limitPrice)
        .toAtomicUnits(market.quoteCoinInfo.decimals)
        .toString(),
      quantityAu: DU(placeOrderInput.quantity)
        .toAtomicUnits(market.baseCoinInfo.decimals)
        .toString(),
      auxToBurnAu: DU(placeOrderInput.auxToBurn).toAtomicUnits(6).toString(),
      clientOrderId: placeOrderInput.clientOrderId.toString(),
      orderType: convertOrderType(placeOrderInput.orderType),
    });
  },

  cancelOrder(_parent: any, { cancelOrderInput }: MutationCancelOrderArgs) {
    const { baseCoinType, quoteCoinType } = cancelOrderInput.marketInput;
    return aux.clob.core.mutation.cancelOrderPayload(auxClient, {
      // @ts-ignore
      sender: { address: () => cancelOrderInput.sender },
      baseCoinType,
      quoteCoinType,
      orderId: cancelOrderInput.orderId,
    });
  },

  createAuxAccount() {
    return aux.vault.core.mutation.createAuxAccountPayload(auxClient);
  },

  async deposit(_parent: any, { depositInput }: MutationDepositArgs) {
    return aux.vault.core.mutation.depositPayload(auxClient, {
      coinType: depositInput.coinType,
      sender: depositInput.from,
      to: depositInput.to,
      amountAu: DU(depositInput.amount)
        .toAtomicUnits(
          (await auxClient.getCoinInfo(depositInput.coinType)).decimals
        )
        .toString(),
    });
  },

  async withdraw(_parent: any, { withdrawInput }: MutationWithdrawArgs) {
    return aux.vault.core.mutation.withdrawPayload(auxClient, {
      coinType: withdrawInput.coinType,
      sender: withdrawInput.from,
      amountAu: DU(withdrawInput.amount)
        .toAtomicUnits(
          (await auxClient.getCoinInfo(withdrawInput.coinType)).decimals
        )
        .toString(),
    });
  },

  async transfer(_parent: any, { transferInput }: MutationTransferArgs) {
    return aux.vault.core.mutation.transferPayload(auxClient, {
      sender: transferInput.from,
      recipient: transferInput.to,
      coinType: transferInput.coinType,
      amountAu: DU(transferInput.amount)
        .toAtomicUnits(
          (await auxClient.getCoinInfo(transferInput.coinType)).decimals
        )
        .toString(),
    });
  },
};

function convertOrderType(orderType: OrderType): AuxOrderType {
  if (orderType === OrderType.Limit) {
    return AuxOrderType.LIMIT_ORDER;
  } else if (orderType === OrderType.FillOrKill) {
    return AuxOrderType.FILL_OR_KILL_ORDER;
  } else if (orderType === OrderType.ImmediateOrCancel) {
    return AuxOrderType.IMMEDIATE_OR_CANCEL_ORDER;
  } else if (orderType === OrderType.PostOnly) {
    return AuxOrderType.POST_ONLY_ORDER;
  } else if (orderType === OrderType.PassiveJoin) {
    return AuxOrderType.PASSIVE_JOIN_ORDER;
  } else {
    throw new Error("Unhandled order type");
  }
}
