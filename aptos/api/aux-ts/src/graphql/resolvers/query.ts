import type { Types } from "aptos";
import axios from "axios";
import { BN } from "bn.js";
import _ from "lodash";
import * as aux from "../../";
import { poolEvents, pools } from "../../amm/core/query";
import { ALL_FAKE_COINS } from "../../coin";
import { auxClient, redisClient } from "../connection";
import {
  Account,
  CoinInfo,
  FeaturedStatus,
  Market,
  Maybe,
  Pool,
  QueryAccountArgs,
  QueryMarketArgs,
  QueryMarketsArgs,
  QueryPoolArgs,
  QueryPoolsArgs,
  SummaryMetrics,
} from "../generated/types";
import { getRecognizedTVL } from "../pyth";

const HOT_POOLS: Array<[string, string]> = [];
const PROMOTED_POOLS: Array<[string, string]> = [];
export type Resolution =
  | "15s"
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d"
  | "1w";
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

async function coinsWithoutLiquidity(): Promise<CoinInfo[]> {
  if (process.env["APTOS_PROFILE"] === "devnet") {
    return Promise.all(
      [
        [auxClient.getCoinInfo("0x1::aptos_coin::AptosCoin")],
        ALL_FAKE_COINS.map((fakeCoin) => auxClient.getFakeCoinInfo(fakeCoin)),
      ].flat()
    );
  }
  let rawCoins = await redisClient.get("hippo-coin-list");
  let coins;
  if (_.isNull(rawCoins)) {
    const url =
      "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json";
    coins = (await axios.get(url)).data;
    await Promise.all([
      redisClient.set("hippo-coin-list", JSON.stringify(coins)),
      redisClient.expire("hippo-coin-list", 60),
    ]);
  } else {
    coins = JSON.parse(rawCoins);
  }

  return coins.map((coin: any) => {
    // The feature priority of a token is the max feature priority of the
    // pools that include it.
    const recognizedLiquidity = 0;
    const auLiquidity = 0;
    const priority = 0;
    return {
      coinType: coin.token_type.type,
      decimals: coin.decimals,
      name: coin.name,
      symbol: coin.symbol,
      priority,
      recognizedLiquidity,
      auLiquidity,
    };
  });
}

export const query = {
  address() {
    return auxClient.moduleAddress;
  },

  async summaryMetrics(_parent: any): Promise<SummaryMetrics> {
    const allPools = await pools(auxClient);
    const now = Date.now();
    const nowMinus7D = now - 7 * 24 * 60 * 60 * 1000;
    const nowMinus24H = now - 24 * 60 * 60 * 1000;

    let dollarTVL = 0;
    let dollarVolume7D = 0;
    let dollarVolume24H = 0;
    let transactions7D = 0;
    let transactions24H = 0;
    let allUsers7D = new Set<string>();
    let allUsers24H = new Set<string>();

    for (const pool of allPools) {
      const loadedPool = await aux.Pool.read(auxClient, {
        coinTypeX: pool.coinTypeX,
        coinTypeY: pool.coinTypeY,
      });
      if (loadedPool === undefined) {
        continue;
      } else {
        dollarTVL += getRecognizedTVL(
          pool.coinTypeX,
          loadedPool.amountX.toNumber()
        );
        dollarTVL += getRecognizedTVL(
          pool.coinTypeY,
          loadedPool.amountY.toNumber()
        );
      }

      const allEvents = await poolEvents(auxClient, pool, {
        start: new BN(0),
      });
      for (const event of allEvents) {
        if (event.type == "SwapEvent") {
          const eventMilliseconds = event.timestamp.toNumber() / 1000;
          if (eventMilliseconds < nowMinus7D) {
            continue;
          }
          const inUSD = getRecognizedTVL(
            event.inCoinType,
            (
              await auxClient.toDecimalUnits(event.inCoinType, event.in)
            ).toNumber()
          );
          const outUSD = getRecognizedTVL(
            event.outCoinType,
            (
              await auxClient.toDecimalUnits(event.outCoinType, event.out)
            ).toNumber()
          );
          const tradeUSD = Math.max(inUSD, outUSD);
          dollarVolume7D += tradeUSD;
          transactions7D++;
          allUsers7D.add(event.senderAddr.toString());
          if (eventMilliseconds >= nowMinus24H) {
            dollarVolume24H += tradeUSD;
            transactions24H++;
            allUsers24H.add(event.senderAddr.toString());
          }
        }
      }
    }

    return {
      dollarTVL,
      dollarVolume7D,
      dollarVolume24H,
      transactions7D,
      transactions24H,
      users7D: allUsers7D.size,
      users24H: allUsers24H.size,
    };
  },

  async coins(parent: any): Promise<CoinInfo[]> {
    const coins = await coinsWithoutLiquidity();

    // The "liquidity" of a coin is defined as the sum of the liquidity of the
    // pools that trade it.
    const allPools = await this.pools(parent, {});
    const coinInfo = new Map();
    for (const pool of allPools) {
      for (const coin of [pool!.coinInfoX.coinType, pool!.coinInfoY.coinType]) {
        if (!coinInfo.has(coin)) {
          coinInfo.set(coin, {
            recognizedLiquidity: (pool as any).recognizedLiquidity,
            auLiquidity: (pool as any).auLiquidity,
            priority: getFeaturedPriority(pool.featuredStatus),
          });
        } else {
          const info = coinInfo.get(coin);
          info.recognizedLiquidity += (pool as any).recognizedLiquidity;
          info.auLiquidity += (pool as any).auLiquidity;
          info.priority = Math.max(
            info.priority,
            getFeaturedPriority(pool.featuredStatus)
          );
        }
      }
    }

    const allCoins = coins.map((coin: CoinInfo) => {
      const coinType = coin.coinType;
      // The feature priority of a token is the max feature priority of the
      // pools that include it.
      const thisCoinInfo = coinInfo.get(coinType);
      const recognizedLiquidity =
        thisCoinInfo === undefined ? 0 : thisCoinInfo.recognizedLiquidity;
      const auLiquidity =
        thisCoinInfo === undefined ? 0 : thisCoinInfo.auLiquidity;
      const priority = thisCoinInfo === undefined ? 0 : thisCoinInfo.priority;
      return {
        coinType: coin.coinType,
        decimals: coin.decimals,
        name: coin.name,
        symbol: coin.symbol,
        priority,
        recognizedLiquidity,
        auLiquidity,
      };
    });
    allCoins.sort((lhs: any, rhs: any) => {
      if (lhs.priority != rhs.priority) {
        return rhs.priority - lhs.priority;
      }
      if (lhs.recognizedLiquidity != rhs.recognizedLiquidity) {
        return rhs.recognizedLiquidity - lhs.recognizedLiquidity;
      }
      if (lhs.auLiquidity != rhs.auLiquidity) {
        return rhs.auLiquidity - lhs.auLiquidity;
      }
      return lhs.symbol.toLowerCase().localeCompare(rhs.symbol.toLowerCase());
    });
    return allCoins;
  },
  async pool(_parent: any, { poolInput }: QueryPoolArgs): Promise<Maybe<Pool>> {
    const pool = await aux.Pool.read(auxClient, poolInput);
    if (pool === undefined) {
      return null;
    }
    const coins = await coinsWithoutLiquidity();
    const coinTypeToHippoNameSymbol = Object.fromEntries(
      coins.map((coin) => [coin.coinType, [coin.name, coin.symbol]])
    );
    // @ts-ignore
    return formatPool(pool, coinTypeToHippoNameSymbol);
  },
  async pools(_parent: any, args: QueryPoolsArgs): Promise<Pool[]> {
    const poolReadParams = args.poolInputs
      ? args.poolInputs
      : (await aux.Pool.index(auxClient));
    const pools = await Promise.all(
      poolReadParams.map((poolReadParam) =>
        aux.Pool.read(auxClient, poolReadParam)
      )
    );
    const hippoCoins = await coinsWithoutLiquidity();
    const coinTypeToHippoNameSymbol = Object.fromEntries(
      hippoCoins.map((coin: any) => [coin.coinType, [coin.name, coin.symbol]])
    );
    const formattedPools = pools
      .filter((maybePool) => maybePool !== undefined && maybePool !== null)
      .map((pool) => formatPool(pool!, coinTypeToHippoNameSymbol));

    // List hot pools first, then order by recognized liquidity, then by atomic
    // units of liquidity.
    formattedPools.sort((lhs, rhs) => {
      if (lhs.featuredStatus != rhs.featuredStatus) {
        return (
          getFeaturedPriority(rhs.featuredStatus) -
          getFeaturedPriority(lhs.featuredStatus)
        );
      }
      if (lhs.recognizedLiquidity != rhs.recognizedLiquidity) {
        return rhs.recognizedLiquidity - lhs.recognizedLiquidity;
      }
      return rhs.auLiquidity - lhs.auLiquidity;
    });
    // @ts-ignore
    return formattedPools;
  },
  async market(
    _parent: any,
    { marketInput }: QueryMarketArgs
  ): Promise<Maybe<Market>> {
    let market: aux.Market;
    try {
      market = await aux.Market.read(auxClient, marketInput);
    } catch (err) {
      return null;
    }
    const { baseCoinType, quoteCoinType } = marketInput;
    // @ts-ignore
    return {
      name: `${market.baseCoinInfo.symbol}-${market.quoteCoinInfo.symbol}`,
      baseCoinInfo: market.baseCoinInfo,
      quoteCoinInfo: market.quoteCoinInfo,
      lotSize: market.lotSize.toNumber(),
      tickSize: market.tickSize.toNumber(),
      lotSizeDecimals: market.lotSize
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toString(),
      tickSizeDecimals: market.tickSize
        .toDecimalUnits(market.quoteCoinInfo.decimals)
        .toString(),
      lotSizeString: market.lotSize.toString(),
      tickSizeString: market.tickSize.toString(),
      orderbook: {
        baseCoinType,
        quoteCoinType,
        bids: market.l2.bids.map((l2Quote) => ({
          price: l2Quote.price.toNumber(),
          quantity: l2Quote.quantity.toNumber(),
        })),
        asks: market.l2.asks.map((l2Quote) => ({
          price: l2Quote.price.toNumber(),
          quantity: l2Quote.quantity.toNumber(),
        })),
      },
    };
  },
  async markets(_parent: any, args: QueryMarketsArgs): Promise<Market[]> {
    const markets = await aux.clob.core.query.markets(auxClient);
    const marketInputs = args.marketInputs;
    const auxCoinInfo = await auxClient.getCoinInfo(
      `${auxClient.moduleAddress}::aux_coin::AuxCoin`
    );
    if (marketInputs === undefined || marketInputs === null) {
      // @ts-ignore
      return (
        await Promise.all(
          markets.map((market) =>
            aux.Market.read(auxClient, {
              baseCoinType: market.baseCoinType,
              quoteCoinType: market.quoteCoinType,
            })
          )
        )
      ).map((market) => {
        return {
          name: `${market.baseCoinInfo.symbol}-${market.quoteCoinInfo.symbol}`,
          baseCoinInfo: market.baseCoinInfo,
          quoteCoinInfo: market.quoteCoinInfo,
          lotSize: market.lotSize.toNumber(),
          tickSize: market.tickSize.toNumber(),
          auxCoinInfo,
          orderbook: {
            bids: market.l2.bids.map((l2Quote) => ({
              price: l2Quote.price.toNumber(),
              quantity: l2Quote.quantity.toNumber(),
            })),
            asks: market.l2.asks.map((l2Quote) => ({
              price: l2Quote.price.toNumber(),
              quantity: l2Quote.quantity.toNumber(),
            })),
          },
        };
      });
    } else {
      // @ts-ignore
      return (
        await Promise.all(
          marketInputs.map((marketInput) =>
            aux.Market.read(auxClient, marketInput)
          )
        )
      )
        .filter(
          (maybeMarket) => maybeMarket !== undefined && maybeMarket !== null
        )
        .map((market) => {
          return {
            name: `${market.baseCoinInfo.name}-${market.quoteCoinInfo.name}`,
            baseCoinInfo: market.baseCoinInfo,
            quoteCoinInfo: market.quoteCoinInfo,
            lotSize: market.lotSize.toNumber(),
            tickSize: market.tickSize.toNumber(),
            auxCoinInfo,
            orderbook: {
              bids: market.l2.bids.map((l2Quote) => ({
                price: l2Quote.price.toNumber(),
                quantity: l2Quote.quantity.toNumber(),
              })),
              asks: market.l2.asks.map((l2Quote) => ({
                price: l2Quote.price.toNumber(),
                quantity: l2Quote.quantity.toNumber(),
              })),
            },
          };
        });
    }
  },
  async account(_parent: any, { owner }: QueryAccountArgs): Promise<Account> {
    const auxAccount = await auxClient.getAccountResourceOptional(
      owner,
      `${auxClient.moduleAddress}::vault::AuxUserAccount`
    );

    // @ts-ignore
    return {
      address: owner,
      hasAuxAccount: auxAccount !== undefined,
    };
  },
};
function getFeaturedPriority(status: FeaturedStatus): number {
  switch (status) {
    case FeaturedStatus.None:
      return 0;
    case FeaturedStatus.Hot:
      return 1;
    case FeaturedStatus.Promoted:
      return 2;
  }
}

function formatPool(
  pool: aux.Pool,
  coinTypeToHippoNameSymbol: Record<Types.Address, [string, string]>
) {
  let featuredStatus = FeaturedStatus.None;
  for (const [x, y] of PROMOTED_POOLS) {
    if (
      (pool.coinInfoX.coinType == x && pool.coinInfoY.coinType == y) ||
      (pool.coinInfoX.coinType == y && pool.coinInfoY.coinType == x)
    ) {
      featuredStatus = FeaturedStatus.Promoted;
      break;
    }
  }
  if (featuredStatus == FeaturedStatus.None) {
    for (const [x, y] of HOT_POOLS) {
      if (
        (pool.coinInfoX.coinType == x && pool.coinInfoY.coinType == y) ||
        (pool.coinInfoX.coinType == y && pool.coinInfoY.coinType == x)
      ) {
        featuredStatus = FeaturedStatus.Hot;
        break;
      }
    }
  }

  const recognizedLiquidity = Math.max(
    getRecognizedTVL(pool.coinInfoX.coinType, pool.amountX.toNumber()),
    getRecognizedTVL(pool.coinInfoY.coinType, pool.amountY.toNumber())
  );

  const auLiquidity = Math.max(
    pool.amountAuX.toNumber(),
    pool.amountAuY.toNumber()
  );

  const coinXNameSymbol = coinTypeToHippoNameSymbol[pool.coinInfoX.coinType];
  const coinInfoX = pool.coinInfoX;
  if (!_.isUndefined(coinXNameSymbol)) {
    const [name, symbol] = coinXNameSymbol;
    coinInfoX.name = name;
    coinInfoX.symbol = symbol;
  }

  const coinYNameSymbol = coinTypeToHippoNameSymbol[pool.coinInfoY.coinType];
  const coinInfoY = pool.coinInfoY;
  if (!_.isUndefined(coinYNameSymbol)) {
    const [name, symbol] = coinYNameSymbol;
    coinInfoY.name = name;
    coinInfoY.symbol = symbol;
  }

  return {
    coinInfoX,
    coinInfoY,
    coinInfoLP: pool.coinInfoLP,
    amountX: pool.amountX.toNumber(),
    amountY: pool.amountY.toNumber(),
    amountLP: pool.amountLP.toNumber(),
    feePercent: pool.feePct,
    featuredStatus,
    recognizedLiquidity,
    auLiquidity,
  };
}
