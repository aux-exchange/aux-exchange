import fs from "fs";
import readline from "readline";
import * as aux from "../../";
import { FakeCoin } from "../../../src/client";
import { getBar } from "../../../src/indexer/analytics";
import { auxClient, pythClient } from "../connection";
import {
  Bar,
  Market,
  MarketBarsArgs,
  MarketBarsForRangeArgs,
  MarketIsRoundLotArgs,
  MarketIsRoundTickArgs,
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
} from "../generated/types";

/**
 * Returns the symbol name in the data feed corresponding to the symbol name in
 * the UI.
 */
function getDataSymbolFromUISymbol(uiSymbol: string): string {
  return uiSymbol
    .replace("WBTC", "BTC")
    .replace("WETH", "ETH")
    .replace("USDC", "USD")
    .replace("(sol)", "")
    .replace("(eth)", "")
    .trim();
}

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
        time: order.timestamp.divn(1000).toString(), // microseconds => milliseconds
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
    const market = await aux.Market.read(auxClient, {
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    const orders = await market.orderHistory(owner);
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
        time: order.timestamp.divn(1000).toString(), // microseconds => milliseconds
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
    const market = await aux.Market.read(auxClient, {
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    const fills = await market.tradeHistory(owner);
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
        time: fill.timestamp.divn(1000).toString(),
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

    const base = getDataSymbolFromUISymbol(parent.baseCoinInfo.symbol);
    const quote = getDataSymbolFromUISymbol(parent.quoteCoinInfo.symbol);
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
  async barsForRange(
    parent: Market,
    {
      resolution,
      fromEpochMillisInclusive,
      toEpochMillisExclusive,
      countBack,
      firstDataRequest,
    }: MarketBarsForRangeArgs
  ): Promise<Array<Bar>> {
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

    const base = getDataSymbolFromUISymbol(parent.baseCoinInfo.symbol);
    const quote = getDataSymbolFromUISymbol(parent.quoteCoinInfo.symbol);
    const filename = `${base}-${quote}_${convert[resolution]}.json`;
    const path = `${process.cwd()}/src/indexer/data/${filename}`;
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
    });

    // TODO: Perform actual indexing. For small numbers of bars this should be okay.
    const startTime = parseFloat(fromEpochMillisInclusive);
    const endTime = parseFloat(toEpochMillisExclusive);
    const bars: Bar[] = [];
    for await (const line of rl) {
      const bar = JSON.parse(line);
      if (bar.time >= startTime && (firstDataRequest || bar.time < endTime)) {
        bars.push({
          ohlcv: bar,
          time: bar.time,
        });
      }
    }

    const firstIndex = bars.length - parseInt(countBack);
    return bars.slice(firstIndex >= 0 ? firstIndex : 0);
  },

  isRoundLot(parent: Market, { quantity }: MarketIsRoundLotArgs): boolean {
    return aux
      .DU(quantity)
      .toAtomicUnits(parent.baseCoinInfo.decimals)
      .toBN()
      .mod(aux.AU(parent.lotSizeString).toBN())
      .eqn(0);
  },

  isRoundTick(parent: Market, { quantity }: MarketIsRoundTickArgs): boolean {
    return aux
      .DU(quantity)
      .toAtomicUnits(parent.quoteCoinInfo.decimals)
      .toBN()
      .mod(aux.AU(parent.tickSizeString).toBN())
      .eqn(0);
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
