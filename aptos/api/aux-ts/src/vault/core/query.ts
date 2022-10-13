import { HexString, Types } from "aptos";
import type { AuxClient, Entry } from "../../client";
import { AtomicUnits, AU, DecimalUnits } from "../../units";

export interface CoinBalance {
  balance: AtomicUnits;
  available_balance: AtomicUnits;
}

export interface Balances {
  balances: Entry<CoinBalance>[];
}

export interface TransferEvent {
  coinType: Types.MoveStructTag;
  from: Types.Address;
  to: Types.Address;
  amount: DecimalUnits;
}

export interface DepositEvent {
  coinType: Types.MoveStructTag;
  owner: Types.Address;
  amount: DecimalUnits;
}

export interface WithdrawEvent {
  coinType: Types.MoveStructTag;
  owner: Types.Address;
  amount: DecimalUnits;
}

export async function balances(
  auxClient: AuxClient,
  owner: Types.Address
): Promise<Balances> {
  const address = await auxClient.getVaultAddress(new HexString(owner));
  if (address === undefined) {
    return {
      balances: [],
    };
  }
  const resources = await auxClient.aptosClient.getAccountResources(
    address.toShortString()
  );
  const balancePrefix = `${auxClient.moduleAddress}::vault::CoinBalance<`;
  const balances = resources.filter((res) => {
    return res.type.startsWith(balancePrefix);
  });
  return {
    balances: balances.map((res) => {
      return {
        key: {
          name: res.type,
        },
        value: {
          balance: AU((res.data as any).balance),
          available_balance: AU((res.data as any).available_balance),
        },
      };
    }),
  };
}

export async function balance(
  auxClient: AuxClient,
  owner: Types.Address,
  coinType: Types.MoveStructTag
): Promise<AtomicUnits> {
  const address = await auxClient.getVaultAddress(new HexString(owner));
  if (address === undefined) {
    return AU(0);
  }
  // Types.MoveStructValue is just a placeholder object, so we cast into the shape of the data
  const type = `${auxClient.moduleAddress}::vault::CoinBalance<${coinType}>`;
  const maybeResource = await auxClient.getAccountResourceOptional(
    address.toShortString(),
    type
  );
  if (maybeResource === undefined) {
    return AU(0);
  }
  return AU((maybeResource.data as any).balance);
}

export async function availableBalance(
  auxClient: AuxClient,
  owner: Types.Address,
  coinType: Types.MoveStructTag
): Promise<AtomicUnits> {
  const address = await auxClient.getVaultAddress(new HexString(owner));
  if (address === undefined) {
    return AU(0);
  }
  const type = `${auxClient.moduleAddress}::vault::CoinBalance<${coinType}>`;
  const maybeResource = await auxClient.getAccountResourceOptional(
    address.toShortString(),
    type
  );
  if (maybeResource === undefined) {
    return AU(0);
  }
  return AU((maybeResource.data as any).available_balance);
}

async function events<Type>(
  auxClient: AuxClient,
  fieldName: string,
  predicate: (event: Type) => boolean
): Promise<Type[]> {
  const events = await auxClient.aptosClient.getEventsByEventHandle(
    auxClient.moduleAddress,
    `${auxClient.moduleAddress}::vault::Vault`,
    fieldName
  );
  const first = events[0];
  if (first === undefined) {
    return [];
  }
  const decimals = (await auxClient.getCoinInfo(first.data.coinType)).decimals;
  return events
    .map((event) => {
      event.data.amount = AU(event.data.amount_au).toDecimalUnits(decimals);
      return event as unknown as Type;
    })
    .filter(predicate);
}

export async function transferEvents(
  auxClient: AuxClient,
  owner: Types.Address
): Promise<TransferEvent[]> {
  return events(
    auxClient,
    "transfer_events",
    // @ts-ignore
    (event) => event.data.from === owner || event.data.to === owner
  );
}

export async function depositEvents(
  auxClient: AuxClient,
  owner: Types.Address
): Promise<DepositEvent[]> {
  // @ts-ignore
  return events(auxClient, "deposit_events", (event) => event.data.owner === owner);
}

export async function withdrawEvents(
  auxClient: AuxClient,
  owner: Types.Address
): Promise<DepositEvent[]> {
  // @ts-ignore
  return events(auxClient, "withdraw_events", (event) => event.data.owner === owner);
}
