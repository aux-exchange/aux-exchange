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
  sender: AptosAccount,
  options?: Partial<AuxClientOptions>
): Promise<Types.UserTransaction> {
  return auxClient.generateSignSubmitWaitForTransaction({
    sender,
    payload: createAuxAccountPayload(auxClient),
    options,
  });
}

export async function deposit(
  auxClient: AuxClient,
  depositInput: DepositInput,
  options?: Partial<AuxClientOptions>
): Promise<Types.UserTransaction> {
  return auxClient.generateSignSubmitWaitForTransaction({
    sender: depositInput.sender,
    payload: depositPayload(auxClient, depositInput),
    options,
  });
}

export async function withdraw(
  auxClient: AuxClient,
  withdrawInput: WithdrawInput,
  options?: Partial<AuxClientOptions>
): Promise<Types.UserTransaction> {
  return auxClient.generateSignSubmitWaitForTransaction({
    sender: withdrawInput.sender,
    payload: withdrawPayload(auxClient, withdrawInput),
    options,
  });
}

export async function transfer(
  auxClient: AuxClient,
  transferInput: TransferInput,
  options?: Partial<AuxClientOptions>
): Promise<Types.UserTransaction> {
  return auxClient.generateSignSubmitWaitForTransaction({
    sender: transferInput.sender,
    payload: transferPayload(auxClient, transferInput),
    options,
  });
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
