import { withFilter } from "graphql-subscriptions";
import { pubsub } from "../connection";

export const subscription = {
  swap: {
    resolve: (payload: any) => {
      return payload;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["SWAP"]),
      (payload: any, variables: any) => {
        return (
          variables.poolInputs.find(
            (k: any) =>
              k.coinTypeX === payload.coinTypeX &&
              k.coinTypeY === payload.coinTypeY
          ) !== undefined
        );
      }
    ),
  },
  addLiquidity: {
    resolve: (payload: any) => {
      return payload;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["ADD_LIQUIDITY"]),
      (payload: any, variables: any) => {
        return (
          variables.poolInputs.find(
            (k: any) =>
              k.coinTypeX === payload.coinTypeX &&
              k.coinTypeY === payload.coinTypeY
          ) !== undefined
        );
      }
    ),
  },
  removeLiquidity: {
    resolve: (payload: any) => {
      return payload;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["REMOVE_LIQUIDITY"]),
      (payload: any, variables: any) => {
        return (
          variables.poolInputs.find(
            (k: any) =>
              k.coinTypeX === payload.coinTypeX &&
              k.coinTypeY === payload.coinTypeY
          ) !== undefined
        );
      }
    ),
  },
  orderbook: {
    resolve: (payload: any) => {
      return payload;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["ORDERBOOK"]),
      (payload: any, variables: any) => {
        return (
          variables.marketInputs.find(
            (k: any) =>
              k.baseCoinType === payload.baseCoinType &&
              k.quoteCoinType === payload.quoteCoinType
          ) !== undefined
        );
      }
    ),
  },
  trade: {
    resolve: (payload: any) => {
      return payload;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["TRADE"]),
      (payload: any, variables: any) => {
        return (
          variables.marketInputs.find(
            (k: any) =>
              k.baseCoinType === payload.baseCoinType &&
              k.quoteCoinType === payload.quoteCoinType
          ) !== undefined
        );
      }
    ),
  },
  lastTradePrice: {
    resolve: (payload: any) => {
      return payload.price;
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator(["LAST_TRADE_PRICE"]),
      (payload: any, variables: any) => {
        return (
          variables.marketInputs.find(
            (k: any) =>
              k.baseCoinType === payload.baseCoinType &&
              k.quoteCoinType === payload.quoteCoinType
          ) !== undefined
        );
      }
    ),
  },
};
