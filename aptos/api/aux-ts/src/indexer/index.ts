import * as redis from "redis";
import * as aux from "..";
import { AuxClient } from "../client";

import type { Types } from "aptos";
import { RedisPubSub } from "graphql-redis-subscriptions";
import _ from "lodash";
import { AuxEnv } from "../env";
import { orderFillEventToOrder } from "../graphql/conversion";
import type { MarketInput, Maybe, Side } from "../graphql/generated/types";
import { resolutionToSeconds } from "../graphql/resolvers/market";
import { Resolution, RESOLUTIONS } from "../graphql/resolvers/query";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient);
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error("[Redis]", err));
const redisPubSub = new RedisPubSub();

// All time in milliseconds since unix epoch

interface Bar {
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  resolution: Resolution;
  ohlcv: Maybe<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  time: number;
}

interface Trade {
  side: Side;
  price: number;
  quantity: number;
  time: number;
}

interface Bbo {
  bid: number;
  ask: number;
  time: number;
}

// async function publishAmmEvents() {
//   let swapCursor: BN = new BN.BN(0);
//   let addCursor: BN = new BN.BN(0);
//   let removeCursor: BN = new BN.BN(0);

//   const poolInputs = await auxClient.pools();
//   const pools = await Promise.all(
//     poolInputs.map((poolInput) => new aux.Pool(auxClient, poolInput))
//   );
//   while (true) {
//     for (const pool of pools) {
//       for (const swapEvent of await pool.swapEvents()) {
//         if (swapCursor === swapEvent.sequenceNumber) {
//           break;
//         }
//         await redisPubSub.publish("SWAP", {
//           ...swapEvent,
//           amountIn: swapEvent.amountIn.toNumber(),
//           amountOut: swapEvent.amountOut.toNumber(),
//         });
//         swapCursor = swapEvent.sequenceNumber;
//       }
//       for (const addLiquidityEvent of await pool.addLiquidityEvents()) {
//         if (addCursor === addLiquidityEvent.sequenceNumber) {
//           break;
//         }
//         await redisPubSub.publish("ADD_LIQUIDITY", {
//           ...addLiquidityEvent,
//           amountAddedX: addLiquidityEvent.xAdded.toNumber(),
//           amountAddedY: addLiquidityEvent.yAdded.toNumber(),
//           amountMintedLP: addLiquidityEvent.lpMinted.toNumber(),
//         });
//         addCursor = addLiquidityEvent.sequenceNumber;
//       }
//       for (const removeLiquidityEvent of await pool.removeLiquidityEvents()) {
//         if (removeCursor === removeLiquidityEvent.sequenceNumber) {
//           break;
//         }
//         await redisPubSub.publish("REMOVE_LIQUIDITY", {
//           ...removeLiquidityEvent,
//           amountRemovedX: removeLiquidityEvent.xRemoved.toNumber(),
//           amountRemovedY: removeLiquidityEvent.yRemoved.toNumber(),
//           amountBurnedLP: removeLiquidityEvent.lpBurned.toNumber(),
//         });
//         removeCursor = removeLiquidityEvent.sequenceNumber;
//       }
//     }
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }
// }

async function publishClobEvents() {
  const marketInputs = await aux.Market.index(auxClient);
  const rawCursors = await redisClient.get("cursors");
  const cursors: Record<string, number> = JSON.parse(rawCursors ?? "{}");
  const keyToCursor = Object.fromEntries(
    marketInputs.map(({ baseCoinType, quoteCoinType }) => {
      const key = `${baseCoinType}-${quoteCoinType}`;
      return [key, cursors[key] ?? 0];
    })
  );

  while (true) {
    await Promise.all(
      marketInputs.map((marketInput) =>
        publishMarketEvents(keyToCursor, marketInput)
      )
    );
    await redisClient.set("cursors", JSON.stringify(keyToCursor));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function publishMarketEvents(
  keyToCursor: Record<string, number>,
  { baseCoinType, quoteCoinType }: MarketInput
): Promise<void> {
  const key = `${baseCoinType}-${quoteCoinType}`;

  // publish orderbook
  const market = await aux.Market.read(auxClient, {
    baseCoinType,
    quoteCoinType,
  });
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

  // publish bbo
  const bid =
    _.max(market.l2.bids.map((level) => level.price.toNumber())) ?? null;
  const ask =
    _.min(market.l2.asks.map((level) => level.price.toNumber())) ?? null;
  if (bid && ask) {
    const bbo: Bbo = {
      time: Date.now(),
      bid,
      ask,
    };
    await Promise.all(
      _.concat("24h", RESOLUTIONS).map((resolution) =>
        redisClient.rPush(`${key}-bbo-${resolution}`, JSON.stringify(bbo))
      )
    );
  }

  // publish trades
  const fills = (await market.fills()).filter(
    (fill) => fill.sequenceNumber.toNumber() >= keyToCursor[key]!
  );
  const cursor = fills[fills.length - 1]?.sequenceNumber.toNumber();
  const trades = fills
    .filter((fill) => fill.sequenceNumber.toNumber() % 2 === 0)
    .map((fill) =>
      orderFillEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
    )
    .map((fill) => _.pick(fill, "side", "price", "quantity", "value", "time"));
  await publishTrades(trades, { baseCoinType, quoteCoinType });

  // publish bars
  await Promise.all([
    Promise.all(
      RESOLUTIONS.map((resolution) =>
        publishAnalytics(resolution, { baseCoinType, quoteCoinType })
      )
    ),
    publishAnalytics("24h", { baseCoinType, quoteCoinType }),
  ]);

  // update cursor
  if (!_.isUndefined(cursor)) {
    keyToCursor[key] = cursor;
  }
}

function publishTrades(
  trades: Trade[],
  { baseCoinType, quoteCoinType }: MarketInput
) {
  return Promise.all([
    trades.forEach(
      async (trade) =>
        await redisPubSub.publish("TRADE", {
          baseCoinType,
          quoteCoinType,
          ...trade,
        })
    ),
    trades.forEach(
      async (trade) =>
        await Promise.all([
          redisPubSub.publish("LAST_TRADE_PRICE", {
            baseCoinType,
            quoteCoinType,
            price: trade.price,
          }),
          redisClient.set(
            `${baseCoinType}-${quoteCoinType}-last-trade-price`,
            trade.price
          ),
        ])
    ),
    Promise.all(
      _.concat("24h", RESOLUTIONS).map((resolution) => {
        if (!_.isEmpty(trades)) {
          redisClient.rPush(
            `${baseCoinType}-${quoteCoinType}-trade-${resolution}`,
            trades.map((trade) => JSON.stringify(trade))
          );
        }
      })
    ),
  ]);
}

async function publishAnalytics(
  resolution: Resolution | "24h",
  { baseCoinType, quoteCoinType }: MarketInput
): Promise<void> {
  const key = (k: "bbo" | "trade" | "bar" | "high" | "low" | "volume") =>
    `${baseCoinType}-${quoteCoinType}-${k}-${resolution}`;

  const now = Date.now();
  const time =
    resolution === "24h"
      ? now - 24 * 60 * 60 * 1000
      : now - (now % (resolutionToSeconds(resolution) * 1000));

  const [rawBbos, rawTrades] = await Promise.all([
    redisClient.lRange(key("bbo"), 0, -1),
    redisClient.lRange(key("trade"), 0, -1),
  ]);

  const bbos_i = _.findIndex(rawBbos, (bbo) => JSON.parse(bbo).time >= time);
  const bbos: Bbo[] = rawBbos
    .map((s) => JSON.parse(s))
    .filter((item) => item.time >= time);
  const trades_i = _.findIndex(
    rawTrades,
    (trade) => JSON.parse(trade).time >= time
  );
  const trades: Trade[] = rawTrades
    .map((s) => JSON.parse(s))
    .filter((item) => item.time >= time);

  const midpoint = (bid: number, ask: number) => (bid + ask) / 2;
  const midpoints = bbos.map(({ bid, ask }) => midpoint(bid, ask));

  if (resolution === "24h") {
    const high = _.max(midpoints);
    const low = _.min(midpoints);
    const volume = _(trades)
      .map((trade) => trade.price * trade.quantity)
      .sum();

    const publish = async (
      kind: "high" | "low" | "volume",
      value: number | undefined
    ) => {
      if (!_.isUndefined(value)) {
        await Promise.all([
          redisPubSub.publish(`${kind.toUpperCase()}_24H`, {
            [kind]: value,
            baseCoinType,
            quoteCoinType,
          }),
          redisClient.set(key(kind), value),
        ]);
      }
    };
    await Promise.all([
      publish("high", high),
      publish("low", low),
      publish("volume", volume),
    ]);
  } else {
    const bar: Bar = _.isEmpty(midpoints)
      ? {
          ohlcv: null,
          baseCoinType,
          quoteCoinType,
          resolution,
          time,
        }
      : {
          ohlcv: {
            open: _.first(midpoints)!,
            high: _.max(midpoints)!,
            low: _.min(midpoints)!,
            close: _.last(midpoints)!,
            volume: _(trades)
              .map((trade) => trade.price * trade.quantity)
              .sum(),
          },
          baseCoinType,
          quoteCoinType,
          resolution,
          time,
        };
    const lastBarRaw = await redisClient.rPop(key("bar"));
    if (!_.isNull(lastBarRaw)) {
      const lastBar: Bar = JSON.parse(lastBarRaw);
      if (lastBar.time !== bar.time) {
        await redisClient.rPush(key("bar"), JSON.stringify(lastBar));
      }
    }

    await Promise.all([
      redisPubSub.publish("BAR", bar),
      redisClient.rPush(key("bar"), JSON.stringify(bar)),
      redisClient.lTrim(key("bar"), 0, 99_999),
    ]);
  }

  // this happens atomically in a Redis pipeline
  if (bbos_i > 0) {
    await redisClient.lPopCount(key("bbo"), bbos_i);
  }
  if (trades_i > 0) {
    await redisClient.lPopCount(key("trade"), trades_i);
  }
}

async function main() {
  await redisClient.connect();
  // publishAmmEvents;
  publishClobEvents();
}

main();
