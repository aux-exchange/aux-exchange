import { AptosAccount, HexString, Types } from "aptos";
import assert from "assert";
import { BN } from "bn.js";
import type { AccountEvent } from "../../../src/vault/core/query";
import { parseAccountEvent } from "../../../src/vault/core/query";
import type { AuxClient, CoinInfo, TransactionOptions } from "../../client";
import type { TransactionResult } from "../../transaction";
import { AU } from "../../units";
import type {
  AddLiquidityEvent,
  RawAddLiquidityEvent,
  RawRemoveLiquidityEvent,
  RawSwapEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from "./events";

export interface CreatePoolInput {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  feeBps: Types.U64;
}

interface SwapInput {
  sender: AptosAccount;
  coinTypeIn: Types.MoveStructTag;
  coinTypeOut: Types.MoveStructTag;
}

export interface SwapExactCoinForCoinInput extends SwapInput {
  exactAmountAuIn: Types.U64;
  minAmountAuOut: Types.U64;
}

export interface SwapExactCoinForCoinLimitInput extends SwapInput {
  exactAmountAuIn: Types.U64;
  limitPriceNumerator: Types.U128;
  limitPriceDenominator: Types.U128;
}

export interface SwapCoinForExactCoinInput extends SwapInput {
  exactAmountAuOut: Types.U64;
  maxAmountAuIn: Types.U64;
}

export interface SwapCoinForExactCoinLimitInput extends SwapInput {
  exactAmountAuOut: Types.U64;
  maxAmountAuIn: Types.U64;
  limitPriceNumerator: Types.U128;
  limitPriceDenominator: Types.U128;
}

export interface AddLiquidityInput {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuX: Types.U64;
  amountAuY: Types.U64;
  maxSlippageBps: Types.U64;
}

export interface AddExactLiquidityInput {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuX: Types.U64;
  amountAuY: Types.U64;
}

export interface RemoveLiquidityInput {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
  amountAuLP: Types.U64;
  coinInfoLP?: CoinInfo;
}

export interface ResetPoolInput {
  sender: AptosAccount;
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
}

export async function createPool(
  auxClient: AuxClient,
  input: CreatePoolInput,
  transactionOptions?: TransactionOptions
): Promise<Types.UserTransaction> {
  return auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: createPoolPayload(auxClient, input),
    transactionOptions,
  });
}

export async function swapExactCoinForCoin(
  auxClient: AuxClient,
  input: SwapExactCoinForCoinInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<SwapEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: swapExactCoinForCoinPayload(auxClient, input),
    transactionOptions,
  });
  return tx.then((tx) => {
    return tx.success
      ? swapTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function swapExactCoinForCoinLimit(
  auxClient: AuxClient,
  input: SwapExactCoinForCoinLimitInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<SwapEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: {
      function: `${auxClient.moduleAddress}::amm::swap_exact_coin_for_coin_limit`,
      type_arguments: [input.coinTypeIn, input.coinTypeOut],
      arguments: [
        input.exactAmountAuIn,
        input.limitPriceNumerator,
        input.limitPriceDenominator,
      ],
    },
    transactionOptions,
  });
  return tx.then((tx) => {
    return tx.success
      ? swapTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function swapCoinForExactCoin(
  auxClient: AuxClient,
  input: SwapCoinForExactCoinInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<SwapEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: swapCoinForExactCoinPayload(auxClient, input),
    transactionOptions,
  });
  return tx.then((tx) => {
    return tx.success
      ? swapTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function swapCoinForExactCoinLimit(
  auxClient: AuxClient,
  input: SwapCoinForExactCoinLimitInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<SwapEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: {
      function: `${auxClient.moduleAddress}::amm::swap_coin_for_exact_coin_limit`,
      type_arguments: [input.coinTypeIn, input.coinTypeOut],
      arguments: [
        input.maxAmountAuIn,
        input.limitPriceNumerator,
        input.limitPriceDenominator,
        input.exactAmountAuOut,
      ],
    },
    transactionOptions,
  });
  return tx.then((tx) => {
    return tx.success
      ? swapTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function addExactLiquidity(
  auxClient: AuxClient,
  input: AddExactLiquidityInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<AddLiquidityEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: addExactLiquidityPayload(auxClient, input),
    transactionOptions,
  });
  return tx.then(async (tx) => {
    return tx.success
      ? await addLiquidityTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function removeLiquidity(
  auxClient: AuxClient,
  input: RemoveLiquidityInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<RemoveLiquidityEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: removeLiquidityPayload(auxClient, input),
    transactionOptions,
  });
  return tx.then(async (tx) => {
    return tx.success
      ? await removeLiquidityTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

export async function resetPool(
  auxClient: AuxClient,
  input: ResetPoolInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<RemoveLiquidityEvent | undefined>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: input.sender,
    payload: {
      function: `${auxClient.moduleAddress}::amm::reset_pool`,
      type_arguments: [input.coinTypeX, input.coinTypeY],
      arguments: [],
    },
    transactionOptions,
  });

  return tx.then(async (tx) => {
    return tx.success
      ? await removeLiquidityTxResult(auxClient, tx)
      : { tx, payload: undefined };
  });
}

/*****************/
/* EVENT PARSING */
/*****************/

export function swapTxResult(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): TransactionResult<SwapEvent | undefined> {
  for (const ev of tx.events.reverse()) {
    if (ev.type == `${auxClient.moduleAddress}::amm::SwapEvent`) {
      return {
        tx,
        payload: parseRawSwapEvent(auxClient, ev),
      };
    }
  }
  return {
    tx,
    payload: undefined,
  };
}

export function parseRawSwapEvent(
  auxClient: AuxClient,
  event: RawSwapEvent
): SwapEvent {
  if (event.type == `${auxClient.moduleAddress}::amm::SwapEvent`) {
    return {
      type: "SwapEvent",
      sequenceNumber: new BN(event.sequence_number),
      timestamp: new BN(event.data.timestamp),
      senderAddr: new HexString(event.data.sender_addr),
      inCoinType: event.data.in_coin_type,
      outCoinType: event.data.out_coin_type,
      in: AU(event.data.in_au),
      out: AU(event.data.out_au),
      feeBps: Number(event.data.fee_bps),
      inReserve: AU(event.data.in_reserve),
      outReserve: AU(event.data.out_reserve),
    };
  } else {
    throw new Error(`Expected SwapEvent, got ${event.type}`);
  }
}

export async function addLiquidityTxResult(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): Promise<TransactionResult<AddLiquidityEvent>> {
  for (const ev of tx.events.reverse()) {
    if (ev.type == `${auxClient.moduleAddress}::amm::AddLiquidityEvent`) {
      return {
        tx,
        payload: await parseRawAddLiquidityEvent(auxClient, ev),
      };
    }
  }
  assert(false, "did not find an AddLiquidityEvent");
}

export async function addLiquidityWithAccountTxResult(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): Promise<TransactionResult<Array<AddLiquidityEvent | AccountEvent>>> {
  for (const ev of tx.events.reverse()) {
    let payload: Array<AddLiquidityEvent | AccountEvent> = [];
    if (ev.type == `${auxClient.moduleAddress}::amm::AddLiquidityEvent`) {
      payload.push(await parseRawAddLiquidityEvent(auxClient, ev));
    } else if (
      ev.type == `${auxClient.moduleAddress}::vault::WithdrawEvent` ||
      ev.type == `${auxClient.moduleAddress}::vault::DepositEvent`
    ) {
      payload.push(await parseAccountEvent(auxClient, ev));
    }
    return {
      tx,
      payload,
    };
  }
  assert(false, "did not find an AddLiquidityEvent");
}

export async function parseRawAddLiquidityEvent(
  auxClient: AuxClient,
  event: RawAddLiquidityEvent
): Promise<AddLiquidityEvent> {
  if (event.type == `${auxClient.moduleAddress}::amm::AddLiquidityEvent`) {
    return {
      type: "AddLiquidity",
      sequenceNumber: new BN(event.sequence_number),
      timestamp: new BN(event.data.timestamp),
      xCoinType: event.data.x_coin_type,
      yCoinType: event.data.y_coin_type,
      xAdded: AU(event.data.x_added_au),
      yAdded: AU(event.data.y_added_au),
      lpMinted: AU(event.data.lp_minted_au),
    };
  } else {
    throw new Error(`Expected AddLiquidityEvent, got ${event.type}`);
  }
}

export async function removeLiquidityTxResult(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): Promise<TransactionResult<RemoveLiquidityEvent>> {
  for (const ev of tx.events.reverse()) {
    if (ev.type == `${auxClient.moduleAddress}::amm::RemoveLiquidityEvent`) {
      return {
        tx,
        payload: await parseRawRemoveLiquidityEvent(auxClient, ev),
      };
    }
  }
  assert(false, "did not find a RemoveLiquidityEvent");
}

export async function removeLiquidityWithAccountTxResult(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): Promise<TransactionResult<Array<RemoveLiquidityEvent | AccountEvent>>> {
  for (const ev of tx.events.reverse()) {
    let payload: Array<RemoveLiquidityEvent | AccountEvent> = [];
    if (ev.type == `${auxClient.moduleAddress}::amm::RemoveLiquidityEvent`) {
      payload.push(await parseRawRemoveLiquidityEvent(auxClient, ev));
    } else if (
      ev.type == `${auxClient.moduleAddress}::vault::WithdrawEvent` ||
      ev.type == `${auxClient.moduleAddress}::vault::DepositEvent`
    ) {
      payload.push(await parseAccountEvent(auxClient, ev));
    }
    return {
      tx,
      payload,
    };
  }
  assert(false, "did not find a RemoveLiquidityEvent");
}

export function parseRawRemoveLiquidityEvent(
  auxClient: AuxClient,
  event: RawRemoveLiquidityEvent
): RemoveLiquidityEvent {
  if (event.type == `${auxClient.moduleAddress}::amm::RemoveLiquidityEvent`) {
    return {
      type: "RemoveLiquidity",
      sequenceNumber: new BN(event.sequence_number),
      timestamp: new BN(event.data.timestamp),
      xCoinType: event.data.x_coin_type,
      yCoinType: event.data.y_coin_type,
      xRemoved: AU(event.data.x_removed_au),
      yRemoved: AU(event.data.y_removed_au),
      lpBurned: AU(event.data.lp_burned_au),
    };
  } else {
    throw new Error(`Expected RemoveLiquidityEvent, got ${event.type}`);
  }
}

export function createPoolPayload(
  auxClient: AuxClient,
  input: CreatePoolInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::create_pool`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.feeBps],
  };
}

export function swapExactCoinForCoinPayload(
  auxClient: AuxClient,
  input: SwapExactCoinForCoinInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::swap_exact_coin_for_coin_with_signer`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [input.exactAmountAuIn, input.minAmountAuOut],
  };
}

export function swapCoinForExactCoinPayload(
  auxClient: AuxClient,
  input: SwapCoinForExactCoinInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::swap_coin_for_exact_coin_with_signer`,
    type_arguments: [input.coinTypeIn, input.coinTypeOut],
    arguments: [input.maxAmountAuIn, input.exactAmountAuOut],
  };
}

export function addLiquidityPayload(
  auxClient: AuxClient,
  input: AddLiquidityInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::add_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY, input.maxSlippageBps],
  };
}

export function addExactLiquidityPayload(
  auxClient: AuxClient,
  input: AddExactLiquidityInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::add_exact_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY],
  };
}

export function addLiquidityWithAccountPayload(
  auxClient: AuxClient,
  input: AddLiquidityInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::add_liquidity_with_aux_account`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuX, input.amountAuY, input.maxSlippageBps],
  };
}

export function removeLiquidityPayload(
  auxClient: AuxClient,
  input: RemoveLiquidityInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::remove_liquidity`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuLP],
  };
}

export function removeLiquidityWithAccountPayload(
  auxClient: AuxClient,
  input: RemoveLiquidityInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::amm::remove_liquidity_with_aux_account`,
    type_arguments: [input.coinTypeX, input.coinTypeY],
    arguments: [input.amountAuLP],
  };
}
