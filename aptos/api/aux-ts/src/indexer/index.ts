import * as aux from "..";
import { AuxClient } from "../client";

import type { Types } from "aptos";
import * as BN from "bn.js";
import fs from "fs";
import { RedisPubSub } from "graphql-redis-subscriptions";
import _ from "lodash";
import type { OrderFillEvent } from "../clob/core/events";

const [auxClient, _moduleAuthority] = AuxClient.createFromEnvForTesting({});
const pubsub = new RedisPubSub();

export interface Bar {
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  close: number | undefined;
  volume: number | undefined;
  fills: {
    price: number;
    quantity: number;
    timestamp: number;
  }[];
  cursor: number;
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
        await pubsub.publish("SWAP", {
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
        await pubsub.publish("ADD_LIQUIDITY", {
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
        await pubsub.publish("REMOVE_LIQUIDITY", {
          ...removeLiquidityEvent,
          amountRemovedX: removeLiquidityEvent.xRemoved.toNumber(),
          amountRemovedY: removeLiquidityEvent.yRemoved.toNumber(),
          amountBurnedLP: removeLiquidityEvent.lpBurned.toNumber(),
        });
        removeCursor = removeLiquidityEvent.sequenceNumber;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function publishClobEvents() {
  let fillCursor: BN = new BN.BN(0);
  fillCursor;

  const marketReadParams = await aux.Market.index(auxClient);
  const markets = await Promise.all(
    marketReadParams.map((marketReadParam) =>
      aux.Market.read(auxClient, marketReadParam).then((market) => market!)
    )
  );

  while (true) {
    for (const market of markets) {
      const baseCoinType = market.baseCoinInfo.coinType;
      const quoteCoinType = market.quoteCoinInfo.coinType;
      // if (!baseCoinType.includes("BTC") && !baseCoinType.includes("ETH")) {
      //   continue;
      // }
      if (!baseCoinType.includes("ETH")) {
        continue;
      }
      if (!quoteCoinType.includes("USDC")) {
        continue;
      }
      const marketName = `${market.baseCoinInfo.symbol}/${market.quoteCoinInfo.symbol}`;
      marketName;

      await market.update();
      const bids = market.l2.bids.map((level) => ({
        price: level.price.toNumber(),
        quantity: level.quantity.toNumber(),
      }));
      const asks = market.l2.asks.map((level) => ({
        price: level.price.toNumber(),
        quantity: level.quantity.toNumber(),
      }));
      bids;
      asks;
      console.log("publishing orderbook");
      // console.log(bids);
      // console.log(asks);
      // pubsub.publish("ORDERBOOK", {
      //   baseCoinType: market.baseCoinInfo.coinType,
      //   quoteCoinType: market.quoteCoinInfo.coinType,
      //   bids,
      //   asks,
      // });
      pubsub.publish("ORDERBOOK", {
        baseCoinType: market.baseCoinInfo.coinType,
        quoteCoinType: market.quoteCoinInfo.coinType,
        bids,
        asks,
      });

      //   let lastOrderFillEvent;
      //   for (const orderFillEvent of await market.fills()) {
      //     if (fillCursor === orderFillEvent.sequenceNumber) {
      //       break;
      //     }
      //     const quantity = orderFillEvent.baseQuantity
      //       .toDecimalUnits(market.baseCoinInfo.decimals)
      //       .toNumber();
      //     const price = orderFillEvent.price
      //       .toDecimalUnits(market.quoteCoinInfo.decimals)
      //       .toNumber();
      //     const trade = {
      //       orderId: orderFillEvent.orderId,
      //       owner: orderFillEvent.owner,
      //       market: marketName,
      //       time: Math.floor(orderFillEvent.timestamp.toNumber()),
      //       quantity,
      //       price,
      //       value: quantity * price,
      //     };
      //     await pubsub.publish("TRADE", trade);
      //     fillCursor = orderFillEvent.sequenceNumber;
      //     lastOrderFillEvent = orderFillEvent;
      //   }
      //   if (lastOrderFillEvent !== undefined) {
      //     const baseCoinType = market.baseCoinInfo.coinType;
      //     const quoteCoinType = market.quoteCoinInfo.coinType;
      //     await pubsub.publish("LAST_TRADE_PRICE", {
      //       baseCoinType,
      //       quoteCoinType,
      //       price: lastOrderFillEvent.price
      //         .toDecimalUnits(market.quoteCoinInfo.decimals)
      //         .toNumber(),
      //     });
      //     for (const resolution of RESOLUTIONS) {
      //       console.log("publishing bar");
      //       await pubsub.publish(
      //         "BAR",
      //         publishBarEvents({ baseCoinType, quoteCoinType, resolution })
      //       );
      //     }
      //   }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

const PATH = "src/indexer/data/analytics.json";
async function publishBarEvents({
  baseCoinType,
  quoteCoinType,
  resolution,
}: {
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  resolution: Resolution;
}): Promise<Bar> {
  const [auxClient, _moduleAuthority] = AuxClient.createFromEnvForTesting({});
  const market = await aux.Market.read(auxClient, {
    baseCoinType,
    quoteCoinType,
  });
  const convert = (fill: OrderFillEvent) => ({
    price: fill.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
    quantity: fill.baseQuantity
      .toDecimalUnits(market.baseCoinInfo.decimals)
      .toNumber(),
    timestamp: fill.timestamp.toNumber(),
  });

  let { cursor, fills }: Bar = fs.existsSync(PATH)
    ? JSON.parse(fs.readFileSync(PATH, "utf-8"))
    : {
        cursor: 0,
        fills: [],
      };

  const now = Date.now();
  fills = _.dropWhile(
    fills,
    (fill) => fill.timestamp < now - resolutionSeconds(resolution)
  );

  while (true) {
    // pagination logic
    // start: 0, limit: 100
    // server will return starting from lowest seq num
    // if there are multiple pages, keep paging until the cursor overlaps
    // only process the records within a page that are > cursor
    // move the cursor forward after processing
    const moreFills = await market.fills({ start: cursor, limit: 100 });
    const fillsSince =
      cursor === 0
        ? moreFills
        : _.dropWhile(
            moreFills,
            (fill) => fill.sequenceNumber.toNumber() <= cursor
          );
    fills = fills.concat(fillsSince.map(convert));
    cursor =
      fillsSince[fillsSince.length - 1]?.sequenceNumber.toNumber() ?? cursor;
    if (fillsSince.length === 0 || fillsSince.length < moreFills.length) {
      break;
    }
  }

  const prices = fills.map((fill) => fill.price);
  const bar: Bar = {
    open: _.first(prices),
    high: _.max(prices),
    low: _.max(prices),
    close: _.last(prices),
    volume: _(fills)
      .map((fill) => fill.price * fill.quantity)
      .sum(),
    fills,
    cursor,
  };

  fs.writeFileSync(PATH, JSON.stringify(bar));
  return bar;
}

function resolutionSeconds(resolution: Resolution): number {
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
  publishAmmEvents;
  publishClobEvents();
  publishBarEvents;
}

main();
