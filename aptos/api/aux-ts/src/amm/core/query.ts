import type { Types } from "aptos";
import * as BN from "bn.js";
import { AuxClient, CoinInfo, parseTypeArgs } from "../../client";
import { AtomicUnits, AU, DecimalUnits } from "../../units";
import type {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from "./events";
import {
  parseRawAddLiquidityEvent,
  parseRawRemoveLiquidityEvent,
  parseRawSwapEvent,
} from "./mutation";

export interface Pool {
  type: Types.MoveStructTag;
  timestamp: BN;
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  coinInfoLP: CoinInfo;
  amountAuX: AtomicUnits;
  amountAuY: AtomicUnits;
  amountAuLP: AtomicUnits;
  feeBps: BN;
}

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

export type PoolEvent = SwapEvent | AddLiquidityEvent | RemoveLiquidityEvent;

export interface PoolInput {
  coinTypeX: Types.MoveStructTag;
  coinTypeY: Types.MoveStructTag;
}

export async function pool(
  auxClient: AuxClient,
  { coinTypeX, coinTypeY }: PoolInput
): Promise<Pool | undefined> {
  let type = poolType(auxClient.moduleAddress, { coinTypeX, coinTypeY });
  let resource = await auxClient.getAccountResourceOptional(
    auxClient.moduleAddress,
    type
  );
  if (!resource) {
    let t = coinTypeX;
    coinTypeX = coinTypeY;
    coinTypeY = t;
    type = poolType(auxClient.moduleAddress, { coinTypeX, coinTypeY });
    resource = await auxClient.getAccountResourceOptional(
      auxClient.moduleAddress,
      type
    );
  }

  if (!resource) {
    return undefined;
  }

  const coinTypeLP = `${auxClient.moduleAddress}::amm::LP<${coinTypeX}, ${coinTypeY}>`;

  const [coinInfoX, coinInfoY, coinInfoLP] = await Promise.all([
    auxClient.getCoinInfo(coinTypeX),
    auxClient.getCoinInfo(coinTypeY),

    // Refresh the LP supply.
    auxClient.getCoinInfo(coinTypeLP, true),
  ]);
  const rawPool: any = resource.data;
  return {
    type,
    timestamp: new BN.BN(rawPool.timestamp),
    coinInfoX,
    coinInfoY,
    coinInfoLP,
    amountAuX: new AtomicUnits(new BN.BN(rawPool.x_reserve.value)),
    amountAuY: new AtomicUnits(new BN.BN(rawPool.y_reserve.value)),
    amountAuLP: new AtomicUnits(
      new BN.BN(coinInfoLP.supply[0]!.integer.vec[0]!.value)
    ),
    feeBps: new BN.BN(rawPool.fee_bps),
  };
}

export async function position(
  auxClient: AuxClient,
  owner: Types.Address,
  poolInput: PoolInput
): Promise<Position | undefined> {
  return (await positions(auxClient, owner)).find(
    (position) =>
      position.coinInfoX.coinType === poolInput.coinTypeX &&
      position.coinInfoY.coinType === poolInput.coinTypeY
  );
}

export async function positions(
  auxClient: AuxClient,
  owner: Types.Address
): Promise<Position[]> {
  const resources = await auxClient.aptosClient.getAccountResources(owner);
  const positions = [];
  const positionResources = resources.filter(
    (resource) =>
      resource.type.includes("amm::LP") &&
      resource.type.includes("0x1::coin::CoinStore")
  );
  for (const positionResource of positionResources) {
    const coinType = positionResource.type.split("LP<", 2)[1]!; // ! because of above `.includes`
    const [x, y] = coinType.replace(">>", "").split(", ", 2);
    const [coinTypeX, coinTypeY] = [x!, y!];
    const poolStruct = (await pool(auxClient, { coinTypeX, coinTypeY }))!;
    const amountAuLP = AU((positionResource.data as any).coin.value);
    const share =
      amountAuLP.toNumber() === 0
        ? 0
        : amountAuLP.toNumber() / poolStruct.amountAuLP.toNumber();
    positions.push({
      owner,
      coinInfoX: poolStruct.coinInfoX,
      coinInfoY: poolStruct.coinInfoY,
      coinInfoLP: poolStruct.coinInfoLP,
      // do ops in AU then convert
      amountX: AU(share * poolStruct.amountAuX.toNumber()).toDecimalUnits(
        poolStruct.coinInfoX.decimals
      ),
      amountY: AU(share * poolStruct.amountAuY.toNumber()).toDecimalUnits(
        poolStruct.coinInfoY.decimals
      ),
      amountLP: amountAuLP.toDecimalUnits(poolStruct.coinInfoLP.decimals),
      share,
    });
  }
  return positions;
}

export async function poolEvents(
  auxClient: AuxClient,
  poolInput: PoolInput
): Promise<PoolEvent[]> {
  const [swaps, adds, removes] = await Promise.all([
    swapEvents(auxClient, poolInput),
    addLiquidityEvents(auxClient, poolInput),
    removeLiquidityEvents(auxClient, poolInput),
  ]);
  return [swaps, adds, removes].flat();
}

export async function swapEvents(
  auxClient: AuxClient,
  poolInput: PoolInput
): Promise<SwapEvent[]> {
  const poolStruct = await pool(auxClient, poolInput);
  if (!poolStruct) {
    throw new Error(
      `Error querying swapEvents: Pool pair ${poolInput} not found.`
    );
  }
  const events = await auxClient.aptosClient.getEventsByEventHandle(
    auxClient.moduleAddress,
    poolType(auxClient.moduleAddress, poolInput),
    "swap_events"
  );
  return Promise.all(
    events.map(async (event) => await parseRawSwapEvent(auxClient, event))
  );
}

export async function addLiquidityEvents(
  auxClient: AuxClient,
  poolInput: PoolInput
): Promise<AddLiquidityEvent[]> {
  const poolStruct = await pool(auxClient, poolInput);
  if (!poolStruct) {
    throw new Error(
      `Error querying addLiquidityEvents: Pool pair ${poolInput} not found.`
    );
  }
  const events = await auxClient.aptosClient.getEventsByEventHandle(
    auxClient.moduleAddress,
    poolType(auxClient.moduleAddress, poolInput),
    "add_liquidity_events"
  );
  return Promise.all(
    events.map(
      async (event) => await parseRawAddLiquidityEvent(auxClient, event)
    )
  );
}

export async function removeLiquidityEvents(
  auxClient: AuxClient,
  poolInput: PoolInput
): Promise<RemoveLiquidityEvent[]> {
  const poolStruct = await pool(auxClient, poolInput);
  if (!poolStruct) {
    throw new Error(
      `Error querying removeLiquidityEvents: Pool pair ${poolInput} not found.`
    );
  }
  const events = await auxClient.aptosClient.getEventsByEventHandle(
    auxClient.moduleAddress,
    poolType(auxClient.moduleAddress, poolInput),
    "remove_liquidity_events"
  );
  return Promise.all(
    events.map(async (event) => parseRawRemoveLiquidityEvent(auxClient, event))
  );
}

function poolType(moduleAddress: Types.Address, poolInput: PoolInput) {
  return `${moduleAddress}::amm::Pool<${poolInput.coinTypeX}, ${poolInput.coinTypeY}>`;
}

export async function pools(
  auxClient: AuxClient
): Promise<{ poolType: string; coinTypeX: string; coinTypeY: string }[]> {
  const resources = await auxClient.aptosClient.getAccountResources(
    auxClient.moduleAddress
  );
  return resources
    .filter((resource) => resource.type.includes("Pool<"))
    .map((resource) => resource.type)
    .map(parsePoolType);
}

export function parsePoolType(poolType: Types.MoveStructTag): {
  poolType: string;
  coinTypeX: string;
  coinTypeY: string;
} {
  const [coinTypeX, coinTypeY] = parseTypeArgs(poolType);
  if (coinTypeX === undefined || coinTypeY === undefined) {
    throw new Error(`Failed to parse poolType ${poolType}`);
  }
  return { poolType, coinTypeX, coinTypeY };
}
