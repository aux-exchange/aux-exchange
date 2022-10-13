import type { Types } from "aptos";
import {
  OrderFillEvent,
  parseRawOrderFillEvent,
  RawOrderFillEvent,
} from "../..//clob/core/events";
import type { SwapEvent } from "../../amm/core/events";
import {
  parseRawSwapEvent,
  SwapCoinForExactCoinInput,
  SwapExactCoinForCoinInput,
} from "../../amm/core/mutation";
import type { AuxClient, TransactionOptions } from "../../client";
import type { TransactionResult } from "../../transaction";

export type RouterEvent = SwapEvent | OrderFillEvent;

/******************/
/* FUNCTION CALLS */
/******************/

export async function swapExactCoinForCoin(
  auxClient: AuxClient,
  swapInput: SwapExactCoinForCoinInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<RouterEvent[]>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: swapInput.sender,
    payload: swapExactCoinForCoinPayload(auxClient, swapInput),
    transactionOptions,
  });
  return tx.then(async (tx) => {
    return parseRouterEvents(auxClient, tx);
  });
}

export async function swapCoinForExactCoin(
  auxClient: AuxClient,
  swapInput: SwapCoinForExactCoinInput,
  transactionOptions?: TransactionOptions
): Promise<TransactionResult<RouterEvent[]>> {
  const tx = auxClient.generateSignSubmitWaitForTransaction({
    sender: swapInput.sender,
    payload: swapCoinForExactCoinPayload(auxClient, swapInput),
    transactionOptions,
  });
  return tx.then(async (tx) => {
    return parseRouterEvents(auxClient, tx);
  });
}

/***********/
/* HELPERS */
/***********/

function swapExactCoinForCoinPayload(
  auxClient: AuxClient,
  swapInput: SwapExactCoinForCoinInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::router::swap_exact_coin_for_coin`,
    type_arguments: [swapInput.coinTypeIn, swapInput.coinTypeOut],
    arguments: [swapInput.exactAmountAuIn, swapInput.minAmountAuOut],
  };
}

function swapCoinForExactCoinPayload(
  auxClient: AuxClient,
  swapInput: SwapCoinForExactCoinInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::router::swap_coin_for_exact_coin`,
    type_arguments: [swapInput.coinTypeIn, swapInput.coinTypeOut],
    arguments: [swapInput.maxAmountAuIn, swapInput.exactAmountAuOut],
  };
}

function parseRouterEvents(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): TransactionResult<Array<RouterEvent>> {
  const payload = tx.events
    .reverse()
    .filter(
      (e) =>
        e.type == `${auxClient.moduleAddress}::clob_market::OrderFillEvent` ||
        e.type == `${auxClient.moduleAddress}::amm::SwapEvent`
    )
    .map((ev) => {
      switch (ev.type) {
        case `${auxClient.moduleAddress}::clob_market::OrderFillEvent`: {
          return parseRawOrderFillEvent(ev as RawOrderFillEvent);
        }
        case `${auxClient.moduleAddress}::amm::SwapEvent`: {
          return parseRawSwapEvent(auxClient, ev);
        }
        default:
          throw new Error(`Unexpected event type: ${ev.type}`);
      }
    });
  return {
    tx,
    payload,
  };
}
