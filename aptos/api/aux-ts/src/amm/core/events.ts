import type { HexString, Types } from "aptos";
import type BN from "bn.js";
import type { AtomicUnits } from "../../units";

export interface RawSwapEvent {
  sequence_number: string;
  type: string;
  data: {
    timestamp: Types.U128;
    sender_addr: Types.Address;
    in_coin_type: Types.MoveStructTag;
    out_coin_type: Types.MoveStructTag;
    in_au: Types.U64;
    out_au: Types.U64;
    in_reserve: Types.U64;
    out_reserve: Types.U64;
    fee_bps: Types.U64;
  };
}

export interface RawAddLiquidityEvent {
  sequence_number: string;
  type: string;
  data: {
    timestamp: Types.U128;
    x_coin_type: Types.MoveStructTag;
    y_coin_type: Types.MoveStructTag;
    x_added_au: Types.U64;
    y_added_au: Types.U64;
    lp_minted_au: Types.U64;
  };
}

export interface RawRemoveLiquidityEvent {
  sequence_number: string;
  type: string;
  data: {
    timestamp: Types.U128;
    x_coin_type: Types.MoveStructTag;
    y_coin_type: Types.MoveStructTag;
    x_removed_au: Types.U64;
    y_removed_au: Types.U64;
    lp_burned_au: Types.U64;
  };
}

export interface SwapEvent {
  type: "SwapEvent";
  senderAddr: HexString;
  sequenceNumber: BN;
  timestamp: BN;
  inCoinType: Types.MoveStructTag;
  outCoinType: Types.MoveStructTag;
  inReserve: AtomicUnits;
  outReserve: AtomicUnits;
  in: AtomicUnits;
  out: AtomicUnits;
  feeBps: number;
}

export interface AddLiquidityEvent {
  type: "AddLiquidity";
  sequenceNumber: BN;
  timestamp: BN;
  xCoinType: Types.MoveStructTag;
  yCoinType: Types.MoveStructTag;
  xAdded: AtomicUnits;
  yAdded: AtomicUnits;
  lpMinted: AtomicUnits;
}

export interface RemoveLiquidityEvent {
  type: "RemoveLiquidity";
  sequenceNumber: BN;
  timestamp: BN;
  xCoinType: Types.MoveStructTag;
  yCoinType: Types.MoveStructTag;
  xRemoved: AtomicUnits;
  yRemoved: AtomicUnits;
  lpBurned: AtomicUnits;
}
