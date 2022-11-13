import type { AptosAccount, Types } from "aptos";
import { Logger } from "tslog";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import type { AuxClient } from "../src/client";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import Market from "../src/clob/dsl/market";
import { USDC_ETH_WH } from "../src/coin";
import { DecimalUnits, DU } from "../src/units";
import Vault from "../src/vault/dsl/vault";

export class AUXArbitrageStrategy {
  log: Logger;
  client: AuxClient;
  trader: AptosAccount;
  vault: Vault;
  baseCoin: Types.MoveStructTag;
  deviationThreshold: number;
  limitThreshold: number;
  inFlight: boolean;
  dollarsPerTrade: DecimalUnits;
  transferBase: DecimalUnits;
  transferQuote: DecimalUnits;
  previousPrint: number;

  constructor({
    client,
    trader,
    baseCoin,
    deviationThreshold,
    limitThreshold,
    dollarsPerTrade,
    transferBase,
    transferQuote,
  }: {
    client: AuxClient;
    trader: AptosAccount;
    baseCoin: Types.MoveStructTag;

    // Ratio that the price must deviate between AUX's CLOB and AMM to make a trade.
    // For example, 1.01 means if the price is 1% higher than ask or lower than bid,
    // then make a trade.
    deviationThreshold: number;

    // Ratio applied to the price to compute the limit price in a trade. For
    // example, 1.0005 means that purchases from one will be at least 5 bps
    // lower than sellable price from another and vice versa.
    limitThreshold: number;

    // Dollars to trade in each transaction.
    dollarsPerTrade: DecimalUnits;

    // Transfers this amount of the base asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferBase to 1 moves in 1
    // APT to the vault.
    transferBase: DecimalUnits;

    // Transfers this amount of the quote asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferQuote to 1 moves in 1
    // USDC to the vault.
    transferQuote: DecimalUnits;
  }) {
    this.log = new Logger();
    this.client = client;
    this.trader = trader;
    this.vault = new Vault(client);
    this.baseCoin = baseCoin;
    this.deviationThreshold = deviationThreshold;
    this.limitThreshold = limitThreshold;
    this.dollarsPerTrade = dollarsPerTrade;
    this.transferBase = transferBase;
    this.transferQuote = transferQuote;
    this.inFlight = false;
    this.previousPrint = 0;

    this.client.sender = trader;
  }

  async maybeInitializeAccount() {
    const accountExists = await this.vault.accountExists(this.trader.address());
    if (!accountExists) {
      this.log.info("Creating AUX account");
      await this.vault.createAuxAccount();
    }

    const existingBase = await this.vault.availableBalance(
      this.trader.address().toString(),
      this.baseCoin
    );
    if (existingBase.toNumber() < this.transferBase.toNumber()) {
      this.log.info(
        `Depositing ${this.transferBase.toNumber()} units of ${
          this.baseCoin
        } to AUX`
      );
      await this.vault.deposit(this.trader, this.baseCoin, this.transferBase);
    }

    const existingQuote = await this.vault.availableBalance(
      this.trader.address().toString(),
      USDC_ETH_WH
    );
    if (existingQuote.toNumber() < this.transferQuote.toNumber()) {
      this.log.info(
        `Depositing ${this.transferQuote.toNumber()} units of ${USDC_ETH_WH} to AUX`
      );
      await this.vault.deposit(this.trader, USDC_ETH_WH, this.transferQuote);
    }
  }

  async maybePrint(
    marketBid: number | undefined,
    marketAsk: number | undefined,
    poolPrice: number | undefined
  ) {
    if (Date.now() > this.previousPrint + 10_000) {
      this.log.info(
        `     ${new Date()} | CLOB Bid: ${marketBid}; CLOB Ask: ${marketAsk}; AMM Price: ${poolPrice};`
      );
      this.previousPrint = Date.now();
    }
  }

  async run() {
    await this.maybeInitializeAccount();

    const maybeMarket = await Market.read(this.client, {
      baseCoinType: this.baseCoin,
      quoteCoinType: USDC_ETH_WH,
    });
    if (maybeMarket === undefined) {
      throw new Error(`No market for ${this.baseCoin}`);
    }
    const market = maybeMarket as Market;

    const poolClient = new ConstantProductClient(this.client, {
      coinTypeX: this.baseCoin,
      coinTypeY: USDC_ETH_WH,
    });

    let pool;
    try {
      pool = await poolClient.query();
    } catch {
      throw new Error(`No pool for ${this.baseCoin}`);
    }

    const maybeTrade = async (
      marketBid: number | undefined,
      marketAsk: number | undefined,
      marketBidSize: number | undefined,
      marketAskSize: number | undefined,
      poolPrice: number | undefined
    ) => {
      if (
        marketBid === undefined ||
        marketAsk === undefined ||
        marketBidSize === undefined ||
        marketAskSize === undefined ||
        poolPrice === undefined ||
        marketBid == 0 ||
        marketAsk == 0 ||
        marketBidSize == 0 ||
        marketAskSize == 0 ||
        poolPrice == 0
      ) {
        return;
      }

      if (this.inFlight) {
        return;
      }

      this.inFlight = true;

      await this.maybePrint(marketBid, marketAsk, poolPrice);

      // Buy from AMM, sell on CLOB
      if (marketBid / poolPrice > this.deviationThreshold) {
        const quoteBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: USDC_ETH_WH,
        });
        if (quoteBalance.toNumber() > this.dollarsPerTrade.toNumber()) {
          const tradeQuantity = Math.min(
            marketBidSize,
            this.dollarsPerTrade.toNumber() / poolPrice
          );
          const roundlotQuantity = market.makeRoundLot(
            await this.client.toAtomicUnits(this.baseCoin, DU(tradeQuantity))
          );
          const buyTx = await poolClient.swap({
            coinTypeOut: poolClient.coinTypeX,
            exactAmountOut: roundlotQuantity,
            parameters: {
              maxAmountIn: this.dollarsPerTrade,
              maxAmountInPerOut: DU(marketBid / this.limitThreshold),
            },
          });
          this.log.info(
            `>>>> ${new Date()} | BUY  | AMM: ${poolPrice}; Limit: ${
              marketBid / this.limitThreshold
            }; Swap:`,
            buyTx.transaction
          );

          const sellTx = await market.placeOrder({
            sender: this.trader,
            isBid: false,
            limitPrice: DU(marketBid / this.limitThreshold),
            quantity: roundlotQuantity,
            auxToBurn: DU(0),
            orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
            stpActionType: STPActionType.CANCEL_AGGRESSIVE,
          });
          this.log.info(
            `>>>> ${new Date()} | SELL  | AMM: ${poolPrice}; Limit: ${
              marketBid / this.limitThreshold
            };`
          );
          for (const event of sellTx.result ?? []) {
            if (event.type == "OrderFillEvent") {
              this.log.info(
                `\n
                      type: ${event.type}\n 
                      orderId: ${event.orderId.toString()}\n
                      quantity: ${event.baseQuantity.toDecimalUnits(
                        market.baseDecimals
                      )}\n
                      price: ${event.price.toDecimalUnits(market.quoteDecimals)}
                `
              );
            }
          }
        } else {
          this.log.info(
            `>>>> ${new Date()} | BUY  | AMM: ${poolPrice}; CLOB: ${marketBid}; INSUFFICIENT BALANCE`
          );
        }
      }
      // Buy from CLOB, sell on AMM
      else if (poolPrice / marketAsk > this.deviationThreshold) {
        const baseBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: this.baseCoin,
        });
        const tradeQuantity = Math.min(
          marketAskSize,
          this.dollarsPerTrade.toNumber() / poolPrice
        );
        const roundlotQuantity = market.makeRoundLot(
          await this.client.toAtomicUnits(this.baseCoin, DU(tradeQuantity))
        );
        if (baseBalance.toNumber() > tradeQuantity) {
          const buyTx = await market.placeOrder({
            sender: this.trader,
            isBid: true,
            limitPrice: DU(marketAsk * this.limitThreshold),
            quantity: roundlotQuantity,
            auxToBurn: DU(0),
            orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
            stpActionType: STPActionType.CANCEL_AGGRESSIVE,
          });
          this.log.info("HEREEEEE", roundlotQuantity.toNumber());
          this.log.info(
            `>>>> ${new Date()} | BUY  | CLOB: ${marketAsk}; Limit: ${
              marketAsk * this.limitThreshold
            };`
          );
          for (const event of buyTx.result ?? []) {
            if (event.type == "OrderFillEvent") {
              this.log.info(
                `\n
                      type: ${event.type}\n 
                      orderId: ${event.orderId.toString()}\n
                      quantity: ${event.baseQuantity.toDecimalUnits(
                        market.baseDecimals
                      )}\n
                      price: ${event.price.toDecimalUnits(market.quoteDecimals)}
                `
              );
            }
          }
          const sellTx = await poolClient.swap({
            coinTypeIn: poolClient.coinTypeY,
            exactAmountIn: roundlotQuantity,
            parameters: {
              minAmountOutPerIn: DU(marketAsk),
            },
          });
          this.log.info(
            `>>>> ${new Date()} | SELL  | AMM: ${poolPrice}; Limit: ${marketAsk}; Swap:`,
            sellTx.transaction
          );
        }
      }
      this.inFlight = false;
    };

    let previousMarketBid: number | undefined = undefined;
    let previousMarketAsk: number | undefined = undefined;
    let previousPoolPrice: number | undefined = undefined;

    while (true) {
      await market.update();
      pool = await poolClient.query();
      const marketBid = market.l2.bids[0]?.price.toNumber();
      const marketAsk = market.l2.asks[0]?.price.toNumber();
      const marketBidSize = market.l2.bids[0]?.quantity.toNumber();
      const marketAskSize = market.l2.asks[0]?.quantity.toNumber();
      const poolPrice = pool.amountY.toNumber() / pool.amountX.toNumber();

      if (
        marketBid != previousMarketBid ||
        marketAsk != previousMarketAsk ||
        poolPrice != previousPoolPrice
      ) {
        previousMarketBid = marketBid;
        previousMarketAsk = marketAsk;
        previousPoolPrice = poolPrice;
        await maybeTrade(
          marketBid,
          marketAsk,
          marketBidSize,
          marketAskSize,
          poolPrice
        );
      } else {
        await new Promise((f) => setTimeout(f, 500));
      }
    }
  }
}
