import type { Types } from "aptos";
import BN from "bn.js";
import { CoinInfo, parseTypeArgs } from "../../client";
import { AnyUnits, AtomicUnits, AU, Bps, DecimalUnits } from "../../units";

/****************/
/* Pool schemas */
/****************/

export interface StableSwap {
  coinInfos: CoinInfo[];
  coinInfoLP: CoinInfo;
  amounts: DecimalUnits[];
  amountLP: DecimalUnits;
  fee: Bps;
  timestamp: BN;
}

export interface Position {
  owner: Types.Address;
  coinInfos: CoinInfo[];
  coinInfoLP: CoinInfo;
  amounts: DecimalUnits[];
  amountLP: DecimalUnits;
  share: number;
}

/**************************************************************/
/* Event schemas (the shape of pool data in an Aptos "event") */
/**************************************************************/

export interface PoolEvent {
  kind: "SwapEvent" | "AddLiquidityEvent" | "RemoveLiquidityEvent";
  type: Types.MoveStructTag;
  sequenceNumber: BN;
  timestamp: BN;
  sender: Types.Address;
}

export interface SwapEvent extends PoolEvent {
  kind: "SwapEvent";
  coinTypesIn: Types.MoveStructTag[];
  coinTypeOut: Types.MoveStructTag;
  amountsIn: AtomicUnits[];
  amountOut: AtomicUnits;
}

export interface AddLiquidityEvent extends PoolEvent {
  kind: "AddLiquidityEvent";
  coinTypes: Types.MoveStructTag[];
  amountsAdded: AtomicUnits[];
  amountMintedLP: AtomicUnits;
}

export interface RemoveLiquidityEvent extends PoolEvent {
  kind: "RemoveLiquidityEvent";
  coinTypes: Types.MoveStructTag[];
  amountsRemoved: AtomicUnits[];
  amountBurnedLP: AtomicUnits;
}

export interface Raw2PoolSwapEvent extends Types.Event {
  kind: "Raw2PoolSwapEvent";
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;

    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    fee_0: Types.U64;
    is_coin_0_out: boolean;
    amount_0_in: Types.U64;
    amount_0_out: Types.U64;

    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    fee_1: Types.U64;
    is_coin_1_out: boolean;
    amount_1_in: Types.U64;
    amount_1_out: Types.U64;

    before_balanced_reserve: Types.U128;
    after_balanced_reserve: Types.U128;
    amp: Types.U128;
  };
}

export interface Raw3PoolSwapEvent extends Types.Event {
  kind: "Raw3PoolSwapEvent";
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;

    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    fee_0: Types.U64;
    is_coin_0_out: boolean;
    amount_0_in: Types.U64;
    amount_0_out: Types.U64;

    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    fee_1: Types.U64;
    is_coin_1_out: boolean;
    amount_1_in: Types.U64;
    amount_1_out: Types.U64;

    before_reserve_2: Types.U64;
    after_reserve_2: Types.U64;
    fee_2: Types.U64;
    is_coin_2_out: boolean;
    amount_2_in: Types.U64;
    amount_2_out: Types.U64;

    before_balanced_reserve: Types.U128;
    after_balanced_reserve: Types.U128;
    amp: Types.U128;
  };
}

export interface Raw2PoolAddLiquidityEvent extends Types.Event {
  kind: "Raw2PoolAddLiquidityEvent";
  type: Types.MoveStructTag;
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;
    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    before_balanced_reserve: Types.U128;
    after_balanced_reserve: Types.U128;
    amp: Types.U128;
    before_lp_tokens_supply: Types.U128;
    after_lp_tokens_supply: Types.U128;
  };
}

export interface Raw3PoolAddLiquidityEvent extends Types.Event {
  kind: "Raw3PoolAddLiquidityEvent";
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;
    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    before_reserve_2: Types.U64;
    after_reserve_2: Types.U64;
    before_balanced_reserve: Types.U128;
    after_balanced_reserve: Types.U128;
    amp: Types.U128;
    before_lp_tokens_supply: Types.U128;
    after_lp_tokens_supply: Types.U128;
  };
}

export interface Raw2PoolRemoveLiquidityEvent extends Types.Event {
  kind: "RemoveLiquidityEvent";
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;
    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    fee_0: Types.U64;
    withdraw_0: Types.U64;
    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    fee_1: Types.U64;
    withdraw_1: Types.U64;
    before_reserve_2: Types.U128;
    after_reserve2: Types.U128;
    amp: Types.U128;
    before_lp_tokens_supply: Types.U128;
    after_lp_tokens_supply: Types.U128;
    lp_burnt: Types.U64;
  };
}

export interface Raw3PoolRemoveLiquidityEvent extends Types.Event {
  kind: "RemoveLiquidityEvent";
  data: {
    sender: Types.Address;
    timestamp_microseconds: Types.U64;
    before_reserve_0: Types.U64;
    after_reserve_0: Types.U64;
    fee_0: Types.U64;
    withdraw_0: Types.U64;
    before_reserve_1: Types.U64;
    after_reserve_1: Types.U64;
    fee_1: Types.U64;
    withdraw_1: Types.U64;
    before_reserve_2: Types.U64;
    after_reserve_2: Types.U64;
    fee_2: Types.U64;
    withdraw_2: Types.U64;
    before_balanced_reserve: Types.U128;
    after_balanced_reserve: Types.U128;
    amp: Types.U128;
    before_lp_tokens_supply: Types.U128;
    after_lp_tokens_supply: Types.U128;
    lp_burnt: Types.U64;
  };
}

export function parseRaw2PoolSwapEvent(event: Raw2PoolSwapEvent): SwapEvent {
  const coinTypes = parseTypeArgs(event.type);
  let coinTypesIn, coinTypeOut, amountsIn, amountOut;
  if (event.data.is_coin_1_out) {
    coinTypesIn = [coinTypes[0]!];
    coinTypeOut = coinTypes[1]!;
    amountsIn = [AU(event.data.amount_0_in)];
    amountOut = AU(event.data.amount_1_out);
  } else {
    coinTypesIn = [coinTypes[1]!];
    coinTypeOut = coinTypes[0]!;
    amountsIn = [AU(event.data.amount_1_in)];
    amountOut = AU(event.data.amount_0_out);
  }
  return {
    kind: "SwapEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypesIn,
    coinTypeOut,
    amountsIn,
    amountOut,
  };
}

export function parseRaw3PoolSwapEvent(event: Raw3PoolSwapEvent): SwapEvent {
  const coinTypes = parseTypeArgs(event.type);
  let coinTypesIn, coinTypeOut, amountsIn, amountOut;
  if (event.data.is_coin_2_out) {
    coinTypesIn = [coinTypes[0]!, coinTypes[1]!];
    coinTypeOut = coinTypes[2]!;
    amountsIn = [AU(event.data.amount_0_in), AU(event.data.amount_1_in)];
    amountOut = AU(event.data.amount_2_out);
  } else if (event.data.is_coin_1_out) {
    coinTypesIn = [coinTypes[0]!, coinTypes[2]!];
    coinTypeOut = coinTypes[1]!;
    amountsIn = [AU(event.data.amount_0_in), AU(event.data.amount_2_in)];
    amountOut = AU(event.data.amount_1_out);
  } else {
    coinTypesIn = [coinTypes[1]!, coinTypes[2]!];
    coinTypeOut = coinTypes[0]!;
    amountsIn = [AU(event.data.amount_1_in), AU(event.data.amount_2_in)];
    amountOut = AU(event.data.amount_0_out);
  }
  return {
    kind: "SwapEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypesIn,
    coinTypeOut,
    amountsIn,
    amountOut,
  };
}

export function parseRaw2PoolAddLiquidityEvent(
  event: Raw2PoolAddLiquidityEvent
): AddLiquidityEvent {
  return {
    kind: "AddLiquidityEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypes: parseTypeArgs(event.type),
    amountsAdded: [
      AU(
        new BN(event.data.after_reserve_0).sub(
          new BN(event.data.before_reserve_0)
        )
      ),
      AU(
        new BN(event.data.after_reserve_1).sub(
          new BN(event.data.before_reserve_1)
        )
      ),
    ],
    amountMintedLP: AU(
      new BN(event.data.after_lp_tokens_supply).sub(
        new BN(event.data.before_lp_tokens_supply)
      )
    ),
  };
}

export function parseRaw3PoolAddLiquidityEvent(
  event: Raw3PoolAddLiquidityEvent
): AddLiquidityEvent {
  return {
    kind: "AddLiquidityEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypes: parseTypeArgs(event.type),
    amountsAdded: [
      AU(
        new BN(event.data.after_reserve_0).sub(
          new BN(event.data.before_reserve_0)
        )
      ),
      AU(
        new BN(event.data.after_reserve_1).sub(
          new BN(event.data.before_reserve_1)
        )
      ),
      AU(
        new BN(event.data.after_reserve_2).sub(
          new BN(event.data.before_reserve_2)
        )
      ),
    ],
    amountMintedLP: AU(
      new BN(event.data.after_lp_tokens_supply).sub(
        new BN(event.data.before_lp_tokens_supply)
      )
    ),
  };
}

export function parseRaw2PoolRemoveLiquidityEvent(
  event: Raw2PoolRemoveLiquidityEvent
): RemoveLiquidityEvent {
  return {
    kind: "RemoveLiquidityEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypes: parseTypeArgs(event.type),
    amountsRemoved: [
      AU(
        new BN(event.data.before_reserve_0).sub(
          new BN(event.data.after_reserve_0)
        )
      ),
      AU(
        new BN(event.data.before_reserve_1).sub(
          new BN(event.data.after_reserve_1)
        )
      ),
    ],
    amountBurnedLP: AU(
      new BN(event.data.before_lp_tokens_supply).sub(
        new BN(event.data.after_lp_tokens_supply)
      )
    ),
  };
}

export function parseRaw3PoolRemoveLiquidityEvent(
  event: Raw3PoolRemoveLiquidityEvent
): RemoveLiquidityEvent {
  return {
    kind: "RemoveLiquidityEvent",
    type: event.type,
    sequenceNumber: new BN(event.sequence_number),
    timestamp: new BN(event.data.timestamp_microseconds),
    sender: event.data.sender,
    coinTypes: parseTypeArgs(event.type),
    amountsRemoved: [
      AU(
        new BN(event.data.before_reserve_0).sub(
          new BN(event.data.after_reserve_0)
        )
      ),
      AU(
        new BN(event.data.before_reserve_1).sub(
          new BN(event.data.after_reserve_1)
        )
      ),
      AU(
        new BN(event.data.before_reserve_2).sub(
          new BN(event.data.after_reserve_2)
        )
      ),
    ],
    amountBurnedLP: AU(
      new BN(event.data.before_lp_tokens_supply).sub(
        new BN(event.data.after_lp_tokens_supply)
      )
    ),
  };
}

/************************/
/* Input schemas (Pool) */
/************************/

export interface StableSwapInput {
  coinTypes: Types.MoveStructTag[];
}
export type SwapInput = SwapExactInInput | SwapExactOutInput;

export interface SwapExactInInput {
  coinTypeIn: Types.MoveStructTag;
  exactAmountIn: AnyUnits;
  parameters: { minAmountOut: AnyUnits };
}

export interface SwapExactOutInput {
  coinTypeOut: Types.MoveStructTag;
  exactAmountOut: AnyUnits;
  parameters: { maxAmountIn: AnyUnits };
}

export interface AddLiquidityInput {
  amounts: AnyUnits[];
  minLP: AnyUnits;
  useAuxAccount?: Boolean;
}

/********************************/
/* EntryFunctionPayload schemas */
/********************************/

export function createPool2PoolPayload(
  moduleAddress: Types.Address,
  input: CreatePool2PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stable_2pool::create_pool`,
    type_arguments: [input.coinType0, input.coinType1],
    arguments: [input.feeNumerator, input.amp],
  };
}

export function createPool3PoolPayload(
  moduleAddress: Types.Address,
  input: CreatePool3PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::stable_3pool::create_pool`,
    type_arguments: [input.coinType0, input.coinType1, input.coinType2],
    arguments: [input.feeNumerator, input.amp],
  };
}

export function swapExactCoinForCoin2PoolPayload(
  moduleAddress: Types.Address,
  input: SwapExactCoinForCoin2PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_2pool::swap_exact_coin_for_coin`,
    type_arguments: [input.coinType0, input.coinType1],
    arguments: [
      input.coin0Amount,
      input.coin1Amount,
      input.outCoinIndex,
      input.minQuantityOut,
    ],
  };
}

export function swapCoinForExactCoin2PoolPayload(
  moduleAddress: Types.Address,
  input: SwapCoinForExactCoin2PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_2pool::swap_coin_for_exact_coin`,
    type_arguments: [input.coinType0, input.coinType1],
    arguments: [
      input.requestedQuantity0,
      input.requestedQuantity1,
      input.inCoinIndex,
      input.maxInCoinAmount,
    ],
  };
}

export function swapExactCoinForCoin3PoolPayload(
  moduleAddress: Types.Address,
  input: SwapExactCoinForCoin3PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_3pool::swap_exact_coin_for_coin`,
    type_arguments: [input.coinType0, input.coinType1, input.coinType2],
    arguments: [
      input.coin0Amount,
      input.coin1Amount,
      input.coin2Amount,
      input.outCoinIndex,
      input.minQuantityOut,
    ],
  };
}

export function swapCoinForExactCoin3PoolPayload(
  moduleAddress: Types.Address,
  input: SwapCoinForExactCoin3PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_3pool::swap_coin_for_exact_coin`,
    type_arguments: [input.coinType0, input.coinType1, input.coinType2],
    arguments: [
      input.requestedQuantity0,
      input.requestedQuantity1,
      input.requestedQuantity2,
      input.inCoinIndex,
      input.maxInCoinAmount,
    ],
  };
}

export function addLiquidity2PoolPayload(
  moduleAddress: Types.Address,
  input: AddLiquidity2PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_2pool::add_liquidity`,
    type_arguments: [input.coinType0, input.coinType1],
    arguments: [input.coin0Amount, input.coin1Amount, input.minLpAmount],
  };
}

export function addLiquidity3PoolPayload(
  moduleAddress: Types.Address,
  input: AddLiquidity3PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_3pool::add_liquidity`,
    type_arguments: [input.coinType0, input.coinType1, input.coinType2],
    arguments: [
      input.coin0Amount,
      input.coin1Amount,
      input.coin2Amount,
      input.minLpAmount,
    ],
  };
}

export function removeLiquidity2PoolPayload(
  moduleAddress: Types.Address,
  input: RemoveLiquidity2PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_2pool::remove_liquidity`,
    type_arguments: [input.coinType0, input.coinType1],
    arguments: [input.lpAmount],
  };
}

export function removeLiquidity3PoolPayload(
  moduleAddress: Types.Address,
  input: RemoveLiquidity3PoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::router_3pool::remove_liquidity`,
    type_arguments: [input.coinType0, input.coinType1, input.coinType2],
    arguments: [input.lpAmount],
  };
}

/****************************************/
/* Input schemas (EntryFunctionPayload) */
/****************************************/

export interface CreatePool2PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  feeNumerator: Types.U128;
  amp: Types.U128;
}

export interface CreatePool3PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coinType2: Types.MoveStructTag;
  feeNumerator: Types.U128;
  amp: Types.U128;
}

export interface SwapExactCoinForCoin2PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coin0Amount: Types.U64;
  coin1Amount: Types.U64;
  outCoinIndex: number;
  minQuantityOut: Types.U64;
}

export interface SwapCoinForExactCoin2PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  requestedQuantity0: Types.U64;
  requestedQuantity1: Types.U64;
  inCoinIndex: number;
  maxInCoinAmount: Types.U64;
}

export interface SwapExactCoinForCoin3PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coinType2: Types.MoveStructTag;
  coin0Amount: Types.U64;
  coin1Amount: Types.U64;
  coin2Amount: Types.U64;
  outCoinIndex: number;
  minQuantityOut: Types.U64;
}

export interface SwapCoinForExactCoin3PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coinType2: Types.MoveStructTag;
  requestedQuantity0: Types.U64;
  requestedQuantity1: Types.U64;
  requestedQuantity2: Types.U64;
  inCoinIndex: number;
  maxInCoinAmount: Types.U64;
}

export interface AddLiquidity2PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coin0Amount: Types.U64;
  coin1Amount: Types.U64;
  minLpAmount: Types.U64;
}

export interface AddLiquidity3PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coinType2: Types.MoveStructTag;
  coin0Amount: Types.U64;
  coin1Amount: Types.U64;
  coin2Amount: Types.U64;
  minLpAmount: Types.U64;
}

export interface RemoveLiquidity2PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  lpAmount: Types.U64;
}

export interface RemoveLiquidity3PoolPayloadInput {
  coinType0: Types.MoveStructTag;
  coinType1: Types.MoveStructTag;
  coinType2: Types.MoveStructTag;
  lpAmount: Types.U64;
}

export interface ResetPoolPayloadInput {
  coinTypes: Types.MoveStructTag[];
}
