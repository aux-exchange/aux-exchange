// import * as redis from "redis";
// import { FakeCoin } from "../client";

// import _ from "lodash";
// import { auxClient } from "../graphql/connection";
// import { RESOLUTIONS } from "../graphql/resolvers/query";

// const redisClient = redis.createClient();
// redisClient.on("error", (err) => console.error("[Redis]", err));

// async function main() {
//   await redisClient.connect();
//   // const baseCoinType = "0x1::aptos_coin::AptosCoin";
//   const baseCoinType = auxClient.getWrappedFakeCoinType(FakeCoin.ETH);
//   const quoteCoinType = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
//   for (const resolution of RESOLUTIONS) {
//     let bars = await redisClient.lRange(
//       `${baseCoinType}-${quoteCoinType}-bar-${resolution}`,
//       0,
//       -1
//     );
//     bars = bars.map((bar) => JSON.parse(bar));
//     bars = _(bars)
//       .reverse()
//       .sortedUniqBy((bar: any) => bar.time)
//       .reverse()
//       .map((bar) => JSON.stringify(bar))
//       .value();

//     await Promise.all([
//       redisClient.lPopCount(
//         `${baseCoinType}-${quoteCoinType}-bar-${resolution}`,
//         bars.length
//       ),
//       redisClient.rPush(
//         `${baseCoinType}-${quoteCoinType}-bar-${resolution}`,
//         bars
//       ),
//     ]);
//   }

//   await redisClient.disconnect();
// }
