import { HexString, Types } from "aptos";
import BN from "bn.js";
import _ from "lodash";
import { AuxClient, CoinInfo, parseTypeArgs, Simulator } from "../../client";
import { AtomicUnits, AU, DecimalUnits } from "../../units";
import {
  OrderCancelEvent,
  OrderFillEvent,
  OrderPlacedEvent,
  parseRawOrderCancelEvents,
  parseRawOrderFillEvents,
  parseRawOrderPlacedEvents,
  RawOrderCancelEvent,
  RawOrderFillEvent,
  RawOrderPlacedEvent,
} from "./events";
import type { OrderType } from "./mutation";

export interface Level {
  price: AtomicUnits;
  orders: Order[];
}

export interface L2Quote {
  price: DecimalUnits;
  quantity: DecimalUnits;
}

export type Side = "bid" | "ask";

export interface Order {
  id: BN;
  clientId: BN;
  side: Side;
  auxBurned: AtomicUnits;
  timestamp: BN;
  price: AtomicUnits;
  quantity: AtomicUnits;
  ownerId: HexString;
  orderType: OrderType;
}

interface RawOrder {
  id: Types.U128;
  client_order_id: Types.U128;
  price: Types.U64;
  quantity: Types.U64;
  aux_au_to_burn_per_lot: Types.U64;
  is_bid: boolean;
  owner_id: Types.Address;
  order_type: Types.U64;
  timestamp: Types.U64;
}

interface RawOpenOrdersEvent {
  sequence_number: string;
  type: string;
  data: {
    open_orders: RawOrder[];
  };
}

interface RawAllOrdersEvent {
  sequence_number: string;
  type: string;
  data: {
    bids: RawOrder[][];
    asks: RawOrder[][];
  };
}

interface TreeEntry<T> {
  key: Types.U128;
  value: T;
  parent?: Types.U64;
  left_child?: Types.U64;
  right_child?: Types.U64;
}

interface CritbitTree<T> {
  entries: TreeEntry<T>[];
  min_index: Types.U64;
  max_index: Types.U64;
}

interface RawSideLevel {
  price: Types.U64; // Price
  total_quantity: Types.U128;
  orders: CritbitTree<RawOrder>;
}

interface RawMarket {
  data: {
    bids: CritbitTree<RawSideLevel>;
    asks: CritbitTree<RawSideLevel>;
    next_order_id: Types.U64;
    base_decimals: number; // u8
    quote_decimals: number; // u8
    lot_size: Types.U64;
    tick_size: Types.U64;
  };
}

export interface L2 {
  bids: L2Quote[];
  asks: L2Quote[];
}

export interface Market {
  baseDecimals: number;
  quoteDecimals: number;
  lotSize: AtomicUnits;
  tickSize: AtomicUnits;
  nextOrderId: BN;
  type: Types.MoveStructTag;
  baseCoinInfo: CoinInfo;
  quoteCoinInfo: CoinInfo;
  l2: L2;
}

export async function orderFillEvents(
  auxClient: AuxClient,
  clobAddress: Types.Address,
  market: Market,
  pagination?: { start: BN } | { limit: BN }
): Promise<OrderFillEvent[]> {
  pagination = pagination ?? { limit: new BN(100) };
  const queryFunction =
    "start" in pagination
      ? auxClient.getEventsByEventHandleSince.bind(auxClient)
      : auxClient.getEventsByEventHandleWithLookback.bind(auxClient);
  const queryValue =
    "start" in pagination ? pagination.start : pagination.limit;
  const fillEvents: RawOrderFillEvent[] = await queryFunction(
    clobAddress,
    market.type,
    "fill_events",
    queryValue
  );
  return parseRawOrderFillEvents(fillEvents);
}

export async function orderPlacedEvents(
  auxClient: AuxClient,
  clobAddress: Types.Address,
  market: Market,
  pagination?: { start: BN } | { limit: BN }
): Promise<OrderPlacedEvent[]> {
  pagination = pagination ?? { limit: new BN(100) };
  const queryFunction =
    "start" in pagination
      ? auxClient.getEventsByEventHandleSince.bind(auxClient)
      : auxClient.getEventsByEventHandleWithLookback.bind(auxClient);
  const queryValue =
    "start" in pagination ? pagination.start : pagination.limit;
  const placedEvents: RawOrderPlacedEvent[] = await queryFunction(
    clobAddress,
    market.type,
    "placed_events",
    queryValue
  );
  return parseRawOrderPlacedEvents(placedEvents);
}

export async function orderCancelEvents(
  auxClient: AuxClient,
  clobAddress: Types.Address,
  market: Market,
  pagination?: { start: BN } | { limit: BN }
): Promise<OrderCancelEvent[]> {
  pagination = pagination ?? { limit: new BN(100) };
  const queryFunction =
    "start" in pagination
      ? auxClient.getEventsByEventHandleSince.bind(auxClient)
      : auxClient.getEventsByEventHandleWithLookback.bind(auxClient);
  const queryValue =
    "start" in pagination ? pagination.start : pagination.limit;
  const cancelEvents: RawOrderCancelEvent[] = await queryFunction(
    clobAddress,
    market.type,
    "cancel_events",
    queryValue
  );
  return parseRawOrderCancelEvents(cancelEvents);
}

function auxTimePriority(lhs: Order, rhs: Order): number {
  if (lhs.auxBurned.toBN().gt(rhs.auxBurned.toBN())) {
    return -1;
  }
  if (lhs.auxBurned.toBN().lt(rhs.auxBurned.toBN())) {
    return 1;
  }
  if (lhs.timestamp.lt(rhs.timestamp)) {
    return -1;
  }
  if (lhs.timestamp.gt(rhs.timestamp)) {
    return 1;
  }
  return 0;
}

export function parseRawSideLevel(level: RawSideLevel, side: Side): Level {
  const price = level.price;
  const orders = level.orders.entries.map(
    ({ value: order }: TreeEntry<RawOrder>) => {
      const auxBurned = order.aux_au_to_burn_per_lot;
      const time = order.timestamp;
      return {
        id: new BN(order.id),
        side,
        auxBurned: new AtomicUnits(auxBurned),
        timestamp: new BN(time),
        price: AU(order.price),
        quantity: AU(order.quantity),
        ownerId: new HexString(order.owner_id),
        clientId: new BN(order.client_order_id),
        orderType: Number(order.order_type),
      };
    }
  );
  orders.sort(auxTimePriority);
  return {
    price: new AtomicUnits(price),
    orders: orders,
  };
}

export function levelSorter(
  ascending: boolean
): (lhs: Level, rhs: Level) => number {
  const num = ascending ? 1 : -1;
  return (lhs: Level, rhs: Level) => {
    if (lhs.price.toBN().lt(rhs.price.toBN())) {
      return -num;
    }
    if (lhs.price.toBN().gt(rhs.price.toBN())) {
      return num;
    }
    return 0;
  };
}

export async function market(
  auxClient: AuxClient,
  baseCoinType: Types.MoveStructTag,
  quoteCoinType: Types.MoveStructTag
): Promise<Market> {
  const type = `${auxClient.moduleAddress}::clob_market::Market<${baseCoinType}, ${quoteCoinType}>`;
  const [resource, baseCoinInfo, quoteCoinInfo] = await Promise.all([
    auxClient.aptosClient.getAccountResource(auxClient.moduleAddress, type),
    auxClient.getCoinInfo(baseCoinType),
    auxClient.getCoinInfo(quoteCoinType),
  ]);
  const rawMarket = resource as any as RawMarket;

  const tickSize = new AtomicUnits(rawMarket.data.tick_size);
  const payload = {
    function: `${auxClient.moduleAddress}::clob_market::load_market_into_event`,
    type_arguments: [baseCoinType, quoteCoinType],
    arguments: [],
  };
  const txResult = await auxClient.simulateTransaction(payload);

  const l2 = txResult.events[0];
  const bids: L2Quote[] = (l2?.data.bids ?? []).map((bid: any) => ({
    price: AU(bid.price).toDecimalUnits(quoteCoinInfo.decimals),
    quantity: AU(bid.quantity).toDecimalUnits(baseCoinInfo.decimals),
  }));
  const asks: L2Quote[] = (l2?.data.asks ?? []).map((ask: any) => ({
    price: AU(ask.price).toDecimalUnits(quoteCoinInfo.decimals),
    quantity: AU(ask.quantity).toDecimalUnits(baseCoinInfo.decimals),
  }));

  return {
    type,
    baseCoinInfo,
    quoteCoinInfo,
    nextOrderId: new BN(rawMarket.data.next_order_id),
    baseDecimals: rawMarket.data.base_decimals,
    quoteDecimals: rawMarket.data.quote_decimals,
    lotSize: new AtomicUnits(rawMarket.data.lot_size),
    tickSize,
    l2: {
      bids,
      asks,
    },
  };
}

export async function orderbook(
  auxClient: AuxClient,
  baseCoinType: Types.MoveStructTag,
  quoteCoinType: Types.MoveStructTag,
  simulator?: Simulator
): Promise<{ bids: Level[]; asks: Level[] }> {
  const payload = {
    function: `${auxClient.moduleAddress}::clob_market::load_all_orders_into_event`,
    type_arguments: [baseCoinType, quoteCoinType],
    arguments: [],
  };
  const txResult = await auxClient.simulateTransaction(payload, simulator);
  const event: RawAllOrdersEvent = txResult.events[0]! as RawAllOrdersEvent;
  const bids: Level[] = event.data.bids.map((level) => {
    return {
      price: AU(level[0]!.price!),
      orders: level.map((order) => {
        const auxBurned = order.aux_au_to_burn_per_lot;
        const time = order.timestamp;
        return {
          id: new BN(order.id),
          side: order.is_bid ? "bid" : "ask",
          auxBurned: new AtomicUnits(auxBurned),
          timestamp: new BN(time),
          price: AU(order.price),
          quantity: AU(order.quantity),
          ownerId: new HexString(order.owner_id),
          clientId: new BN(order.client_order_id),
          orderType: Number(order.order_type),
        };
      }),
    };
  });
  const asks: Level[] = event.data.asks.map((level) => {
    return {
      price: AU(level[0]!.price!),
      orders: level.map((order) => {
        const auxBurned = order.aux_au_to_burn_per_lot;
        const time = order.timestamp;
        return {
          id: new BN(order.id),
          side: order.is_bid ? "bid" : "ask",
          auxBurned: new AtomicUnits(auxBurned),
          timestamp: new BN(time),
          price: AU(order.price),
          quantity: AU(order.quantity),
          ownerId: new HexString(order.owner_id),
          clientId: new BN(order.client_order_id),
          orderType: Number(order.order_type),
        };
      }),
    };
  });

  return { bids, asks };
}

export async function openOrders(
  auxClient: AuxClient,
  owner: Types.Address,
  baseCoinType: Types.MoveStructTag,
  quoteCoinType: Types.MoveStructTag,
  simulator?: Simulator
): Promise<Order[]> {
  auxClient;
  owner;
  baseCoinType;
  quoteCoinType;
  const payload = {
    function: `${auxClient.moduleAddress}::clob_market::load_open_orders_into_event_for_address`,
    type_arguments: [baseCoinType, quoteCoinType],
    arguments: [owner],
  };
  simulator = simulator ?? auxClient.simulator;
  const txResult = await auxClient.simulateTransaction(payload, simulator);
  const event: RawOpenOrdersEvent = txResult.events[0]! as RawOpenOrdersEvent;
  if (_.isUndefined(event)) {
    return [];
  }
  return event.data.open_orders.map((order) => {
    const auxBurned = order.aux_au_to_burn_per_lot;
    const time = order.timestamp;
    return {
      id: new BN(order.id),
      side: order.is_bid ? "bid" : "ask",
      auxBurned: new AtomicUnits(auxBurned),
      timestamp: new BN(time),
      price: AU(order.price),
      quantity: AU(order.quantity),
      ownerId: new HexString(order.owner_id),
      clientId: new BN(order.client_order_id),
      orderType: Number(order.order_type),
    };
  });
}

export async function orderHistory(
  auxClient: AuxClient,
  baseCoinType: Types.MoveStructTag,
  quoteCoinType: Types.MoveStructTag,
  owner: Types.Address | undefined,
  pagination?: { start: BN } | { limit: BN }
): Promise<
  { order: OrderPlacedEvent; status: "open" | "canceled" | "filled" }[]
> {
  const market_ = await market(auxClient, baseCoinType, quoteCoinType);
  const orders = await orderPlacedEvents(
    auxClient,
    auxClient.moduleAddress,
    market_,
    pagination
  );
  const fills = await orderFillEvents(
    auxClient,
    auxClient.moduleAddress,
    market_,
    pagination
  );
  const fillIds = new Set(fills.map((order) => order.orderId.toString()));
  const cancels = await orderCancelEvents(
    auxClient,
    auxClient.moduleAddress,
    market_,
    pagination
  );
  const cancelIds = new Set(cancels.map((order) => order.orderId.toString()));
  const orderEvents: {
    order: OrderPlacedEvent;
    status: "open" | "canceled" | "filled";
  }[] = orders.map((order) => {
    const orderId = order.orderId.toString();
    if (fillIds.has(orderId)) {
      return { order, status: "filled" };
    } else if (cancelIds.has(orderId)) {
      return { order, status: "canceled" };
    } else {
      return { order, status: "open" };
    }
  });
  if (_.isUndefined(owner)) {
    return orderEvents;
  }
  return orderEvents.filter((order) => order.order.owner.hex() === owner);
}

export async function fillHistory(
  auxClient: AuxClient,
  baseCoinType: Types.MoveStructTag,
  quoteCoinType: Types.MoveStructTag,
  owner: Types.Address | undefined,
  pagination?: { start: BN } | { limit: BN }
): Promise<OrderFillEvent[]> {
  const fills = await orderFillEvents(
    auxClient,
    auxClient.moduleAddress,
    await market(auxClient, baseCoinType, quoteCoinType),
    pagination
  );
  if (_.isUndefined(owner)) {
    // return all events for the market
    return fills;
  }
  return fills.filter((orderFillEvent) => orderFillEvent.owner.hex() === owner);
}

export async function markets(
  auxClient: AuxClient
): Promise<
  { marketType: string; baseCoinType: string; quoteCoinType: string }[]
> {
  const resources = await auxClient.aptosClient.getAccountResources(
    auxClient.moduleAddress
  );
  return resources
    .filter((resource) => resource.type.includes("Market<"))
    .map((resource) => resource.type)
    .map(parseMarketType);
}

export function parseMarketType(marketType: Types.MoveStructTag): {
  marketType: string;
  baseCoinType: string;
  quoteCoinType: string;
} {
  const [baseCoinType, quoteCoinType] = parseTypeArgs(marketType);
  if (baseCoinType === undefined || quoteCoinType === undefined) {
    throw new Error(`Failed to parse marketType ${marketType}`);
  }
  return { marketType, baseCoinType, quoteCoinType };
}
