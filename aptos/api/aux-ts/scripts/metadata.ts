import { parseMarketType } from "../src/clob/core/query";
import { parsePoolType } from "../src/amm/core/query";
import { AuxClient, FakeCoin } from "../src/client";

async function main() {
  const [auxClient, moduleAuthority] = AuxClient.createFromEnvForTesting({});
  const moduleAddress = auxClient.moduleAddress;
  const resources = await auxClient.aptosClient.getAccountResources(
    auxClient.moduleAddress
  );
  const pools = [];
  const markets = [];
  const coinInfos = [];
  for (const resource of resources) {
    if (resource.type.includes("Pool")) {
      pools.push(parsePoolType(resource.type));
    } else if (resource.type.includes("Market")) {
      markets.push(parseMarketType(resource.type));
    } else if (
      resource.type.includes("CoinInfo") &&
      !resource.type.includes("LP")
    ) {
      coinInfos.push(resource.type);
    }
  }
  const metadata = {
    moduleAuthority,
    moduleAddress,
    pools,
    markets,
    coinInfos,
  };
  console.log(metadata);
  console.log("=== GraphQL Variables ===");
  console.log(
    JSON.stringify(
      {
        poolInputs: [
          {
            coinTypeX: auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
            coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
          },
          {
            coinTypeX: auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
            coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
          },
        ],
        marketInputs: [
          {
            baseCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
            quoteCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
          },
          {
            baseCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
            quoteCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
          },
        ],
        owner: moduleAuthority.address().toString(),
      },
      undefined,
      4
    )
  );
}

main();
