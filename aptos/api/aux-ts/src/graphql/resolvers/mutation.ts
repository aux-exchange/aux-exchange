// TODO GraphQL currently uses a hack where it simulates a tx, and then extracts the tx payload.
//
// Note the `simulate` is unnecesssary: the payload is already known before simulate.
//
// The TODO is to refactor the API to support a "builder" interface (but it is somewhat tricky to
// do this cleanly)

import _ from "lodash";
import * as aux from "../../";
import { ConstantProductClient } from "../../pool/constant-product/client";
import { OrderType as AuxOrderType } from "../../clob/core/mutation";
import { DU, Pct } from "../../units";
import { auxClient } from "../client";
import {
  ModifyStakeInput,
  MutationAddLiquidityArgs,
  MutationCancelOrderArgs,
  MutationClaimStakingRewardArgs,
  MutationCreateMarketArgs,
  MutationCreatePoolArgs,
  MutationCreateStakePoolArgs,
  MutationDeleteEmptyStakePoolArgs,
  MutationDepositArgs,
  MutationDepositStakeArgs,
  MutationEndStakePoolEarlyArgs,
  MutationModifyStakePoolArgs,
  MutationModifyStakePoolAuthorityArgs,
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
import BN from "bn.js";
import { createPoolPayload } from "../../pool/constant-product/schema";
import type { Types } from "aptos";
import {
  claimPayload,
  createStakePoolPayload,
  deleteEmptyPoolPayload,
  depositPayload as depositStakePayload,
  endRewardEarlyPayload,
  modifyAuthorityPayload,
  modifyPoolPayload,
  withdrawPayload as withdrawStakePayload,
} from "../../stake/schema";

export const mutation = {
  registerCoin(_parent: any, { registerCoinInput }: MutationRegisterCoinArgs) {
    return {
      function: `0x1::managed_coin::register`,
      type_arguments: [registerCoinInput.coinType],
      arguments: [],
    };
  },

  async createPool(
    _parent: any,
    { createPoolInput: { poolInput, feeBasisPoints } }: MutationCreatePoolArgs
  ): Promise<Types.EntryFunctionPayload> {
    const coinTypeX = poolInput.coinTypes[0]!;
    const coinTypeY = poolInput.coinTypes[1]!;
    return createPoolPayload(auxClient.moduleAddress, {
      coinTypeX,
      coinTypeY,
      feeBps: feeBasisPoints,
    });
  },

  async swapExactIn(
    _parent: any,
    {
      swapExactInInput: {
        coinTypeIn,
        amountIn,
        poolInput: { coinTypes },
        slippagePct,
      },
    }: MutationSwapExactInArgs
  ): Promise<Types.EntryFunctionPayload> {
    const coinTypeX = coinTypes[0]!;
    const coinTypeY = coinTypes[1]!;
    const poolClient = await new ConstantProductClient(auxClient, {
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
    return tx.transaction.payload as Types.EntryFunctionPayload;
  },

  async swapExactOut(
    _parent: any,
    {
      swapExactOutInput: {
        coinTypeOut,
        amountOut,
        poolInput: { coinTypes },
        slippagePct,
      },
    }: MutationSwapExactOutArgs
  ): Promise<Types.EntryFunctionPayload> {
    const coinTypeX = coinTypes[0]!;
    const coinTypeY = coinTypes[1]!;
    const poolClient = await new ConstantProductClient(auxClient, {
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
    return tx.transaction.payload as Types.EntryFunctionPayload;
  },

  async addLiquidity(
    _parent: any,
    {
      addLiquidityInput: {
        poolInput: { coinTypes },
        amounts,
        useAuxAccount,
      },
    }: MutationAddLiquidityArgs
  ): Promise<Types.EntryFunctionPayload> {
    const coinTypeX = coinTypes[0]!;
    const coinTypeY = coinTypes[1]!;
    const poolClient = await new ConstantProductClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    const amountX = amounts[0]!;
    const amountY = amounts[1]!;
    useAuxAccount = useAuxAccount ?? false;
    const tx = await poolClient.addLiquidity(
      {
        amountX: DU(amountX),
        amountY: DU(amountY),
        useAuxAccount,
      },
      {
        simulate: true,
      }
    );
    return tx.transaction.payload as Types.EntryFunctionPayload;
  },

  async removeLiquidity(
    _parent: any,
    {
      removeLiquidityInput: {
        poolInput: { coinTypes },
        amountLP,
        useAuxAccount,
      },
    }: MutationRemoveLiquidityArgs
  ) {
    const coinTypeX = coinTypes[0]!;
    const coinTypeY = coinTypes[1]!;
    const poolClient = await new ConstantProductClient(auxClient, {
      coinTypeX,
      coinTypeY,
    }).transpose();
    useAuxAccount = useAuxAccount ?? false;
    const tx = await poolClient.removeLiquidity(
      { amountLP: DU(amountLP), useAuxAccount },
      { simulate: true }
    );
    return tx.transaction.payload as Types.EntryFunctionPayload;
  },

  async createMarket(
    _parent: any,
    { createMarketInput }: MutationCreateMarketArgs
  ): Promise<Types.EntryFunctionPayload> {
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

  async placeOrder(
    _parent: any,
    { placeOrderInput }: MutationPlaceOrderArgs
  ): Promise<Types.EntryFunctionPayload> {
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

  cancelOrder(
    _parent: any,
    { cancelOrderInput }: MutationCancelOrderArgs
  ): Types.EntryFunctionPayload {
    const { baseCoinType, quoteCoinType } = cancelOrderInput.marketInput;
    return aux.clob.core.mutation.cancelOrderPayload(auxClient, {
      // @ts-ignore
      sender: { address: () => cancelOrderInput.sender },
      baseCoinType,
      quoteCoinType,
      orderId: cancelOrderInput.orderId,
    });
  },

  createAuxAccount(): Types.EntryFunctionPayload {
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

  async withdraw(
    _parent: any,
    { withdrawInput }: MutationWithdrawArgs
  ): Promise<Types.EntryFunctionPayload> {
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

  async transfer(
    _parent: any,
    { transferInput }: MutationTransferArgs
  ): Promise<Types.EntryFunctionPayload> {
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

  async createStakePool(
    _parent: any,
    {
      createStakePoolInput: {
        stakePoolInput: { coinTypeStake, coinTypeReward },
        rewardAmount,
        durationUs,
      },
    }: MutationCreateStakePoolArgs
  ): Promise<Types.EntryFunctionPayload> {
    let coinInfoReward = await auxClient.getCoinInfo(coinTypeReward);
    return createStakePoolPayload(auxClient.moduleAddress, {
      coinTypeStake,
      coinTypeReward,
      rewardAmount: DU(rewardAmount)
        .toAtomicUnits(coinInfoReward.decimals)
        .toU64(),
      durationUs: durationUs.toString(),
    });
  },

  async depositStake(
    _parent: any,
    {
      depositStakeInput: {
        amount,
        stakePoolInput: { coinTypeReward, coinTypeStake },
      },
    }: MutationDepositStakeArgs
  ): Promise<Types.EntryFunctionPayload> {
    let coinInfoStake = await auxClient.getCoinInfo(coinTypeStake);
    return depositStakePayload(auxClient.moduleAddress, {
      coinTypeStake,
      coinTypeReward,
      amount: DU(amount).toAtomicUnits(coinInfoStake.decimals).toU64(),
    });
  },

  async withdrawStake(
    _parent: any,
    {
      amount,
      stakePoolInput: { coinTypeReward, coinTypeStake },
    }: ModifyStakeInput
  ): Promise<Types.EntryFunctionPayload> {
    let coinInfoStake = await auxClient.getCoinInfo(coinTypeStake);
    return withdrawStakePayload(auxClient.moduleAddress, {
      coinTypeStake,
      coinTypeReward,
      amount: DU(amount).toAtomicUnits(coinInfoStake.decimals).toU64(),
    });
  },
  async claimStakingReward(
    _parent: any,
    {
      stakePoolInput: { coinTypeReward, coinTypeStake },
    }: MutationClaimStakingRewardArgs
  ): Promise<Types.EntryFunctionPayload> {
    return claimPayload(auxClient.moduleAddress, {
      coinTypeReward,
      coinTypeStake,
    });
  },

  async modifyStakePool(
    _parent: any,
    {
      modifyStakePoolInput: {
        stakePoolInput: { coinTypeReward, coinTypeStake },
        rewardAmount,
        rewardIncrease,
        timeAmountUs,
        timeIncrease,
      },
    }: MutationModifyStakePoolArgs
  ): Promise<Types.EntryFunctionPayload> {
    let coinInfoReward = await auxClient.getCoinInfo(coinTypeReward);
    return modifyPoolPayload(auxClient.moduleAddress, {
      coinTypeStake,
      coinTypeReward,
      rewardAmount: rewardAmount
        ? DU(rewardAmount).toAtomicUnits(coinInfoReward.decimals).toU64()
        : "0",
      rewardIncrease: rewardIncrease ? rewardIncrease : false,
      timeAmountUs: timeAmountUs ? new BN(timeAmountUs).toString() : "0",
      timeIncrease: timeIncrease ? timeIncrease : false,
    });
  },

  async modifyStakePoolAuthority(
    _parent: any,
    {
      input: {
        stakePoolInput: { coinTypeReward, coinTypeStake },
        newAuthority,
      },
    }: MutationModifyStakePoolAuthorityArgs
  ): Promise<Types.EntryFunctionPayload> {
    return modifyAuthorityPayload(auxClient.moduleAddress, {
      coinTypeReward,
      coinTypeStake,
      newAuthority,
    });
  },

  async deleteEmptyStakePool(
    _parent: any,
    { stakePoolInput }: MutationDeleteEmptyStakePoolArgs
  ): Promise<Types.EntryFunctionPayload> {
    return deleteEmptyPoolPayload(auxClient.moduleAddress, stakePoolInput);
  },

  async endStakePoolEarly(
    _parent: any,
    { stakePoolInput }: MutationEndStakePoolEarlyArgs
  ): Promise<Types.EntryFunctionPayload> {
    return endRewardEarlyPayload(auxClient.moduleAddress, stakePoolInput);
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
