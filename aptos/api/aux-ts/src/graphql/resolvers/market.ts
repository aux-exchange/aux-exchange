import { getBar } from "../../../src/indexer/analytics";
import * as aux from "../../";
import { auxClient, pythClient } from "../connection";
import {
  Bar,
  Market,
  MarketBarsArgs,
  MarketOpenOrdersArgs,
  MarketOrderHistoryArgs,
  MarketPythRatingArgs,
  MarketTradeHistoryArgs,
  Maybe,
  Order,
  OrderStatus,
  OrderType,
  PythRating,
  PythRatingColor,
  Side,
  Trade,
} from "../types";
import _ from "lodash";
import fs from "fs";
import readline from "readline";
import { FakeCoin } from "../../../src/client";

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
        owner: order.ownerId.toString(),
        market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
        orderType: OrderType.Limit,
        orderStatus: OrderStatus.Open,
        side: order.side === "bid" ? Side.Buy : Side.Sell,
        auxBurned: order.auxBurned
          .toDecimalUnits(6) // FIXME
          .toNumber(),
        time: order.timestamp.toString(),
        price: order.price
          .toDecimalUnits(parent.quoteCoinInfo.decimals)
          .toNumber(),
        quantity: order.quantity
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
        owner: order.owner.toString(),
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
        owner: fill.owner.toString(),
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
  async pythRating(
    parent: Market,
    { price, side }: MarketPythRatingArgs
  ): Promise<Maybe<PythRating>> {
    const data = await pythClient.getData();
    const [fakeBtc, fakeEth, fakeSol, fakeUsdc] = await Promise.all([
      auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
      auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
      auxClient.getWrappedFakeCoinType(FakeCoin.SOL),
      auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
    ]);
    // wormhole
    const [btc, eth, sol, usdcet, usda] = [
      "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T",
      "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T",
      "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T",
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
      "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA",
    ];
    let pythPriceObj;
    if (
      (parent.baseCoinInfo.coinType === fakeBtc &&
        parent.quoteCoinInfo.coinType === fakeUsdc) ||
      (parent.baseCoinInfo.coinType === btc &&
        (parent.quoteCoinInfo.coinType === usdcet ||
          parent.quoteCoinInfo.coinType === usda))
    ) {
      pythPriceObj = data.productPrice.get("Crypto.BTC/USD");
    } else if (
      (parent.baseCoinInfo.coinType === fakeEth &&
        parent.quoteCoinInfo.coinType === fakeUsdc) ||
      (parent.baseCoinInfo.coinType === eth &&
        (parent.quoteCoinInfo.coinType === usdcet ||
          parent.quoteCoinInfo.coinType === usda))
    ) {
      pythPriceObj = data.productPrice.get("Crypto.ETH/USD");
    } else if (
      (parent.baseCoinInfo.coinType === fakeSol &&
        parent.quoteCoinInfo.coinType === fakeUsdc) ||
      (parent.baseCoinInfo.coinType === sol &&
        (parent.quoteCoinInfo.coinType === usdcet ||
          parent.quoteCoinInfo.coinType === usda))
    ) {
      pythPriceObj = data.productPrice.get("Crypto.SOL/USD");
    } else {
      return null;
    }
    const pythPrice = pythPriceObj!.price ?? pythPriceObj!.previousPrice;
    if (!pythPrice) {
      return null;
    }
    if (side === Side.Buy) {
      const ratio = (price - pythPrice) / pythPrice;
      return ratio > 0.005
        ? { price, color: PythRatingColor.Red }
        : ratio > 0.001
        ? { price, color: PythRatingColor.Yellow }
        : { price, color: PythRatingColor.Green };
    } else {
      const ratio = (pythPrice - price) / pythPrice;
      return ratio > 0.005
        ? { price, color: PythRatingColor.Red }
        : ratio > 0.001
        ? { price, color: PythRatingColor.Yellow }
        : { price, color: PythRatingColor.Green };
    }
  },
};
