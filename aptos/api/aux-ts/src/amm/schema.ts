import type { HexString, Types } from "aptos";
import type BN from "bn.js";
import type { CoinInfo } from "../client";
import type {
  AnyUnits,
  AtomicUnits,
  Bps,
  DecimalUnits,
  Percent,
} from "../units";

/****************/
/* Pool schemas */
/****************/

export type Curve = "constant product" | "stable swap";

export interface Position {
  owner: Types.Address;
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  coinInfoLP: CoinInfo;
  amountX: DecimalUnits;
  amountY: DecimalUnits;
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
}

export interface SwapEvent extends PoolEvent {
  kind: "SwapEvent";
  senderAddr: HexString;
  coinTypeIn: Types.MoveStructTag;
  coinTypeOut: Types.MoveStructTag;
  reserveIn: AtomicUnits;
  reserveOut: AtomicUnits;
  amountIn: AtomicUnits;
  amountOut: AtomicUnits;
  feeBps: number;
}

export interface AddLiquidityEvent extends PoolEvent {
  kind: "AddLiquidityEvent";
  xCoinType: Types.MoveStructTag;
  yCoinType: Types.MoveStructTag;
  xAdded: AtomicUnits;
  yAdded: AtomicUnits;
  lpMinted: AtomicUnits;
}

export interface RemoveLiquidityEvent extends PoolEvent {
  kind: "RemoveLiquidityEvent";
  xCoinType: Types.MoveStructTag;
  yCoinType: Types.MoveStructTag;
  xRemoved: AtomicUnits;
  yRemoved: AtomicUnits;
  lpBurned: AtomicUnits;
}

export interface RawPoolEvent extends Types.Event {
  kind: "RawSwapEvent" | "RawAddLiquidityEvent" | "RawRemoveLiquidityEvent";
}

export interface RawSwapEvent extends RawPoolEvent {
  kind: "RawSwapEvent";
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

export interface RawAddLiquidityEvent extends RawPoolEvent {
  kind: "RawAddLiquidityEvent";
  data: {
    timestamp: Types.U128;
    x_coin_type: Types.MoveStructTag;
    y_coin_type: Types.MoveStructTag;
    x_added_au: Types.U64;
    y_added_au: Types.U64;
    lp_minted_au: Types.U64;
  };
}

export interface RawRemoveLiquidityEvent extends RawPoolEvent {
  kind: "RawRemoveLiquidityEvent";
  data: {
    timestamp: Types.U128;
    x_coin_type: Types.MoveStructTag;
    y_coin_type: Types.MoveStructTag;
    x_removed_au: Types.U64;
    y_removed_au: Types.U64;
    lp_burned_au: Types.U64;
  };
}

/************************/
/* Input schemas (Pool) */
/************************/

export interface PoolInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
}

export type SwapInput = SwapExactInInput | SwapExactOutInput;

export interface SwapExactInInput {
  coinTypeIn: Types.MoveStructTag;
  exactAmountIn: AnyUnits;
  parameters:
    | { priceImpact?: Percent | Bps; slippage?: Percent | Bps }
    | { minAmountOut: AnyUnits }
    | { minAmountOutPerIn: AnyUnits };
}

export interface SwapExactOutInput {
  coinTypeOut: Types.MoveStructTag;
  exactAmountOut: AnyUnits;
  parameters:
    | {
        priceImpact?: Percent | Bps;
        slippage?: Percent | Bps;
      }
    | { maxAmountIn: AnyUnits }
    | { maxAmountIn: AnyUnits; maxAmountInPerOut: AnyUnits };
}

export interface SlippageInput {
  slippage?: Percent | Bps;
}

export interface AddLiquidityInput {
  amountX: AnyUnits;
  amountY: AnyUnits;
  slippage: Bps;
  useAccountBalance?: Boolean;
}

export interface AddExactLiquidityInput {
  amountX: AnyUnits;
  amountY: AnyUnits;
}

export interface AddApproximateLiquidityInput {
  maxX: AnyUnits;
  maxY: AnyUnits;
  minLP?: AnyUnits;
  maxPoolLP?: AnyUnits;
  minPoolX?: AnyUnits;
  minPoolY?: AnyUnits;
}

/********************************/
/* EntryFunctionPayload schemas */
/********************************/

export function createPoolPayload(
  moduleAddress: Types.Address,
  input: CreatePoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::create_pool`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.feeBps],
  };
}

export function swapExactCoinForCoinPayload(
  moduleAddress: Types.Address,
  input: SwapExactCoinForCoinPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::swap_exact_coin_for_coin_with_signer`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [input.exactAmountAuIn, input.minAmountAuOut],
  };
}

export function swapCoinForExactCoinPayload(
  moduleAddress: Types.Address,
  input: SwapCoinForExactCoinPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::swap_coin_for_exact_coin_with_signer`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [input.maxAmountAuIn, input.exactAmountAuOut],
  };
}

export function swapExactCoinForCoinLimitPayload(
  moduleAddress: Types.Address,
  input: SwapExactCoinForCoinLimitPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::swap_exact_coin_for_coin_limit`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [
      input.exactAmountAuIn,
      input.limitPriceNumerator,
      input.limitPriceDenominator,
    ],
  };
}

export function swapCoinForExactCoinLimitPayload(
  moduleAddress: Types.Address,
  input: SwapCoinForExactCoinLimitPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::swap_coin_for_exact_coin_limit`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [
      input.maxAmountAuIn,
      input.limitPriceNumerator,
      input.limitPriceDenominator,
      input.exactAmountAuOut,
    ],
  };
}

export function addLiquidityPayload(
  moduleAddress: Types.Address,
  input: AddLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::add_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY, input.maxSlippageBps],
  };
}

export function addExactLiquidityPayload(
  moduleAddress: Types.Address,
  input: AddExactLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::add_exact_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY],
  };
}

export function addApproximateLiquidityPayload(
  moduleAddress: Types.Address,
  input: AddApproximateLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::add_approximate_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [
      input.maxAuX,
      input.maxAuX,
      input.minAuLP,
      input.maxPoolAuLP,
      input.minPoolAuX,
      input.minPoolAuY,
    ],
  };
}

export function addLiquidityWithAccountPayload(
  moduleAddress: Types.Address,
  input: AddLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::add_liquidity_with_aux_account`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY, input.maxSlippageBps],
  };
}

export function removeLiquidityPayload(
  moduleAddress: Types.Address,
  input: RemoveLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::remove_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuLP],
  };
}

export function removeLiquidityWithAccountPayload(
  moduleAddress: Types.Address,
  input: RemoveLiquidityPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::remove_liquidity_with_aux_account`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuLP],
  };
}

export function resetPoolPayload(
  moduleAddress: Types.Address,
  input: ResetPoolPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${moduleAddress}::amm::reset_pool`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [],
  };
}

/****************************************/
/* Input schemas (EntryFunctionPayload) */
/****************************************/

export interface CreatePoolPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  feeBps: Types.U64;
}

export interface SwapPayloadInput {
  coinTypeIn: Types.MoveStructTag;
  coinTypeOut: Types.MoveStructTag;
}

export interface SwapExactCoinForCoinPayloadInput extends SwapPayloadInput {
  exactAmountAuIn: Types.U64;
  minAmountAuOut: Types.U64;
}

export interface SwapExactCoinForCoinLimitPayloadInput
  extends SwapPayloadInput {
  exactAmountAuIn: Types.U64;
  limitPriceNumerator: Types.U128;
  limitPriceDenominator: Types.U128;
}

export interface SwapCoinForExactCoinPayloadInput extends SwapPayloadInput {
  exactAmountAuOut: Types.U64;
  maxAmountAuIn: Types.U64;
}

export interface SwapCoinForExactCoinLimitPayloadInput
  extends SwapPayloadInput {
  exactAmountAuOut: Types.U64;
  maxAmountAuIn: Types.U64;
  limitPriceNumerator: Types.U128;
  limitPriceDenominator: Types.U128;
}

export interface AddLiquidityPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuX: Types.U64;
  amountAuY: Types.U64;
  maxSlippageBps: Types.U64;
}

export interface AddExactLiquidityPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuX: Types.U64;
  amountAuY: Types.U64;
}

export interface AddApproximateLiquidityPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  maxAuX: Types.U64;
  maxAuY: Types.U64;
  minAuLP: Types.U64;
  maxPoolAuLP: Types.U64;
  minPoolAuX: Types.U64;
  minPoolAuY: Types.U64;
}

export interface RemoveLiquidityPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuLP: Types.U64;
}

export interface ResetPoolPayloadInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
}
