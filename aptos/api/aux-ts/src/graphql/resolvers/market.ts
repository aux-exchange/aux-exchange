import fs from "fs";
import readline from "readline";
import * as aux from "../../";
import { FakeCoin } from "../../../src/client";
import {
  ALL_USD_STABLES,
  COIN_MAPPING,
  SOL,
  USDC_eth,
  WBTC,
  WETH,
} from "../../coins";
import { auxClient, pythClient } from "../connection";
import { orderEventToOrder, orderToOrder } from "../conversion";
import {
  Bar,
  Market,
  MarketBarsArgs,
  MarketBarsTradingViewArgs,
  MarketIsRoundLotArgs,
  MarketIsRoundTickArgs,
  MarketOpenOrdersArgs,
  MarketOrderHistoryArgs,
  MarketPythRatingArgs,
  MarketTradeHistoryArgs,
  Maybe,
  Order,
  PythRating,
  PythRatingColor,
  Side,
} from "../generated/types";
import { LATEST_PYTH_PRICE } from "../pyth";

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
    return orders.map((order) =>
      orderToOrder(order, parent.baseCoinInfo, parent.quoteCoinInfo)
    );
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
    return orders.map((order) =>
      orderEventToOrder(order, market.baseCoinInfo, market.quoteCoinInfo)
    );
  },
  async tradeHistory(
    parent: Market,
    { owner }: MarketTradeHistoryArgs
  ): Promise<Order[]> {
    const market = await aux.Market.read(auxClient, {
      baseCoinType: parent.baseCoinInfo.coinType,
      quoteCoinType: parent.quoteCoinInfo.coinType,
    });
    const fills = await market.tradeHistory(owner);
    return fills.map((fill) =>
      orderEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
    );
  },
  async high24h(parent: Market): Promise<Maybe<number>> {
    parent;
    return null;
    // const bar = await publishBarEvents({
    //   baseCoinType: parent.baseCoinInfo.coinType,
    //   quoteCoinType: parent.quoteCoinInfo.coinType,
    //   resolution: "1d",
    // });
    // return bar.high;
  },
  async low24h(parent: Market): Promise<Maybe<number>> {
    parent;
    return null;
    // const bar = await publishBarEvents({
    //   baseCoinType: parent.baseCoinInfo.coinType,
    //   quoteCoinType: parent.quoteCoinInfo.coinType,
    //   resolution: "1d",
    // });
    // return bar.low;
  },
  async volume24h(parent: Market): Promise<Maybe<number>> {
    parent;
    return null;
    // const bar = await publishBarEvents({
    //   baseCoinType: parent.baseCoinInfo.coinType,
    //   quoteCoinType: parent.quoteCoinInfo.coinType,
    //   resolution: "1d",
    // });
    // return bar.volume;
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
  async barsTradingView(
    parent: Market,
    {
      resolution,
      from,
      to,
      countBack,
      firstDataRequest,
    }: MarketBarsTradingViewArgs
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
    const startTime = parseFloat(from);
    const endTime = parseFloat(to);
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
  async pythRating(
    parent: Market,
    { price, side }: MarketPythRatingArgs
  ): Promise<Maybe<PythRating>> {
    const [fakeBtc, fakeEth, fakeSol, fakeUsdc] = await Promise.all([
      auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
      auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
      auxClient.getWrappedFakeCoinType(FakeCoin.SOL),
      auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
    ]);

    const FAKE_MAPPING = new Map<string, string>();
    FAKE_MAPPING.set(fakeBtc, WBTC);
    FAKE_MAPPING.set(fakeEth, WETH);
    FAKE_MAPPING.set(fakeSol, SOL);
    FAKE_MAPPING.set(fakeUsdc, USDC_eth);

    const mappedQuote =
      FAKE_MAPPING.get(parent.quoteCoinInfo.coinType) ??
      parent.quoteCoinInfo.coinType;

    let pythPrice = undefined;
    if (ALL_USD_STABLES.includes(mappedQuote)) {
      const mappedBase =
        FAKE_MAPPING.get(parent.baseCoinInfo.coinType) ??
        parent.baseCoinInfo.coinType;
      const pythSymbol = COIN_MAPPING.get(mappedBase)?.pythSymbol;
      if (pythSymbol !== undefined) {
        pythPrice = LATEST_PYTH_PRICE.get(pythSymbol);
        if (pythPrice === undefined) {
          const data = await pythClient.getData();
          const pythPriceObj = data.productPrice.get(pythSymbol);
          pythPrice = pythPriceObj!.price ?? pythPriceObj!.previousPrice;
          LATEST_PYTH_PRICE.set(pythSymbol, pythPrice);
        }
      }
    }

    if (pythPrice === undefined) {
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
