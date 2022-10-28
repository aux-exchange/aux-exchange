import _ from "lodash";
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
import { auxClient, pythClient, redisClient } from "../connection";
import { orderEventToOrder, orderToOrder } from "../conversion";
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
  PythRatingColor,
  Resolution as GqlResolution,
  Side,
} from "../generated/types";
import { LATEST_PYTH_PRICE } from "../pyth";

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
  ): Promise<Array<Bar>> {
    const key = `${baseCoinInfo.coinType}-${
      quoteCoinInfo.coinType
    }-bar-${resolutionToString(resolution)}`;
    const rawBars = (await redisClient.lRange(key, 0, -1)) ?? [];
    const startTime = parseFloat(from);
    const endTime = parseFloat(to);
    // TODO: Perform actual indexing. For small numbers of bars this should be okay.
    let bars = rawBars
      .map((bar) => JSON.parse(bar))
      .filter(
        (bar) =>
          parseFloat(bar.time) >= startTime &&
          (firstDataRequest || parseFloat(bar.time) < endTime)
      );
    const firstIndex = bars.length - countBack;
    bars = bars.slice(firstIndex >= 0 ? firstIndex : 0);
    return _(bars)
      .reverse()
      .sortedUniqBy((bar) => bar.time)
      .reverse()
      .value();
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

async function analytic24h(
  name: "high" | "low" | "volume",
  market: Market
): Promise<Maybe<number>> {
  const value = redisClient.get(
    `${market.baseCoinInfo.coinType}-${market.quoteCoinInfo.coinType}-${name}-24h`
  );
  return value ? Number(value) : null;
}
