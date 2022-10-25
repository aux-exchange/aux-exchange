import type { Types } from "aptos";
import { withFilter } from "graphql-subscriptions";
import _ from "lodash";
import { pubsub } from "../connection";
import type {
  InputMaybe,
  MarketInput,
  PoolInput,
  SubscriptionBarArgs,
} from "../generated/types";

export const subscription = {
  swap: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["SWAP"]),
      poolInputsFilterFn
    ),
  },
  addLiquidity: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["ADD_LIQUIDITY"]),
      poolInputsFilterFn
    ),
  },
  removeLiquidity: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["REMOVE_LIQUIDITY"]),
      poolInputsFilterFn
    ),
  },
  orderbook: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["ORDERBOOK"]),
      marketInputsFilterFn
    ),
  },
  trade: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["TRADE"]),
      marketInputsFilterFn
    ),
  },
  lastTradePrice: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["LAST_TRADE_PRICE"]),
      marketInputsFilterFn
    ),
  },
  bar: {
    resolve: _.identity,
    subscribe: withFilter(
      () => pubsub.asyncIterator(["BAR"]),
      (payload: any, variables: SubscriptionBarArgs) =>
        marketInputsFilterFn(payload, variables) &&
        payload.resolution === variables.resolution
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
    poolInputs.find(
      (k) =>
        k.coinTypeX === payload.coinTypeX && k.coinTypeY === payload.coinTypeY
    ) !== undefined
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
    marketInputs.find(
      (k: any) =>
        k.baseCoinType === payload.baseCoinType &&
        k.quoteCoinType === payload.quoteCoinType
    ) !== undefined
  );
}
