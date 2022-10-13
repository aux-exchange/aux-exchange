import { getBar } from "../../../src/indexer/analytics";
import * as aux from "../../";
import { AU } from "../../";
import { auxClient } from "../connection";
import {
  Bar,
  Market,
  MarketBarsArgs,
  MarketOpenOrdersArgs,
  MarketOrderHistoryArgs,
  MarketTradeHistoryArgs,
  Order,
  OrderStatus,
  OrderType,
  Side,
  Trade,
} from "../types";
import _ from "lodash";
import fs from "fs";
import readline from "readline";

export const market = {
  async openOrders(
    parent: Market,
    { owner }: MarketOpenOrdersArgs
  ): Promise<Order[]> {
    const account = new aux.Account(auxClient, owner);
    const orders = await account.openOrders({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    return orders.map((order) => {
      return {
        baseCoinType: parent.baseCoinInfo.coinType,
        quoteCoinType: parent.quoteCoinInfo.coinType,
        orderId: order.id.toString(),
        owner: order.ownerId.hex(),
        market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
        orderType: OrderType.Limit,
        orderStatus: OrderStatus.Open,
        side: order.side === "bid" ? Side.Buy : Side.Sell,
        auxBurned: order.auxBurned
          .toDecimalUnits(6) // FIXME
          .toNumber(),
        time: order.time.toString(),
        price: AU(order.price)
          .toDecimalUnits(parent.quoteCoinInfo.decimals)
          .toNumber(),
        quantity: AU(order.quantity)
          .toDecimalUnits(parent.baseCoinInfo.decimals)
          .toNumber(),
      };
    });
  },
  async orderHistory(
    parent: Market,
    { owner }: MarketOrderHistoryArgs
  ): Promise<Order[]> {
    const account = new aux.Account(auxClient, owner);
    const orders = await account.orderHistory({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    return orders.map((order) => {
      return {
        baseCoinType: parent.baseCoinInfo.coinType,
        quoteCoinType: parent.quoteCoinInfo.coinType,
        orderId: order.orderId.toString(),
        owner: order,
        market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
        orderType: OrderType.Limit,
        orderStatus: OrderStatus.Open,
        side: order.isBid ? Side.Buy : Side.Sell,
        // FIXME
        auxBurned: 0,
        // FIXME
        time: "0",
        price: order.price
          .toDecimalUnits(parent.quoteCoinInfo.decimals)
          .toNumber(),
        quantity: order.quantity
          .toDecimalUnits(parent.baseCoinInfo.decimals)
          .toNumber(),
      };
    });
  },
  async tradeHistory(
    parent: Market,
    { owner }: MarketTradeHistoryArgs
  ): Promise<Trade[]> {
    const account = new aux.Account(auxClient, owner);
    const fills = await account.tradeHistory({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    return fills.map((fill) => {
      const price = fill.price
        .toDecimalUnits(parent.quoteCoinInfo.decimals)
        .toNumber();
      const quantity = fill.baseQuantity
        .toDecimalUnits(parent.baseCoinInfo.decimals)
        .toNumber();
      return {
        baseCoinType: parent.baseCoinInfo.coinType,
        quoteCoinType: parent.quoteCoinInfo.coinType,
        orderId: fill.orderId.toString(),
        owner: fill.owner,
        market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
        side: fill.isBid ? Side.Buy : Side.Sell,
        quantity,
        price,
        value: price * quantity,
        // FIXME
        auxBurned: 0,
        // FIXME
        time: "0",
      };
    });
  },
  async high24h(parent: Market): Promise<number | undefined> {
    const bar = await getBar({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
      resolution: "1d",
    });
    return bar.high;
  },
  async low24h(parent: Market): Promise<number | undefined> {
    const bar = await getBar({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
      resolution: "1d",
    });
    return bar.low;
  },
  async volume24h(parent: Market): Promise<number | undefined> {
    const bar = await getBar({
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
      resolution: "1d",
    });
    return bar.volume;
  },
  async bars(
    parent: Market,
    { resolution, first, offset }: MarketBarsArgs
  ): Promise<Bar[]> {
    first = first ?? 0;
    offset = offset ?? 5;

    const convert = {
      SECONDS_15: "15s",
      MINUTES_1: "1m",
      MINUTES_5: "5m",
      MINUTES_15: "15m",
      HOURS_1: "1h",
      HOURS_4: "4h",
      DAYS_1: "1d",
      WEEKS_1: "1w",
    };

    const base = parent.baseCoinInfo.symbol;
    const quote = parent.quoteCoinInfo.symbol.replace("USDC", "USD");
    const filename = `${base}-${quote}_${convert[resolution]}.json`;
    const path = `${process.cwd()}/src/indexer/data/${filename}`;
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
    });

    const bars: Bar[] = [];
    let i = 0;
    for await (const line of rl) {
      if (i === first + offset) {
        break;
      }
      if (i >= first) {
        const bar = JSON.parse(line);
        bars.push({
          ohlcv: bar,
          time: bar.time,
        });
      }
      i += 1;
    }

    return bars;
  },
};
