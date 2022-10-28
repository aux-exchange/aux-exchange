// import * as redis from "redis";
// import { FakeCoin } from "../client";

// import axios from "axios";
// import { RedisPubSub } from "graphql-redis-subscriptions";
// import { auxClient } from "../graphql/connection";
// import { Resolution } from "../graphql/generated/types";

// const redisClient = redis.createClient();
// redisClient.on("error", (err) => console.error("[Redis]", err));
// const redisPubSub = new RedisPubSub();
// redisPubSub;

// async function main() {
//   await redisClient.connect();
//   // const baseCoinType = "0x1::aptos_coin::AptosCoin";
//   const baseCoinType = auxClient.getWrappedFakeCoinType(FakeCoin.ETH);
//   const quoteCoinType = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
//   // await redisClient.flushAll();
//   const now = Date.now();
//   const n = 100;
//   const start = now - (now % 60_000) - n * 60_000;
//   const bars = (
//     await axios.get(`https://ftx.com/api/markets/APT/USD/candles`, {
//       params: {
//         resolution: 60,
//         start_time: Math.floor(start / 1000).toString(),
//         end_time: Math.floor(now / 1000).toString(),
//       },
//     })
//   ).data.result;
//   //   for (const i of _.range(n)) {
//   for (let bar of bars) {
//     bar = {
//       baseCoinType,
//       quoteCoinType,
//       resolution: Resolution.Minutes_1,
//       ohlcv: bar,
//       time: bar.time,
//     };
//     Resolution;
//     // const bar = {
//     //   baseCoinType,
//     //   quoteCoinType,
//     //   resolution: Resolution.Minutes_1,
//     //   time: start + i * 60_000,
//     //   ohlcv: {
//     //     open: 9 - Math.random(),
//     //     high: 9 + Math.random(),
//     //     low: 8 - Math.random(),
//     //     close: 8 + Math.random(),
//     //     volume: Math.random() * 10_000,
//     //   },
//     // };
//     await Promise.all([
//       redisPubSub.publish("BAR", JSON.stringify(bar)),
//       redisClient.rPush(
//         `${baseCoinType}-${quoteCoinType}-bar-1m`,
//         JSON.stringify(bar)
//       ),
//     ]);
//   }
//   await redisClient.disconnect();
// }
