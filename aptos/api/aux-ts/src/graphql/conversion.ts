import type { OrderFillEvent, OrderPlacedEvent } from "../clob/core/events";
import type { Order as SdkOrder } from "../clob/core/query";
import {
  CoinInfo,
  Order as GqlOrder,
  OrderStatus,
  OrderType,
  Side,
} from "./generated/types";

export function orderToOrder(
  order: SdkOrder,
  baseCoinInfo: CoinInfo,
  quoteCoinInfo: CoinInfo
): GqlOrder {
  const price = order.price.toDecimalUnits(quoteCoinInfo.decimals).toNumber();
  const quantity = order.quantity
    .toDecimalUnits(baseCoinInfo.decimals)
    .toNumber();
  return {
    baseCoinType: baseCoinInfo.coinType,
    quoteCoinType: quoteCoinInfo.coinType,
    orderId: order.id.toString(),
    owner: order.ownerId.toString(),
    orderType: OrderType.Limit,
    orderStatus: OrderStatus.Open,
    side: order.side === "bid" ? Side.Buy : Side.Sell,
    auxBurned: 0,
    time: order.timestamp.divn(1000).toString(), // microseconds => milliseconds
    price,
    quantity,
    value: price * quantity,
  };
}

export function orderPlacedEventToOrder(
  orderEvent: OrderPlacedEvent,
  baseCoinInfo: CoinInfo,
  quoteCoinInfo: CoinInfo
): GqlOrder {
  const price = orderEvent.price
    .toDecimalUnits(quoteCoinInfo.decimals)
    .toNumber();
  const quantity = orderEvent.quantity
    .toDecimalUnits(baseCoinInfo.decimals)
    .toNumber();
  return {
    baseCoinType: baseCoinInfo.coinType,
    quoteCoinType: quoteCoinInfo.coinType,
    orderId: orderEvent.orderId.toString(),
    owner: orderEvent.owner.toString(),
    orderType: OrderType.Limit,
    orderStatus: OrderStatus.Open,
    side: orderEvent.isBid ? Side.Buy : Side.Sell,
    auxBurned: 0,
    time: orderEvent.timestamp.divn(1000).toString(),
    price: orderEvent.price.toDecimalUnits(quoteCoinInfo.decimals).toNumber(),
    quantity,
    value: price * quantity,
  };
}

export function orderFillEventToOrder(
  orderEvent: OrderFillEvent,
  baseCoinInfo: CoinInfo,
  quoteCoinInfo: CoinInfo
): GqlOrder {
  const price = orderEvent.price
    .toDecimalUnits(quoteCoinInfo.decimals)
    .toNumber();
  const quantity = orderEvent.baseQuantity
    .toDecimalUnits(baseCoinInfo.decimals)
    .toNumber();
  return {
    baseCoinType: baseCoinInfo.coinType,
    quoteCoinType: quoteCoinInfo.coinType,
    orderId: orderEvent.orderId.toString(),
    owner: orderEvent.owner.toString(),
    orderType: OrderType.Limit,
    orderStatus: OrderStatus.Open,
    side: orderEvent.isBid ? Side.Buy : Side.Sell,
    auxBurned: 0,
    time: orderEvent.timestamp.divn(1000).toString(),
    price: orderEvent.price.toDecimalUnits(quoteCoinInfo.decimals).toNumber(),
    quantity,
    value: price * quantity,
  };
}
