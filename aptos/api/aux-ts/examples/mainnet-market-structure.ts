// Demo of how to retrieve market metadata from the raw RPC API.
// Run with: yarn ts-node mainnet-market-structure.ts
import axios from "axios";

// This is the deployed address, found in the README.md.
const ADDRESS =
  "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541";

// Pools are parameterized by the two assets.
const POOL_REGEX = new RegExp(
  `${ADDRESS}::amm::Pool<(?<first>.*), (?<second>.*)>`
);

// Markets are parameterized by base and quote.
const MARKET_REGEX = new RegExp(
  `${ADDRESS}::clob_market::Market<(?<base>.*), (?<quote>.*)>`
);

async function main() {
  const resources = await axios.get(
    `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${ADDRESS}/resources`
  );
  const pools = resources.data.filter((x: any) => {
    return x.type.startsWith(`${ADDRESS}::amm::Pool<`);
  });
  const markets = resources.data.filter((x: any) => {
    return x.type.startsWith(`${ADDRESS}::clob_market::Market<`);
  });

  // We only print the first pool for brevity.
  for (const pool of pools) {
    console.log(pool);
    const found = pool.type.match(POOL_REGEX);
    console.log("X coin: ", found.groups.first);
    console.log("Y coin: ", found.groups.second);

    // Example of querying coin info for X. You can do the same for Y.
    const xAddress = found.groups.first.split("::")[0];
    const coinInfo = await axios.get(
      `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${xAddress}/resource/0x1::coin::CoinInfo<${found.groups.first}>`
    );
    console.log("X coin info: ", coinInfo.data);
    break;
  }

  // We only print the first market for brevity.
  for (const market of markets) {
    console.log(market);
    const found = market.type.match(MARKET_REGEX);
    console.log("base coin: ", found.groups.base);
    console.log("quote coin: ", found.groups.quote);
    console.log("base coin decimals: ", market.data.base_decimals);
    console.log("quote coin decimals: ", market.data.quote_decimals);
    console.log("base lot size: ", market.data.lot_size);
    console.log("quote tick size: ", market.data.tick_size);
    break;
  }
}

main();
