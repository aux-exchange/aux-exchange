import type { AptosAccount, Types } from "aptos";
import type { AuxClient, AuxClientOptions } from "../../client";

// TODO: remove
export interface DepositInput {
  sender: AptosAccount;
  to?: Types.Address;
  coinType: Types.MoveStructTag;
  amountAu: Types.U64;
}

// TODO: remove
export interface WithdrawInput {
  sender: AptosAccount;
  coinType: Types.MoveStructTag;
  amountAu: Types.U64;
}

// TODO: remove
export interface TransferInput {
  sender: AptosAccount;
  recipient: Types.Address;
  coinType: Types.MoveStructTag;
  amountAu: Types.U64;
}

export async function createAuxAccount(
  auxClient: AuxClient,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    createAuxAccountPayload(auxClient),
    options
  );
}

export async function deposit(
  auxClient: AuxClient,
  depositInput: DepositInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    depositPayload(auxClient, depositInput),
    { ...options, sender: depositInput.sender }
  );
}

export async function withdraw(
  auxClient: AuxClient,
  withdrawInput: WithdrawInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    withdrawPayload(auxClient, withdrawInput),
    { ...options, sender: withdrawInput.sender }
  );
}

export async function transfer(
  auxClient: AuxClient,
  transferInput: TransferInput,
  options: Partial<AuxClientOptions> = {}
): Promise<Types.UserTransaction> {
  return auxClient.sendOrSimulateTransaction(
    transferPayload(auxClient, transferInput),
    { ...options, sender: transferInput.sender }
  );
}

export function createAuxAccountPayload(
  auxClient: AuxClient
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::vault::create_aux_account`,
    type_arguments: [],
    arguments: [],
  };
}

export function depositPayload(
  auxClient: AuxClient,
  depositInput: DepositInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::vault::deposit`,
    type_arguments: [depositInput.coinType],
    arguments: [
      depositInput.to !== undefined
        ? depositInput.to
        : depositInput.sender.address().toString(),
      depositInput.amountAu,
    ],
  };
}

export function withdrawPayload(
  auxClient: AuxClient,
  withdrawInput: WithdrawInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::vault::withdraw`,
    type_arguments: [withdrawInput.coinType],
    arguments: [withdrawInput.amountAu],
  };
}

export function transferPayload(
  auxClient: AuxClient,
  transferInput: TransferInput
): Types.EntryFunctionPayload {
  return {
    function: `${auxClient.moduleAddress}::vault::transfer`,
    type_arguments: [transferInput.coinType],
    arguments: [transferInput.recipient, transferInput.amountAu],
  };
}
