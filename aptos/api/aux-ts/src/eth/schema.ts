import type { Types } from "aptos";
import type { ethers } from "ethers";
import type { AtomicUnits } from "../units";


export interface AuxEthTransaction<AuxType> {
  transaction: ethers.providers.TransactionReceipt;
  result: AuxType | undefined;
}

/*****************/
/* Event schemas */
/*****************/

export interface ApproveEvent {
  userAddress: string,
  tokenAddress: string,
  spender: string,
  tokenAmount: AtomicUnits,
}

export interface NativeSwapTokenTransferEvent {
  sender: string,
  tokenAddress: string | undefined,
  tokenAmount: AtomicUnits,
  relayerFee: AtomicUnits,
  receiverAddress: string,
  nativeSwapAmount: AtomicUnits,
  nonce: AtomicUnits
}

/*************************/
/* Input schemas (Relay) */
/*************************/

export interface ApproveInput {
  tokenAddress: string,
  spender: string,
  tokenAmount: AtomicUnits
}

export interface NativeSwapTokenTransferInput {
  tokenAddress: string | undefined,
  tokenAmount: AtomicUnits,
  receiverAddress: Types.Address,
}

export interface NativeSwapTokenTransferPayloadInput {
  tokenAddress: string | undefined,
  tokenAmount: AtomicUnits,
  relayerFee: AtomicUnits,
  receiverAddress: Types.Address,
  nativeSwapAmount: AtomicUnits,
  nonce: AtomicUnits,
}