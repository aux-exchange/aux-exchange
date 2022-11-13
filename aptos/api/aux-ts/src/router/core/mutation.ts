import { HexString, Types } from "aptos";
import BN from "bn.js";
import {
  OrderFillEvent,
  parseRawOrderFillEvent,
  RawOrderFillEvent,
} from "../..//clob/core/events";
import type {
  SwapCoinForExactCoinPayloadInput,
  SwapEvent,
  SwapExactCoinForCoinPayloadInput,
} from "../../pool/constant-product/schema";
import type { AuxClient, AuxClientOptions } from "../../client";
import type { AuxTransaction } from "../../client";
import { AU } from "../../units";

export type RouterEvent = SwapEvent | OrderFillEvent;

/******************/
/* FUNCTION CALLS */
/******************/

export async function swapExactCoinForCoin(
  auxClient: AuxClient,
  swapInput: SwapExactCoinForCoinPayloadInput,
  options: Partial<AuxClientOptions> = {}
): Promise<AuxTransaction<RouterEvent[]>> {
  const tx = auxClient.sendOrSimulateTransaction(
    swapExactCoinForCoinPayload(auxClient, swapInput),
    options
  );
  return tx.then(async (tx) => {
    return parseRouterEvents(auxClient, tx);
  });
}

export async function swapCoinForExactCoin(
  auxClient: AuxClient,
  swapInput: SwapCoinForExactCoinPayloadInput,
  options: Partial<AuxClientOptions> = {}
): Promise<AuxTransaction<RouterEvent[]>> {
  const tx = auxClient.sendOrSimulateTransaction(
    swapCoinForExactCoinPayload(auxClient, swapInput),
    options
  );
  return tx.then(async (tx) => {
    return parseRouterEvents(auxClient, tx);
  });
}

/***********/
/* HELPERS */
/***********/

export function swapExactCoinForCoinPayload(
  auxClient: AuxClient,
  swapInput: SwapExactCoinForCoinPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::router::swap_exact_coin_for_coin_with_signer`,
    type_arguments: [swapInput.coinTypeIn, swapInput.coinTypeOut],
    arguments: [swapInput.exactAmountAuIn, swapInput.minAmountAuOut],
  };
}

export function swapCoinForExactCoinPayload(
  auxClient: AuxClient,
  swapInput: SwapCoinForExactCoinPayloadInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::router::swap_coin_for_exact_coin_with_signer`,
    type_arguments: [swapInput.coinTypeIn, swapInput.coinTypeOut],
    arguments: [swapInput.maxAmountAuIn, swapInput.exactAmountAuOut],
  };
}

export function parseRouterEvents(
  auxClient: AuxClient,
  tx: Types.UserTransaction
): AuxTransaction<Array<RouterEvent>> {
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
          return {
            kind: "SwapEvent",
            type: ev.type,
            sequenceNumber: new BN(ev.sequence_number),
            timestamp: new BN(ev.data.timestamp),
            senderAddr: new HexString(ev.data.sender_addr),
            coinTypeIn: ev.data.in_coin_type,
            coinTypeOut: ev.data.out_coin_type,
            reserveIn: AU(ev.data.in_reserve),
            reserveOut: AU(ev.data.out_reserve),
            amountIn: AU(ev.data.in_au),
            amountOut: AU(ev.data.out_au),
            feeBps: Number(ev.data.fee_bps),
          };
        }
        default:
          throw new Error(`Unexpected event type: ${ev.type}`);
      }
    });
  return {
    transaction: tx,
    // FIXME
    // @ts-ignore
    result: payload,
  };
}
