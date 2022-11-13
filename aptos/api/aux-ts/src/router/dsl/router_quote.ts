import { HexString, Types } from "aptos";
import type { SwapEvent } from "../../pool/constant-product/schema";
import type { AuxTransaction } from "../../client";
import { AtomicUnits, AU } from "../..//units";
import type { AuxClient, CoinInfo } from "../../client";
import type { OrderFillEvent } from "../../clob/core/events";
import type { RouterEvent } from "../core/mutation";
import _ from "lodash";

export interface RouterQuote {
  type: "ExactIn" | "ExactOut";
  sender: HexString;
  coinIn: Types.MoveStructTag;
  coinOut: Types.MoveStructTag;
  amount: AtomicUnits;
  expirationTimestampSecs: string;
  timestamp: string;
  estGasAmount: string;
  estGasPrice: string;
  routes: Route[];
}

export interface Route {
  venue: "CLOB" | "AMM";
  coinIn: Types.MoveStructTag;
  coinOut: Types.MoveStructTag;
  amountIn: AtomicUnits;
  amountOut: AtomicUnits;
  feeAmount: AtomicUnits;
  rebateAmount: AtomicUnits;
  feeOrRebateCurrency: Types.MoveStructTag;

  // Initial price
  // For AMM: priceNum = reserveIn, priceDenom = reserveOut
  // For CLOB:
  //  if bid: priceNum = initial price, priceDenom = 10^(base decimals)
  //  if ask: priceNum = 10^(base decimals), priceDenom = initial price
  initPriceNum: number;
  initPriceDenom: number;
  priceImpactPct: number;
}

export async function getRouterQuote(
  auxClient: AuxClient,
  type: "ExactIn" | "ExactOut",
  txResult: AuxTransaction<RouterEvent[]>,
  combine: boolean,
  coinIn: Types.MoveStructTag,
  coinOut: Types.MoveStructTag
): Promise<AuxTransaction<RouterQuote>> {
  const tx = txResult.transaction;
  if (_.isUndefined(txResult.result)) {
    return { transaction: tx, result: undefined };
  }
  let quote: RouterQuote = {
    type,
    sender: new HexString(tx.sender),
    coinIn,
    coinOut,
    amount: AU(0),
    expirationTimestampSecs: tx.expiration_timestamp_secs,
    timestamp: tx.timestamp,
    estGasAmount: tx.gas_used,
    estGasPrice: tx.gas_unit_price,
    routes: [],
  };
  for (let event of txResult.result) {
    let route: Route;
    if ("owner" in event) {
      if (event.owner.toString() !== quote.sender.toString()) {
        continue;
      }
      route = await orderFillEventToRoute(auxClient, event, coinIn, coinOut);
    } else {
      route = swapEventToRoute(event);
    }
    // Update total amount
    if (type == "ExactIn") {
      quote.amount = AU(quote.amount.toNumber() + route.amountOut.toNumber());
    } else {
      quote.amount = AU(quote.amount.toNumber() + route.amountIn.toNumber());
    }

    // Update route
    if (combine) {
      let maybeRoute = quote.routes.find((r) => {
        return (
          r.coinIn === route.coinIn &&
          r.coinOut === route.coinOut &&
          r.venue === route.venue
        );
      });
      // If a route for this pool/market already exists, update it
      if (maybeRoute !== undefined) {
        // update amounts in/out
        maybeRoute.amountIn = AU(
          maybeRoute.amountIn.toNumber() + route.amountIn.toNumber()
        );
        maybeRoute.amountOut = AU(
          maybeRoute.amountOut.toNumber() + route.amountOut.toNumber()
        );

        // update initial price and price impact (AMM)
        if (
          route.initPriceNum < maybeRoute.initPriceNum ||
          route.initPriceDenom > maybeRoute.initPriceDenom
        ) {
          maybeRoute.initPriceNum = route.initPriceNum;
          maybeRoute.initPriceDenom = route.initPriceDenom;
        }
        let initPrice = maybeRoute.initPriceNum / maybeRoute.initPriceDenom;
        let finalPrice =
          maybeRoute.amountIn.toNumber() / maybeRoute.amountOut.toNumber();
        maybeRoute.priceImpactPct =
          ((finalPrice - initPrice) / initPrice) * 100;
        continue;
      }
    }
    quote.routes.push(route);
  }
  return { transaction: tx, result: quote };
}

function swapEventToRoute(swapEvent: SwapEvent): Route {
  let initPrice =
    swapEvent.reserveIn.toNumber() / swapEvent.reserveOut.toNumber();
  let finalPrice =
    (swapEvent.reserveIn.toNumber() + swapEvent.amountIn.toNumber()) /
    (swapEvent.reserveOut.toNumber() - swapEvent.amountOut.toNumber());
  let priceImpactPct = ((finalPrice - initPrice) / initPrice) * 100;
  return {
    venue: "AMM",
    coinIn: swapEvent.coinTypeIn,
    coinOut: swapEvent.coinTypeOut,
    amountIn: swapEvent.amountIn,
    amountOut: swapEvent.amountOut,
    feeAmount: AU((swapEvent.feeBps * swapEvent.amountIn.toNumber()) / 10000),
    rebateAmount: AU(0),
    feeOrRebateCurrency: swapEvent.coinTypeIn,
    initPriceNum: swapEvent.reserveIn.toNumber(),
    initPriceDenom: swapEvent.reserveOut.toNumber(),
    priceImpactPct,
  };
}

async function orderFillEventToRoute(
  auxClient: AuxClient,
  fillEvent: OrderFillEvent,
  coinIn: Types.MoveStructTag,
  coinOut: Types.MoveStructTag
): Promise<Route> {
  let amountIn: AtomicUnits;
  let amountOut: AtomicUnits;
  let initPriceNum: number;
  let initPriceDenom: number;
  let baseCoinInfo: CoinInfo;
  let quoteCoinInfo: CoinInfo;
  if (fillEvent.isBid) {
    // Buying base with quote
    baseCoinInfo = await auxClient.getCoinInfo(coinOut);
    quoteCoinInfo = await auxClient.getCoinInfo(coinIn);
    const baseDecimals = baseCoinInfo.decimals;
    amountIn = AU(
      (fillEvent.price.toNumber() * fillEvent.baseQuantity.toNumber()) /
        Math.pow(10, baseDecimals) +
        fillEvent.fee.toNumber() -
        fillEvent.rebate.toNumber()
    );
    amountOut = fillEvent.baseQuantity;
    initPriceNum = fillEvent.price.toNumber();
    initPriceDenom = Math.pow(10, baseDecimals);
  } else {
    // Selling base for quote
    baseCoinInfo = await auxClient.getCoinInfo(coinIn);
    quoteCoinInfo = await auxClient.getCoinInfo(coinIn);
    const baseDecimals = baseCoinInfo.decimals;
    amountIn = fillEvent.baseQuantity;
    amountOut = AU(
      (fillEvent.price.toNumber() * fillEvent.baseQuantity.toNumber()) /
        Math.pow(10, baseDecimals) -
        fillEvent.fee.toNumber() +
        fillEvent.rebate.toNumber()
    );
    initPriceNum = Math.pow(10, baseDecimals);
    initPriceDenom = fillEvent.price.toNumber();
  }
  return {
    venue: "CLOB",
    coinIn,
    coinOut,
    amountIn,
    amountOut,
    feeAmount: fillEvent.fee,
    rebateAmount: fillEvent.rebate,
    feeOrRebateCurrency: quoteCoinInfo.coinType,
    initPriceNum,
    initPriceDenom,
    priceImpactPct: 0, // priceImpact is always 0 for a single fill, since it never includes multiple price levels
  };
}
