import type { Types } from "aptos";

/**
 * Wraps a transaction with a parsed payload. The payload is usually derived
 * from the Events associated with the transaction.
 */
export interface TransactionResult<T> {
  tx: Types.UserTransaction;
  payload: T;
}
