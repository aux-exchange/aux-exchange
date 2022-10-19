import _ from "lodash";
import * as aux from "../../";
import { auxClient } from "../connection";
import type {
  Account,
  Market,
  Maybe,
  Pool,
  QueryAccountArgs,
  QueryMarketArgs,
  QueryMarketsArgs,
  QueryPoolArgs,
  QueryPoolsArgs,
} from "../generated/types";

const APT = "0x1::aptos_coin::AptosCoin";
const USDC =
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T";
const SOL =
  "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T";
const WETH =
  "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T";
const WBTC =
  "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T";
const USDA =
  "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA";
const USDCsol = "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T"

const MAINNET_COINS = [APT, USDC, SOL, WETH, WBTC, USDA, USDCsol];

export const query = {
  address() {
    return auxClient.moduleAddress;
  },
  async pool(_parent: any, { poolInput }: QueryPoolArgs): Promise<Maybe<Pool>> {
    const pool = await aux.Pool.read(auxClient, poolInput);
    if (pool === undefined) {
      return null;
    }
    // @ts-ignore
    return {
      coinInfoX: pool.coinInfoX,
      coinInfoY: pool.coinInfoY,
      coinInfoLP: pool.coinInfoLP,
      amountX: pool.amountX.toNumber(),
      amountY: pool.amountY.toNumber(),
      amountLP: pool.amountLP.toNumber(),
      feePercent: pool.feePct,
    };
  },
  async pools(_parent: any, args: QueryPoolsArgs): Promise<Pool[]> {
    const poolReadParams = args.poolInputs
      ? args.poolInputs
      : await aux.Pool.index(auxClient);
    const pools = await Promise.all(
      poolReadParams.map((poolReadParam) =>
        aux.Pool.read(auxClient, poolReadParam)
      )
    );
    // @ts-ignore
    return pools
      .filter((maybePool) => maybePool !== undefined && maybePool !== null)
      .map((pool) => ({
        coinInfoX: pool!.coinInfoX,
        coinInfoY: pool!.coinInfoY,
        coinInfoLP: pool!.coinInfoLP,
        amountX: pool!.amountX.toNumber(),
        amountY: pool!.amountY.toNumber(),
        amountLP: pool!.amountLP.toNumber(),
        feePercent: pool!.feePct,
      }));
  },
  async poolCoins(parent: any) {
    if (process.env["APTOS_PROFILE"] === "mainnet") {
      return Promise.all(
        MAINNET_COINS.map((coinType) => auxClient.getCoinInfo(coinType))
      );
    }
    const pools = await this.pools(parent, {});
    const coinInfos = pools.flatMap((pool) => [pool.coinInfoX, pool.coinInfoY]);
    return _.uniqBy(coinInfos, (coinInfo) => coinInfo.coinType);
  },
  async market(_parent: any, args: QueryMarketArgs): Promise<Maybe<Market>> {
    let market: aux.Market;
    try {
      market = await aux.Market.read(auxClient, args.marketInput);
    } catch (err) {
      return null;
    }
    // @ts-ignore
    return {
      name: `${market.baseCoinInfo.name}-${market.quoteCoinInfo.name}`,
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
  async marketCoins(parent: any) {
    if (process.env["APTOS_PROFILE"] === "mainnet") {
      return Promise.all(
        MAINNET_COINS.map((coinType) => auxClient.getCoinInfo(coinType))
      );
    }
    const markets = await this.markets(parent, {});
    const coinInfos = markets.flatMap((market) => [
      market.baseCoinInfo,
      market.quoteCoinInfo,
    ]);
    return _.uniqBy(coinInfos, (coinInfo) => coinInfo.coinType);
  },
  account(_parent: any, { owner }: QueryAccountArgs): Account {
    // @ts-ignore
    return {
      address: owner,
    };
  },
};
