import _ from "lodash";
import * as aux from "../../";
import { ALL_USD_STABLES, COIN_MAPPING, fakeMapping } from "../../coin";
import { auxClient, redisClient } from "../client";
import { orderPlacedEventToOrder, orderFillEventToOrder, orderToOrder } from "../conversion";
import {
  Bar,
  Market,
  MarketBarsArgs,
  MarketIsRoundLotArgs,
  MarketIsRoundTickArgs,
  MarketOpenOrdersArgs,
  MarketOrderHistoryArgs,
  MarketPythRatingArgs,
  MarketTradeHistoryArgs,
  Maybe,
  Order,
  PythRating,
  Resolution as GqlResolution,
  Side,
} from "../generated/types";
import { generatePythRating, LATEST_PYTH_PRICE } from "../pyth";

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

export function resolutionToString(resolution: GqlResolution): Resolution {
  switch (resolution) {
    case GqlResolution.Seconds_15:
      return "15s";
    case GqlResolution.Minutes_1:
      return "1m";
    case GqlResolution.Minutes_5:
      return "5m";
    case GqlResolution.Minutes_15:
      return "15m";
    case GqlResolution.Hours_1:
      return "1h";
    case GqlResolution.Hours_4:
      return "4h";
    case GqlResolution.Days_1:
      return "1d";
    case GqlResolution.Weeks_1:
      return "1w";
    default:
      const _exhaustive_check: never = resolution;
      return _exhaustive_check;
  }
}

export function resolutionToSeconds(resolution: Resolution): number {
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

export const market = {
  async lastTradePrice({ baseCoinInfo, quoteCoinInfo }: Market) {
    return redisClient.get(
      `${baseCoinInfo.coinType}-${quoteCoinInfo.coinType}-last-trade-price`
    );
  },
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
      orderPlacedEventToOrder(order.order, market.baseCoinInfo, market.quoteCoinInfo)
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
    const fills = await market.fillHistory(owner);
    return fills
      .filter((fill) => fill.sequenceNumber.toNumber() % 2 === 0)
      .map((fill) =>
        orderFillEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
      );
  },
  high24h(parent: Market): Promise<Maybe<number>> {
    return analytic24h("high", parent);
  },
  async low24h(parent: Market): Promise<Maybe<number>> {
    return analytic24h("low", parent);
  },
  async volume24h(parent: Market): Promise<Maybe<number>> {
    return analytic24h("volume", parent);
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
    { baseCoinInfo, quoteCoinInfo }: Market,
    { resolution, from, to, countBack, firstDataRequest }: MarketBarsArgs
  ): Promise<Bar[]> {
    const key = `${baseCoinInfo.coinType}-${
      quoteCoinInfo.coinType
    }-bar-${resolutionToString(resolution)}`;
    const rawBars = (await redisClient.lRange(key, 0, -1)) ?? [];
    let bars = rawBars.map((bar) => JSON.parse(bar));

    // if firstDataRequest override to now, otherwise filter for to
    if (!firstDataRequest && !_.isNil(to)) {
      bars = bars.filter((bar) => bar.time < to * 1000);
    }
    if (!_.isNil(countBack)) {
      bars = _.takeRight(bars, countBack);
    } else if (!_.isNil(from)) {
      bars = bars.filter((bar) => bar.time >= from * 1000);
    }

    return _.sortedUniqBy(bars, (bar) => bar.time);
  },

  async pythRating(
    parent: Market,
    { price, side }: MarketPythRatingArgs
  ): Promise<Maybe<PythRating>> {
    const FAKE_MAPPING = fakeMapping(auxClient);
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
        // if (pythPrice === undefined) {
        //   const data = await pythClient.getData();
        //   const pythPriceObj = data.productPrice.get(pythSymbol);
        //   pythPrice = pythPriceObj!.price ?? pythPriceObj!.previousPrice;
        //   LATEST_PYTH_PRICE.set(pythSymbol, pythPrice);
        // }
      }
    }

    if (pythPrice === undefined) {
      return null;
    }

    if (side === Side.Buy) {
      const ratio = (price - pythPrice) / pythPrice;
      return generatePythRating({ ratio, price, redPct: 0.5, yellowPct: 0.1 });
    } else {
      const ratio = (pythPrice - price) / pythPrice;
      return generatePythRating({ ratio, price, redPct: 0.5, yellowPct: 0.1 });
    }
  },
};

async function analytic24h(
  name: "high" | "low" | "volume",
  market: Market
): Promise<Maybe<number>> {
  const value = redisClient.get(
    `${market.baseCoinInfo.coinType}-${market.quoteCoinInfo.coinType}-${name}-24h`
  );
  return value ? Number(value) : null;
}
