import type { Types } from "aptos";
import { withFilter } from "graphql-subscriptions";
import _ from "lodash";
import { redisPubSub } from "../client";
import type {
  InputMaybe,
  MarketInput,
  PoolInput,
  SubscriptionBarArgs,
  SubscriptionHigh24hArgs,
  SubscriptionLow24hArgs,
  SubscriptionVolume24hArgs,
} from "../generated/types";
import { resolutionToString } from "./market";

export const subscription = {
  swap: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["SWAP"]),
      poolInputsFilterFn
    ),
  },
  addLiquidity: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["ADD_LIQUIDITY"]),
      poolInputsFilterFn
    ),
  },
  removeLiquidity: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["REMOVE_LIQUIDITY"]),
      poolInputsFilterFn
    ),
  },
  orderbook: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["ORDERBOOK"]),
      marketInputsFilterFn
    ),
  },
  trade: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["TRADE"]),
      marketInputsFilterFn
    ),
  },
  lastTradePrice: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["LAST_TRADE_PRICE"]),
      marketInputsFilterFn
    ),
  },
  bar: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["BAR"]),
      (payload: any, variables: SubscriptionBarArgs) =>
        marketInputsFilterFn(payload, variables) &&
        payload.resolution === resolutionToString(variables.resolution)
    ),
  },
  high24h: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["HIGH_24H"]),
      (payload: any, variables: SubscriptionHigh24hArgs) =>
        marketInputsFilterFn(payload, variables)
    ),
  },
  low24h: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["LOW_24H"]),
      (payload: any, variables: SubscriptionLow24hArgs) =>
        marketInputsFilterFn(payload, variables)
    ),
  },
  volume24h: {
    resolve: _.identity,
    subscribe: withFilter(
      () => redisPubSub.asyncIterator(["VOLUME_24H"]),
      (payload: any, variables: SubscriptionVolume24hArgs) =>
        marketInputsFilterFn(payload, variables)
    ),
  },
};

function poolInputsFilterFn(
  payload: { coinTypeX: Types.MoveStructTag; coinTypeY: Types.MoveStructTag },
  {
    poolInputs,
  }: {
    poolInputs?: InputMaybe<Array<PoolInput>>;
  }
) {
  return (
    _.isNull(poolInputs) ||
    _.isUndefined(poolInputs) ||
    _.some(
      poolInputs,
      ({ coinTypes }) =>
        coinTypes[0] === payload.coinTypeX && coinTypes[1] === payload.coinTypeY
    )
  );
}

function marketInputsFilterFn(
  payload: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  },
  {
    marketInputs,
  }: {
    marketInputs?: InputMaybe<Array<MarketInput>>;
  }
) {
  return (
    _.isNull(marketInputs) ||
    _.isUndefined(marketInputs) ||
    _.some(
      marketInputs,
      ({ baseCoinType, quoteCoinType }) =>
        baseCoinType === payload.baseCoinType &&
        quoteCoinType === payload.quoteCoinType
    )
  );
}
