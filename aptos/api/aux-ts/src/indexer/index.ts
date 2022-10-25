import * as redis from "redis";
import * as aux from "..";
import { AuxClient, FakeCoin } from "../client";

import * as BN from "bn.js";
import { RedisPubSub } from "graphql-redis-subscriptions";
import _ from "lodash";
import { orderEventToOrder } from "../graphql/conversion";
import type { MarketInput, Order } from "../graphql/generated/types";

const [auxClient, _moduleAuthority] = AuxClient.createFromEnvForTesting({});
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error("[Redis]", err));
const redisPubSub = new RedisPubSub();

export interface Bar {
  resolution: Resolution;
  time: number;
  ohlcv: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null;
}

type Resolution = "15s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export const RESOLUTIONS = [
  "15s",
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
  "1w",
] as const;

async function publishAmmEvents() {
  let swapCursor: BN = new BN.BN(0);
  let addCursor: BN = new BN.BN(0);
  let removeCursor: BN = new BN.BN(0);

  const poolReadParams = await aux.Pool.index(auxClient);
  const pools = await Promise.all(
    poolReadParams.map((poolReadParam) =>
      aux.Pool.read(auxClient, poolReadParam).then((pool) => pool!)
    )
  );
  while (true) {
    for (const pool of pools) {
      for (const swapEvent of await pool.swapEvents()) {
        if (swapCursor === swapEvent.sequenceNumber) {
          break;
        }
        await redisPubSub.publish("SWAP", {
          ...swapEvent,
          amountIn: swapEvent.in.toNumber(),
          amountOut: swapEvent.out.toNumber(),
        });
        swapCursor = swapEvent.sequenceNumber;
      }
      for (const addLiquidityEvent of await pool.addLiquidityEvents()) {
        if (addCursor === addLiquidityEvent.sequenceNumber) {
          break;
        }
        await redisPubSub.publish("ADD_LIQUIDITY", {
          ...addLiquidityEvent,
          amountAddedX: addLiquidityEvent.xAdded.toNumber(),
          amountAddedY: addLiquidityEvent.yAdded.toNumber(),
          amountMintedLP: addLiquidityEvent.lpMinted.toNumber(),
        });
        addCursor = addLiquidityEvent.sequenceNumber;
      }
      for (const removeLiquidityEvent of await pool.removeLiquidityEvents()) {
        if (removeCursor === removeLiquidityEvent.sequenceNumber) {
          break;
        }
        await redisPubSub.publish("REMOVE_LIQUIDITY", {
          ...removeLiquidityEvent,
          amountRemovedX: removeLiquidityEvent.xRemoved.toNumber(),
          amountRemovedY: removeLiquidityEvent.yRemoved.toNumber(),
          amountBurnedLP: removeLiquidityEvent.lpBurned.toNumber(),
        });
        removeCursor = removeLiquidityEvent.sequenceNumber;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function publishClobEvents() {
  const marketInputs = await aux.Market.index(auxClient);
  const rawCursors = await redisClient.get("cursors");
  const cursors: Record<string, number> = JSON.parse(rawCursors ?? "{}");
  const keyToCursor = Object.fromEntries(
    marketInputs.map((marketInput) => {
      const key = `${marketInput.baseCoinType}-${marketInput.quoteCoinType}`;
      return [key, cursors[key] ?? 0];
    })
  );

  while (true) {
    await Promise.all(
      marketInputs.map((marketInput) =>
        publishMarketEvents(marketInput, keyToCursor)
      )
    );
    await redisClient.set("cursors", JSON.stringify(keyToCursor));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function publishMarketEvents(
  marketInput: MarketInput,
  keyToCursor: Record<string, number>
): Promise<void> {
  if (
    marketInput.baseCoinType !== auxClient.getWrappedFakeCoinType(FakeCoin.ETH)
  ) {
    return;
  }
  if (
    marketInput.quoteCoinType !==
    auxClient.getWrappedFakeCoinType(FakeCoin.USDC)
  ) {
    return;
  }

  const { baseCoinType, quoteCoinType } = marketInput;

  // publish orderbook
  const market = await aux.Market.read(auxClient, marketInput);
  const bids = market.l2.bids.map((level) => ({
    price: level.price.toNumber(),
    quantity: level.quantity.toNumber(),
  }));
  const asks = market.l2.asks.map((level) => ({
    price: level.price.toNumber(),
    quantity: level.quantity.toNumber(),
  }));
  await redisPubSub.publish("ORDERBOOK", {
    baseCoinType,
    quoteCoinType,
    bids,
    asks,
  });

  // publish trades
  const key = `${baseCoinType}-${quoteCoinType}`;
  const fills = _(await market.fills())
    .filter((fill) => fill.sequenceNumber.toNumber() >= keyToCursor[key]!)
    .value();
  const cursor = fills[fills.length - 1]?.sequenceNumber.toNumber();

  await publishFills(
    fills.map((fill) =>
      orderEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
    ),
    key
  );

  if (!_.isUndefined(cursor)) {
    keyToCursor[key] = cursor;
    // publish bars
    await Promise.all(
      RESOLUTIONS.map((resolution) => publishBar(resolution, key))
    );
  }
}

function publishFills(fills: Order[], key: string) {
  return Promise.all([
    fills.forEach(async (fill) => await redisPubSub.publish("TRADE", fill)),
    fills.forEach(
      async (fill) => await redisPubSub.publish("LAST_TRADE_PRICE", fill.price)
    ),
    redisClient.rPush(
      `${key}-fills-24h`,
      fills.map((fill) =>
        JSON.stringify({
          time: fill.time,
          price: fill.price,
          quantity: fill.quantity,
        })
      )
    ),
    Promise.all(
      RESOLUTIONS.map((resolution) => {
        redisClient.rPush(
          `${key}-fills-${resolution}`,
          fills.map((fill) =>
            JSON.stringify({
              time: fill.time,
              price: fill.price,
              quantity: fill.quantity,
            })
          )
        );
      })
    ),
  ]);
}

async function publishBar(resolution: Resolution, key: string): Promise<void> {
  key = `${key}-fills-${resolution}`;
  const now = Date.now();
  const delta = now % (resolutionToSeconds(resolution) * 1000);
  const time = now - delta;

  const len = await redisClient.lLen(key);
  const rawFills = await redisClient.lPopCount(key, len) ?? [];
  const fills: Order[] = rawFills
    .map((s) => JSON.parse(s))
    .filter((fill: Order) => Number(fill.time) >= time);

  if (_.isEmpty(fills)) {
    await redisPubSub.publish("BAR", { resolution, time, ohlcv: null });
    return;
  }
  const prices = fills.map((fill) => fill.price);
  const bar: Bar = {
    resolution,
    time,
    ohlcv: {
      open: _.first(prices)!,
      high: _.max(prices)!,
      low: _.max(prices)!,
      close: _.last(prices)!,
      volume: _(fills)
        .map((fill) => fill.price * fill.quantity)
        .sum(),
    },
  };
  await redisPubSub.publish("BAR", bar);
  await redisClient.lPush(
    key,
    fills.map((fill) => JSON.stringify(fill))
  );
}

function resolutionToSeconds(resolution: Resolution): number {
  switch (resolution) {
    case "15s":
      return 15;
    case "1m":
      return 60;
    case "5m":
      return 5 * 60;
    case "15m":
      return 15 * 60;
    case "1h":
      return 60 * 60;
    case "4h":
      return 4 * 60 * 60;
    case "1d":
      return 24 * 60 * 60;
    case "1w":
      return 7 * 24 * 60 * 60;
    default:
      const _exhaustiveCheck: never = resolution;
      return _exhaustiveCheck;
  }
}

async function main() {
  await redisClient.connect();
  publishAmmEvents;
  publishClobEvents();
}

main();
