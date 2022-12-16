import { HexString, Types } from "aptos";
import BN from "bn.js";
import { AtomicUnits, AU } from "../units";

/*****************/
/* Event schemas */
/*****************/

export interface RelayEvent {
  kind: "RedeemVaaEvent" | "WithdrawEscrow";
  type: Types.MoveStructTag;
  sequenceNumber: BN;
  timestamp: BN;
}

export interface RedeemVaaEvent extends RelayEvent {
  kind: "RedeemVaaEvent";
  version: string;
  relayer: HexString;
  coinType: Types.MoveStructTag;
  recipient: HexString;
  totalCoin: AtomicUnits;
  feeCoin: AtomicUnits;
  requestedAptAmount: AtomicUnits;
  swappedAptAmount: AtomicUnits;
  escrowed: boolean;
}

export interface WithdrawEscrowEvent extends RelayEvent {
  kind: "WithdrawEscrow";
  version: string;
  coinType: Types.MoveStructTag;
  recipient: HexString;
  amount: AtomicUnits;
}

export interface RawRelayEvent extends Types.Event {
  kind: "RawRedeemVaaEvent" | "RawWithdrawEscrow";
}

export interface RawRedeemVaaEvent extends RawRelayEvent {
  kind: "RawRedeemVaaEvent";
  version: string;
  data: {
    timestamp: Types.U128;
    relayer: Types.Address;
    coin_type: Types.MoveStructTag;
    recipient: Types.Address;
    total_coin: Types.U64;
    fee_coin: Types.U64;
    requested_apt_amount: Types.U64;
    swapped_apt_amount: Types.U64;
    escrowed: boolean;
  } 
}

export interface RawWithdrawEscrowEvent extends RawRelayEvent {
  kind: "RawWithdrawEscrow";
  version: string;
  data: {
    timestamp: Types.U128;
    coin_type: Types.MoveStructTag;
    recipient: Types.Address;
    amount: Types.U64;
  }
}

export function parseRawRedeemVaaEvent(
  event: RawRedeemVaaEvent
): RedeemVaaEvent {
  return {
    kind: "RedeemVaaEvent",
    version: event.version,
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp),
    relayer: new HexString(event.data.relayer),
    coinType: event.data.coin_type,
    recipient: new HexString(event.data.recipient),
    totalCoin: AU(event.data.total_coin),
    feeCoin: AU(event.data.fee_coin),
    requestedAptAmount: AU(event.data.requested_apt_amount),
    swappedAptAmount: AU(event.data.swapped_apt_amount),
    escrowed: event.data.escrowed
  }
}

export function parseRawWithdrawEscrowEvent(
  event: RawWithdrawEscrowEvent
): WithdrawEscrowEvent {
  return {
    kind: "WithdrawEscrow",
    version: event.version,
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp),
    coinType: event.data.coin_type,
    recipient: new HexString(event.data.recipient),
    amount: AU(event.data.amount)
  }
}

/*************************/
/* Input schemas (Relay) */
/*************************/

export interface RedeemVaaInput {
  vaaBytes: Uint8Array;
}

export interface WithdrawEscrowInput {
  coinType: Types.MoveStructTag;
}

/********************************/
/* EntryFunctionPayload schemas */
/********************************/

export function redeemVaaPayload(
  moduleAddress: Types.Address,
  input: RedeemVaaPayloadInput
): Types.EntryFunctionPayload {
  const aptosFunction = (input.escrowed ? "redeem_vaa_with_escrow" : "redeem_vaa");
  return {
    function: `${moduleAddress}::redeem_with_native_swap::${aptosFunction}`,
    type_arguments: [input.coinType],
    arguments: [input.vaaBytes, input.minOut],
  }
}

export function withdrawEscrowPayload(
  moduleAddress: Types.Address,
  input: WithdrawEscrowPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::redeem_with_native_swap::withdraw_from_escrow`,
    type_arguments: [input.coinType],
    arguments: []
  }
}

/****************************************/
/* Input schemas (EntryFunctionPayload) */
/****************************************/

export interface RedeemVaaPayloadInput {
  coinType: Types.MoveStructTag;
  vaaBytes: Uint8Array;
  minOut: Types.U64;
  escrowed: boolean;
}

export interface WithdrawEscrowPayloadInput {
  coinType: Types.MoveStructTag;
}

