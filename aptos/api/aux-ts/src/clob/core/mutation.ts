import type { AptosAccount, Types } from "aptos";
import { MAX_U64 } from "../../units";
import type { AuxClient, AuxClientOptions } from "../../client";
import type { AuxTransaction } from "../../client";
import { parseRawEventsFromTx, PlaceOrderEvent } from "./events";
import type { Market } from "./query";

export enum OrderType {
  LIMIT_ORDER = 100,
  FILL_OR_KILL_ORDER = 101,
  IMMEDIATE_OR_CANCEL_ORDER = 102,
  POST_ONLY_ORDER = 103,
  PASSIVE_JOIN_ORDER = 104,
}

export enum STPActionType {
  CANCEL_PASSIVE = 200,
  CANCEL_AGGRESSIVE = 201,
  CANCEL_BOTH = 202,
}

export interface CreateMarketInput {
  sender: AptosAccount;
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  baseLotSize: Types.U64;
  quoteLotSize: Types.U64;
}

export interface PlaceOrderInput {
  sender: AptosAccount;
  market: Market;
  delegator?: Types.Address;
  isBid: boolean;
  limitPriceAu: Types.U64;
  quantityAu: Types.U64;
  auxToBurnAu: Types.U64;
  clientOrderId: Types.U128;
  orderType: OrderType;
  ticksToSlide?: Types.U64;
  directionAggressive?: boolean;
  timeoutTimestamp?: Types.U64;
  stpActionType?: STPActionType;
}

export interface CancelOrderInput {
  sender: AptosAccount;
  delegator?: Types.Address;
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  orderId: Types.U64;
}

export interface CancelAllInput {
  sender: AptosAccount;
  delegator?: Types.Address;
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
}

export async function createMarket(
  auxClient: AuxClient,
  createMarketInput: CreateMarketInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    createMarketPayload(auxClient, createMarketInput),
    { ...options, sender: createMarketInput.sender }
  );
}

export async function placeOrder(
  auxClient: AuxClient,
  placeOrderInput: PlaceOrderInput,
  options: Partial<AuxClientOptions> = {}
): Promise<AuxTransaction<PlaceOrderEvent[]>> {
  const tx = auxClient.sendOrSimulateTransaction(
    placeOrderPayload(auxClient, placeOrderInput),
    { ...options, sender: placeOrderInput.sender }
  );
  return tx.then((tx) => {
    return {
      transaction: tx,
      result: parseRawEventsFromTx(auxClient, tx),
    };
  });
}

export async function cancelOrder(
  auxClient: AuxClient,
  cancelOrderInput: CancelOrderInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    cancelOrderPayload(auxClient, cancelOrderInput),
    { ...options, sender: cancelOrderInput.sender }
  );
}

export async function cancelAll(
  auxClient: AuxClient,
  cancelAllInput: CancelAllInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    cancelAllPayload(auxClient, cancelAllInput),
    { ...options, sender: cancelAllInput.sender }
  );
}

export function createMarketPayload(
  auxClient: AuxClient,
  createMarketInput: CreateMarketInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::clob_market::create_market`,
    type_arguments: [
      createMarketInput.baseCoinType,
      createMarketInput.quoteCoinType,
    ],
    arguments: [createMarketInput.baseLotSize, createMarketInput.quoteLotSize],
  };
}

export function placeOrderPayload(
  auxClient: AuxClient,
  placeOrderInput: PlaceOrderInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::clob_market::place_order`,
    type_arguments: [
      placeOrderInput.market.baseCoinInfo.coinType,
      placeOrderInput.market.quoteCoinInfo.coinType,
    ],
    arguments: [
      placeOrderInput.delegator !== undefined
        ? placeOrderInput.delegator
        : placeOrderInput.sender.address().toString(),
      placeOrderInput.isBid,
      placeOrderInput.limitPriceAu,
      placeOrderInput.quantityAu,
      placeOrderInput.auxToBurnAu,
      placeOrderInput.clientOrderId,
      placeOrderInput.orderType,
      placeOrderInput.ticksToSlide ? placeOrderInput.ticksToSlide : 0,
      placeOrderInput.directionAggressive !== undefined
        ? placeOrderInput.directionAggressive
        : false,
      placeOrderInput.timeoutTimestamp !== undefined
        ? placeOrderInput.timeoutTimestamp
        : MAX_U64,
      placeOrderInput.stpActionType !== undefined
        ? placeOrderInput.stpActionType
        : STPActionType.CANCEL_PASSIVE,
    ],
  };
}

export function cancelOrderPayload(
  auxClient: AuxClient,
  cancelOrderInput: CancelOrderInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::clob_market::cancel_order`,
    type_arguments: [
      cancelOrderInput.baseCoinType,
      cancelOrderInput.quoteCoinType,
    ],
    arguments: [
      cancelOrderInput.delegator !== undefined
        ? cancelOrderInput.delegator
        : cancelOrderInput.sender.address().toString(),
      cancelOrderInput.orderId,
    ],
  };
}

export function cancelAllPayload(
  auxClient: AuxClient,
  cancelAllInput: CancelAllInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::clob_market::cancel_all`,
    type_arguments: [cancelAllInput.baseCoinType, cancelAllInput.quoteCoinType],
    arguments: [
      cancelAllInput.delegator !== undefined
        ? cancelAllInput.delegator
        : cancelAllInput.sender.address().toString(),
    ],
  };
}
