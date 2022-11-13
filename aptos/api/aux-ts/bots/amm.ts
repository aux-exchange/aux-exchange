import type { AptosAccount, Types } from "aptos";
import { Logger } from "tslog";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import type { ConstantProduct } from "../src/pool/constant-product/schema";
import type { AuxClient } from "../src/client";
import { COIN_MAPPING, USDC_ETH_WH } from "../src/coin";
import { DecimalUnits, DU } from "../src/units";
import { onMarketUpdate } from "./ftx";

export class FTXArbitrageStrategy {
  log: Logger;
  client: AuxClient;
  trader: AptosAccount;
  baseCoin: Types.MoveStructTag;
  deviationThreshold: number;
  limitThreshold: number;
  inFlight: boolean;
  dollarsPerSwap: DecimalUnits;
  maxPositionNumTrades: number;

  constructor({
    client,
    trader,
    baseCoin,
    deviationThreshold,
    limitThreshold,
    dollarsPerSwap,
    maxPositionNumTrades,
  }: {
    client: AuxClient;
    trader: AptosAccount;
    baseCoin: Types.MoveStructTag;

    // Ratio that the price must deviate from FTX to make a trade. For example,
    // 1.01 means if the price is 1% higher than ask or lower than bid, then
    // make a trade.
    deviationThreshold: number;

    // Ratio applied to the price to compute the limit price in a trade. For
    // example, 1.0005 means that purchases will be at least 5 bps lower than
    // FTX bid and sells will be at least 5 bps higher than FTX ask.
    limitThreshold: number;

    // Dollars to trade in each transaction.
    dollarsPerSwap: DecimalUnits;

    // Only allow this many trades in a given direction. For example, Buy Buy
    // Buy Sell results in two net buys. If maxPositionNumTrades were set to
    // two, no further buys would be permitted.
    maxPositionNumTrades: number;
  }) {
    this.log = new Logger();
    this.client = client;
    this.trader = trader;
    this.baseCoin = baseCoin;
    this.deviationThreshold = deviationThreshold;
    this.limitThreshold = limitThreshold;
    this.dollarsPerSwap = dollarsPerSwap;
    this.maxPositionNumTrades = maxPositionNumTrades;
    this.inFlight = false;
  }

  async run() {
    const poolClient = new ConstantProductClient(this.client, {
      coinTypeX: this.baseCoin,
      coinTypeY: USDC_ETH_WH,
    });

    let pool: ConstantProduct;
    try {
      pool = await poolClient.query();
    } catch {
      throw new Error(`No pool for ${this.baseCoin}`);
    }

    const ftxMarket = COIN_MAPPING.get(this.baseCoin)?.ftxInternationalMarket;
    if (ftxMarket === undefined) {
      throw new Error(`No FTX market for ${this.baseCoin}`);
    }

    let previousPrint = 0;
    let netPositionNumTrades = 0;
    const maybeTrade = async (
      bid: number | undefined,
      ask: number | undefined,
      poolPrice: number | undefined
    ) => {
      if (
        bid === undefined ||
        ask === undefined ||
        poolPrice === undefined ||
        bid == 0 ||
        ask == 0 ||
        poolPrice == 0
      ) {
        return;
      }

      if (this.inFlight) {
        return;
      }

      this.inFlight = true;

      // FTX shows [bid, ask].
      // If the pool price < bid, we can buy from the pool and sell to FTX at bid.
      // If the pool price > ask, we can buy from FTX and sell to the pool at ask.

      if (Date.now() > previousPrint + 10_000) {
        this.log.info(
          `     ${new Date()} | Bid: ${bid}; Ask: ${ask}; AMM: ${poolPrice}`
        );
        previousPrint = Date.now();
      }

      if (bid / poolPrice > this.deviationThreshold) {
        const quoteBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: USDC_ETH_WH,
        });
        if (quoteBalance.toNumber() > this.dollarsPerSwap.toNumber()) {
          if (netPositionNumTrades < this.maxPositionNumTrades) {
            const tx = await poolClient.swap({
              coinTypeIn: poolClient.coinTypeY,
              exactAmountIn: this.dollarsPerSwap,
              parameters: {
                minAmountOutPerIn: DU(this.limitThreshold / bid),
              },
            });
            this.log.info(
              `>>>> ${new Date()} | BUY  | FTX: ${bid}; AMM: ${poolPrice}; Swap:`,
              tx
            );
            netPositionNumTrades++;
          } else {
            this.log.info(
              `>>>> ${new Date()} | BUY  | FTX: ${bid}; AMM: ${poolPrice}; RISK LIMIT REACHED`
            );
          }
        } else {
          this.log.info(
            `>>>> ${new Date()} | BUY  | FTX: ${bid}; AMM: ${poolPrice}; INSUFFICIENT BALANCE`
          );
        }
      } else if (poolPrice / ask > this.deviationThreshold) {
        const baseBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: this.baseCoin,
        });
        const exactAmountIn = DU(this.dollarsPerSwap.toNumber() / poolPrice);
        if (baseBalance.toNumber() > exactAmountIn.toNumber()) {
          if (netPositionNumTrades > -this.maxPositionNumTrades) {
            const tx = await poolClient.swap({
              coinTypeIn: poolClient.coinTypeX,
              exactAmountIn,
              parameters: {
                minAmountOutPerIn: DU(ask * this.limitThreshold),
              },
            });
            this.log.info(
              `>>>> ${new Date()} | SELL | FTX: ${ask}; AMM: ${poolPrice}; Swap:`,
              tx
            );
            netPositionNumTrades--;
          } else {
            this.log.warn(
              `>>>> ${new Date()} | SELL | FTX: ${ask}; AMM: ${poolPrice}; RISK LIMIT REACHED`
            );
          }
        } else {
          this.log.warn(
            `>>>> ${new Date()} | SELL | FTX: ${ask}; AMM: ${poolPrice}; INSUFFICIENT BALANCE`
          );
        }
      }
      this.inFlight = false;
    };

    let previousBid: number | undefined = undefined;
    let previousAsk: number | undefined = undefined;
    let previousPoolPrice: number | undefined = undefined;

    onMarketUpdate(ftxMarket, async (bid, ask) => {
      previousBid = bid;
      previousAsk = ask;
      await maybeTrade(bid, ask, previousPoolPrice);
    });

    while (true) {
      pool = await poolClient.query();
      const poolPrice = pool.amountY.toNumber() / pool.amountX.toNumber();
      if (poolPrice != previousPoolPrice) {
        previousPoolPrice = poolPrice;
        await maybeTrade(previousBid, previousAsk, poolPrice);
      }
    }
  }
}
