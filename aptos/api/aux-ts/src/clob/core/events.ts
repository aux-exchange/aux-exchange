import { HexString, Types } from "aptos";
import BN from "bn.js";
import type { AuxClient } from "../../client";
import { AtomicUnits, AU } from "../../units";

// RawEvents are events directly fetched / returned from aptos js sdk
export interface RawOrderFillEvent {
  sequence_number: string;
  type: string;
  data: {
    order_id: Types.U128;
    client_order_id: Types.U128;
    is_bid: boolean;
    owner: Types.Address;
    base_qty: Types.U128;
    price: Types.U64;
    fee: Types.U64;
    rebate: Types.U64;
    remaining_qty: Types.U64;
    timestamp: Types.U64;
  };
}

export interface RawOrderCancelEvent {
  sequence_number: string;
  type: string;
  data: {
    order_id: Types.U128;
    client_order_id: Types.U128;
    owner: Types.Address;
    cancel_qty: Types.U64;
    timestamp: Types.U64;
    order_type: Types.U64;
  };
}

export interface RawOrderPlacedEvent {
  sequence_number: string;
  type: string;
  data: {
    order_id: Types.U128;
    client_order_id: Types.U128;
    owner: Types.Address;
    is_bid: boolean;
    qty: Types.U64;
    price: Types.U64;
    timestamp: Types.U64;
  };
}

// Non-raw events are what used by aux sdk
export interface OrderFillEvent {
  type: "OrderFillEvent";
  sequenceNumber: BN;
  orderId: BN;
  isBid: boolean;
  owner: HexString;
  baseQuantity: AtomicUnits;
  price: AtomicUnits;
  fee: AtomicUnits;
  rebate: AtomicUnits;
  feeCurrency: Types.MoveStructTag;
  remainingQuantity: AtomicUnits;
  timestamp: BN;
  clientOrderId: BN;
}

export interface OrderCancelEvent {
  type: "OrderCancelEvent";
  sequenceNumber: BN;
  orderId: BN;
  owner: HexString;
  cancelQuantity: AtomicUnits;
  timestamp: BN;
  clientOrderId: BN;
  orderType: BN;
}

export interface OrderPlacedEvent {
  type: "OrderPlacedEvent";
  sequenceNumber: BN;
  // The global order ID that can be used for cancels.
  orderId: BN;
  owner: HexString;
  isBid: boolean;
  quantity: AtomicUnits;
  price: AtomicUnits;
  timestamp: BN;
  clientOrderId: BN;
}

export interface UnknownEvent {
  type: "UnknownEvent";
  sequenceNumber: BN;
}

export type RawOrderEvent =
  | RawOrderFillEvent
  | RawOrderCancelEvent
  | RawOrderPlacedEvent
  | UnknownEvent;

export type PlaceOrderEvent =
  | OrderFillEvent
  | OrderCancelEvent
  | OrderPlacedEvent
  | UnknownEvent;

export function parseRawEventsFromTx(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): Array<PlaceOrderEvent> {
  return parseRawEvents(auxClient, tx.events);
}

function parseRawEvents(
  auxClient: AuxClient,
  rawEvent: RawOrderEvent[]
): Array<PlaceOrderEvent> {
  return rawEvent.map((event) => {
    switch (event.type) {
      case `${auxClient.moduleAddress}::clob_market::OrderFillEvent`: {
        return parseRawOrderFillEvent(event as RawOrderFillEvent);
      }
      case `${auxClient.moduleAddress}::clob_market::OrderCancelEvent`: {
        return parseRawOrderCancelEvent(event as RawOrderCancelEvent);
      }
      case `${auxClient.moduleAddress}::clob_market::OrderPlacedEvent`: {
        return parseRawOrderPlacedEvent(event as RawOrderPlacedEvent);
      }
      default:
        throw new Error(`Unknown event: ${event.type}`);
    }
  });
}

export function parseRawOrderFillEvents(
  events: RawOrderFillEvent[]
): OrderFillEvent[] {
  return events.map((event) => parseRawOrderFillEvent(event));
}

export function parseRawOrderCancelEvents(
  events: RawOrderCancelEvent[]
): OrderCancelEvent[] {
  return events.map((event) => parseRawOrderCancelEvent(event));
}
export function parseRawOrderPlacedEvents(
  events: RawOrderPlacedEvent[]
): OrderPlacedEvent[] {
  return events.map((event) => parseRawOrderPlacedEvent(event));
}

export function parseRawOrderFillEvent(raw: RawOrderFillEvent): OrderFillEvent {
  return {
    type: "OrderFillEvent",
    sequenceNumber: new BN.BN(raw.sequence_number),
    orderId: new BN(raw.data.order_id),
    isBid: raw.data.is_bid,
    owner: new HexString(raw.data.owner),
    baseQuantity: new AtomicUnits(raw.data.base_qty),
    price: new AtomicUnits(raw.data.price),
    fee: new AtomicUnits(raw.data.fee),
    rebate: new AtomicUnits(raw.data.rebate),
    feeCurrency: "undefined", // TODO
    remainingQuantity: new AtomicUnits(raw.data.remaining_qty),
    timestamp: new BN(raw.data.timestamp),
    clientOrderId: new BN(raw.data.client_order_id),
  };
}

function parseRawOrderCancelEvent(raw: RawOrderCancelEvent): OrderCancelEvent {
  return {
    type: "OrderCancelEvent",
    sequenceNumber: new BN(raw.sequence_number),
    orderId: new BN(raw.data.order_id),
    owner: new HexString(raw.data.owner),
    cancelQuantity: AU(raw.data.cancel_qty),
    timestamp: new BN(raw.data.timestamp),
    clientOrderId: new BN(raw.data.client_order_id),
    orderType: new BN(raw.data.order_type),
  };
}

function parseRawOrderPlacedEvent(raw: RawOrderPlacedEvent): OrderPlacedEvent {
  return {
    type: "OrderPlacedEvent",
    sequenceNumber: new BN(raw.sequence_number),
    orderId: new BN(raw.data.order_id),
    owner: new HexString(raw.data.owner),
    isBid: raw.data.is_bid,
    quantity: AU(raw.data.qty),
    price: AU(raw.data.price),
    timestamp: new BN(raw.data.timestamp),
    clientOrderId: new BN(raw.data.client_order_id),
  };
}
