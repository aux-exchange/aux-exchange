import type { AptosAccount, Types } from "aptos";
import type { AuxClient } from "../src/client";
import AuxAccount from "../src/account";
import Market from "../src/clob/dsl/market";
import Vault from "../src/vault/dsl/vault";
import { COIN_MAPPING, USDC_ETH_WH } from "../src/coin";
import { onMarketUpdate } from "./ftx";
import { AU, DecimalUnits, DU } from "../src/units";
import BN from "bn.js";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import { Logger } from "tslog";

export class FTXMarketMakingStrategy {
  log: Logger;
  client: AuxClient;
  trader: AptosAccount;
  vault: Vault;
  account: AuxAccount;
  baseCoin: Types.MoveStructTag;
  idealSpreadFraction: number;
  moveInSpreadFraction: number;
  backOffSpreadFraction: number;
  inFlight: boolean;
  millisecondsBetweenNewOrders: number;
  lastBidTime: number;
  lastAskTime: number;
  quantityPerTrade: DecimalUnits;
  maxNetQuantity: number;
  currentNetQuantity: number;
  transferBase: DecimalUnits;
  transferQuote: DecimalUnits;
  strategyId: BN;
  previousPrint: number;

  remainingBidQuantity: BN;
  remainingAskQuantity: BN;
  bidPrice: BN;
  askPrice: BN;
  bidId: BN;
  askId: BN;

  constructor({
    client,
    trader,
    baseCoin,
    idealSpreadFraction,
    moveInSpreadFraction,
    backOffSpreadFraction,
    millisecondsBetweenNewOrders,
    quantityPerTrade,
    maxNetQuantity,
    transferBase,
    transferQuote,
    strategyId,
  }: {
    client: AuxClient;
    trader: AptosAccount;
    baseCoin: Types.MoveStructTag;

    // Offset by this fraction of spread from the FTX best bid and offer. Zero
    // means place at the FTX bid and offer. 1 means place 1 spread below bid
    // and 1 spread above ask.
    idealSpreadFraction: number;

    // When a new order would have been placed this fraction of spread inside
    // the current, cancel the existing order. 0 means cancel the existing order
    // if there is any improvement in the ideal order price. 1 means tolerate 1
    // spread of improvement.
    moveInSpreadFraction: number;

    // When a new order would have been placed this fraction of spread outside
    // the current, cancel the existing order. 0 means cancel the existing order if
    // there is any backoff in the ideal order price. 1 means tolerate 1 spread
    // of backoff.
    backOffSpreadFraction: number;

    // Wait this amount of time between any order activity. For example, setting
    // to 1000 throttles to one new order per side.
    millisecondsBetweenNewOrders: number;

    // Amount of base to trade in each transaction. For example, if baseCoin is
    // APT, then this is the amount of APT to trade.
    quantityPerTrade: DecimalUnits;

    // Only allow this total position from market making. The units are
    // expressed in base asset. For example, if the baseCoin is APT, then 1
    // means a max position of +/- 1 APT.
    maxNetQuantity: number;

    // Transfers this amount of the base asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferBase to 1 moves in 1
    // APT to the vault.
    transferBase: DecimalUnits;

    // Transfers this amount of the quote asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferQuote to 1 moves in 1
    // USDC to the vault.
    transferQuote: DecimalUnits;

    // Pick a unique identifier for orders associated with this strategy.
    strategyId: BN;
  }) {
    this.log = new Logger();
    this.client = client;
    this.trader = trader;
    this.vault = new Vault(client);
    this.account = new AuxAccount(client, this.trader.address().toString());
    this.baseCoin = baseCoin;
    this.idealSpreadFraction = idealSpreadFraction;
    this.moveInSpreadFraction = moveInSpreadFraction;
    this.backOffSpreadFraction = backOffSpreadFraction;
    this.millisecondsBetweenNewOrders = millisecondsBetweenNewOrders;
    this.lastBidTime = 0;
    this.lastAskTime = 0;
    this.quantityPerTrade = quantityPerTrade;
    this.maxNetQuantity = maxNetQuantity;
    this.currentNetQuantity = 0;
    this.transferBase = transferBase;
    this.transferQuote = transferQuote;
    this.strategyId = strategyId;
    this.inFlight = false;
    this.previousPrint = 0;
    this.remainingAskQuantity = new BN(0);
    this.remainingBidQuantity = new BN(0);
    this.askPrice = new BN(0);
    this.bidPrice = new BN(0);
    this.askId = new BN(0);
    this.bidId = new BN(0);
  }

  async maybeInitializeAccount() {
    const accountExists = await this.vault.accountExists(this.trader.address());
    if (!accountExists) {
      this.log.info("Creating AUX account");
      await this.vault.createAuxAccount({ sender: this.trader });
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

  async cancelAll(market: Market) {
    const orders = await this.account.openOrders({
      baseCoinType: this.baseCoin,
      quoteCoinType: USDC_ETH_WH,
    });
    for (const order of orders) {
      // Cancel all orders that were set to this strategy.
      if (order.clientId.eq(this.strategyId)) {
        this.log.info(
          `Cancel order ${order.id.toString()} before startegy start`
        );
        await market.cancelOrder({
          sender: this.trader,
          orderId: order.id.toString(),
        });
      }
    }
  }

  async maybePrint(bid: number | undefined, ask: number | undefined) {
    if (Date.now() > this.previousPrint + 10_000) {
      const stratBid = this.bidPrice.eqn(0)
        ? "N/A"
        : (
            await this.client.toDecimalUnits(USDC_ETH_WH, AU(this.bidPrice))
          ).toString();
      const stratAsk = this.askPrice.eqn(0)
        ? "N/A"
        : (
            await this.client.toDecimalUnits(USDC_ETH_WH, AU(this.askPrice))
          ).toString();
      this.log.info(
        `     FTX Bid: ${bid}; FTX Ask: ${ask}; Strategy Bid: ${stratBid}; Strategy Ask: ${stratAsk}`
      );
      this.previousPrint = Date.now();
    }
  }

  async updateOrders(
    market: Market,
    bid: number | undefined,
    ask: number | undefined
  ) {
    if (this.inFlight) {
      return;
    }
    if (bid === undefined || ask === undefined || bid == 0 || ask == 0) {
      return;
    }
    this.inFlight = true;

    await this.maybePrint(bid, ask);

    const now = Date.now();

    // Always force at least one tick.
    const spread = Math.max(
      ask - bid,
      market.tickSize.toDecimalUnits(market.quoteDecimals).toNumber()
    );

    const newPriceAdjustment = this.idealSpreadFraction * spread;

    const roundlotQuantity = market.makeRoundLot(
      await this.client.toAtomicUnits(this.baseCoin, this.quantityPerTrade)
    );

    const idealBidPrice = market.makeRoundTick(
      await this.client.toAtomicUnits(USDC_ETH_WH, DU(bid - newPriceAdjustment))
    );

    const idealAskPrice = market.makeRoundTick(
      await this.client.toAtomicUnits(USDC_ETH_WH, DU(ask + newPriceAdjustment))
    );

    const moveInAu = DU(this.moveInSpreadFraction * spread).toAtomicUnits(
      market.quoteDecimals
    );

    const backOffAu = DU(this.backOffSpreadFraction * spread).toAtomicUnits(
      market.quoteDecimals
    );

    if (
      this.remainingBidQuantity.eqn(0) &&
      this.currentNetQuantity < this.maxNetQuantity
    ) {
      if (now > this.lastBidTime + this.millisecondsBetweenNewOrders) {
        const requiredBalance = idealBidPrice
          .toBN()
          .mul(roundlotQuantity.toBN());
        const requiredBalanceDu = AU(requiredBalance).toDecimalUnits(
          market.baseDecimals + market.quoteDecimals
        );
        const requiredBalanceAu = requiredBalanceDu.toAtomicUnits(
          market.quoteDecimals
        );

        if (
          (
            await this.vault.availableBalance(
              this.trader.address().toString(),
              USDC_ETH_WH
            )
          )
            .toAtomicUnits(market.quoteDecimals)
            .toBN()
            .gte(requiredBalanceAu.toBN())
        ) {
          this.log.info(
            `BUY ${roundlotQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber()} @ ${idealBidPrice
              .toDecimalUnits(market.quoteDecimals)
              .toNumber()}`
          );
          const tx = await market.placeOrder({
            sender: this.trader,
            isBid: true,
            limitPrice: idealBidPrice,
            quantity: roundlotQuantity,
            orderType: OrderType.LIMIT_ORDER,
            clientOrderId: this.strategyId.toString(),
          });
          for (const event of tx.result ?? []) {
            if (event.type == "OrderPlacedEvent") {
              this.remainingBidQuantity = event.quantity.toBN();
              this.bidPrice = event.price.toBN();
              this.bidId = event.orderId;
              break;
            }
          }
          this.lastBidTime = now;
        } else {
          this.log.warn(
            `WOULD BUY ${roundlotQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber()} @ ${idealBidPrice
              .toDecimalUnits(market.quoteDecimals)
              .toNumber()}; insufficient budget`
          );
        }
      }
    } else if (
      this.bidPrice.gt(idealBidPrice.toBN()) &&
      this.bidPrice.sub(idealBidPrice.toBN()).gt(backOffAu.toBN())
    ) {
      // The actual bid > the ideal bid so cancel.
      this.log.info(`BACKOFF BID ${this.bidId.toString()}`);
      await market.cancelOrder({
        sender: this.trader,
        orderId: this.bidId.toString(),
      });
      this.bidId = new BN(0);
      this.remainingBidQuantity = new BN(0);
    } else if (
      this.bidPrice.lt(idealBidPrice.toBN()) &&
      idealBidPrice.toBN().sub(this.bidPrice).gt(moveInAu.toBN())
    ) {
      // The actual bid < the ideal bid so cancel.
      this.log.info(`MOVE IN BID ${this.bidId.toString()}`);
      await market.cancelOrder({
        sender: this.trader,
        orderId: this.bidId.toString(),
      });
      this.bidId = new BN(0);
      this.remainingBidQuantity = new BN(0);
    }

    if (
      this.remainingAskQuantity.eqn(0) &&
      this.currentNetQuantity > -this.maxNetQuantity
    ) {
      if (now > this.lastAskTime + this.millisecondsBetweenNewOrders) {
        if (
          (
            await this.vault.availableBalance(
              this.trader.address().toString(),
              this.baseCoin
            )
          )
            .toAtomicUnits(market.baseDecimals)
            .toBN()
            .gte(
              this.quantityPerTrade.toAtomicUnits(market.baseDecimals).toBN()
            )
        ) {
          this.log.info(
            `SELL ${roundlotQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber()} @ ${idealAskPrice
              .toDecimalUnits(market.quoteDecimals)
              .toNumber()}`
          );
          const tx = await market.placeOrder({
            sender: this.trader,
            isBid: false,
            limitPrice: idealAskPrice,
            quantity: roundlotQuantity,
            orderType: OrderType.LIMIT_ORDER,
            clientOrderId: this.strategyId.toString(),
          });
          for (const event of tx.result ?? []) {
            if (event.type == "OrderPlacedEvent") {
              this.remainingAskQuantity = event.quantity.toBN();
              this.askPrice = event.price.toBN();
              this.askId = event.orderId;
              break;
            }
          }
          this.lastAskTime = now;
        } else {
          this.log.warn(
            `WOULD SELL ${roundlotQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber()} @ ${idealAskPrice
              .toDecimalUnits(market.quoteDecimals)
              .toNumber()}; insufficient balance`
          );
        }
      }
    } else if (
      this.askPrice.gt(idealAskPrice.toBN()) &&
      this.askPrice.sub(idealAskPrice.toBN()).gt(moveInAu.toBN())
    ) {
      // The actual ask > the ideal ask so cancel.
      this.log.info(`MOVE IN ASK ${this.askId.toString()}`);
      await market.cancelOrder({
        sender: this.trader,
        orderId: this.askId.toString(),
      });
      this.askId = new BN(0);
      this.remainingAskQuantity = new BN(0);
    } else if (
      this.askPrice.lt(idealAskPrice.toBN()) &&
      idealAskPrice.toBN().sub(this.askPrice).gt(backOffAu.toBN())
    ) {
      // The actual ask < the ideal ask so cancel.
      this.log.info(`BACK OFF ASK ${this.askId.toString()}`);
      await market.cancelOrder({
        sender: this.trader,
        orderId: this.askId.toString(),
      });
      this.askId = new BN(0);
      this.remainingAskQuantity = new BN(0);
    }

    this.inFlight = false;
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
    await this.cancelAll(market);

    const ftxMarket = COIN_MAPPING.get(this.baseCoin)?.ftxInternationalMarket;
    if (ftxMarket === undefined) {
      throw new Error(`No FTX market for ${this.baseCoin}`);
    }

    let previousBid: number | undefined = undefined;
    let previousAsk: number | undefined = undefined;

    // Take the last update before trading starts. We only need to consider
    // fills after this point.
    let fillSequenceNumber = 0;
    const currentFills = await market.fills();
    if (currentFills.length > 0) {
      fillSequenceNumber =
        currentFills[currentFills.length - 1]!.sequenceNumber.toNumber();
    }

    // After any FTX market update, we may need to adjust orders.
    onMarketUpdate(ftxMarket, async (bid, ask) => {
      previousBid = bid;
      previousAsk = ask;
      await this.updateOrders(market, bid, ask);
    });

    while (true) {
      const fills = await market.fills({
        start: new BN(fillSequenceNumber + 1),
      });
      if (fills.length > 0) {
        fillSequenceNumber = fills[fills.length - 1]!.sequenceNumber.toNumber();
      }

      for (const fill of fills) {
        if (fill.orderId.eq(this.bidId)) {
          this.remainingBidQuantity = fill.remainingQuantity.toBN();
        } else if (fill.orderId.eq(this.askId)) {
          this.remainingAskQuantity = fill.remainingQuantity.toBN();
        }

        if (
          fill.owner.toShortString() == this.trader.address().toShortString()
        ) {
          if (fill.isBid) {
            this.currentNetQuantity += fill.baseQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber();
          } else {
            this.currentNetQuantity -= fill.baseQuantity
              .toDecimalUnits(market.baseDecimals)
              .toNumber();
          }
        }
      }

      // After processing fills, we may need to place new orders.
      await this.updateOrders(market, previousBid, previousAsk);
    }
  }
}

export class FTXArbitrageStrategy {
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
  maxPositionNumTrades: number;
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
    dollarsPerTrade: DecimalUnits;

    // Transfers this amount of the base asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferBase to 1 moves in 1
    // APT to the vault.
    transferBase: DecimalUnits;

    // Transfers this amount of the quote asset into the AUX vault for trading.
    // For example, in the APT-USDC market, setting transferQuote to 1 moves in 1
    // USDC to the vault.
    transferQuote: DecimalUnits;

    // Only allow this many trades in a given direction. For example, Buy Buy
    // Buy Sell results in two net buys. If maxPositionNumTrades were set to
    // two, no further buys would be permitted.
    maxPositionNumTrades: number;
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
    this.maxPositionNumTrades = maxPositionNumTrades;
    this.inFlight = false;
    this.previousPrint = 0;
  }

  async maybeInitializeAccount() {
    const accountExists = await this.vault.accountExists(this.trader.address());
    if (!accountExists) {
      this.log.info("Creating AUX account");
      await this.vault.createAuxAccount({sender: this.trader});
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
    bid: number | undefined,
    ask: number | undefined,
    marketBid: number | undefined,
    marketAsk: number | undefined
  ) {
    if (Date.now() > this.previousPrint + 10_000) {
      this.log.info(
        `     ${new Date()} | FTX Bid: ${bid}; FTX Ask: ${ask}; AUX Bid: ${marketBid}; AUX Ask: ${marketAsk};`
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

    const ftxMarket = COIN_MAPPING.get(this.baseCoin)?.ftxInternationalMarket;
    if (ftxMarket === undefined) {
      throw new Error(`No FTX market for ${this.baseCoin}`);
    }

    let netPositionNumTrades = 0;
    const maybeTrade = async (
      bid: number | undefined,
      ask: number | undefined,
      marketBid: number | undefined,
      marketAsk: number | undefined
    ) => {
      if (
        bid === undefined ||
        ask === undefined ||
        marketBid === undefined ||
        marketAsk === undefined ||
        bid == 0 ||
        ask == 0 ||
        marketBid == 0 ||
        marketAsk == 0
      ) {
        return;
      }

      if (this.inFlight) {
        return;
      }

      this.inFlight = true;

      await this.maybePrint(bid, ask, marketBid, marketAsk);

      if (bid / marketAsk > this.deviationThreshold) {
        const quoteBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: USDC_ETH_WH,
        });
        if (quoteBalance.toNumber() > this.dollarsPerTrade.toNumber()) {
          if (netPositionNumTrades < this.maxPositionNumTrades) {
            const tx = await market.placeOrder({
              sender: this.trader,
              isBid: true,
              limitPrice: DU(bid * this.limitThreshold),
              quantity: this.dollarsPerTrade,
              auxToBurn: DU(0),
              orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
              stpActionType: STPActionType.CANCEL_AGGRESSIVE,
            });

            this.log.info(
              `>>>> ${new Date()} | BUY  | FTX: ${bid}; AUX: ${marketAsk}; Swap:`,
              tx
            );
            netPositionNumTrades++;
          } else {
            this.log.info(
              `>>>> ${new Date()} | BUY  | FTX: ${bid}; AUX: ${marketAsk}; RISK LIMIT REACHED`
            );
          }
        } else {
          this.log.info(
            `>>>> ${new Date()} | BUY  | FTX: ${bid}; AUX: ${marketAsk}; INSUFFICIENT BALANCE`
          );
        }
      } else if (marketBid / ask > this.deviationThreshold) {
        const baseBalance = await this.client.getCoinBalanceDecimals({
          account: this.trader.address(),
          coinType: this.baseCoin,
        });
        const exactAmountIn = DU(this.dollarsPerTrade.toNumber() / marketBid);
        if (baseBalance.toNumber() > exactAmountIn.toNumber()) {
          if (netPositionNumTrades > -this.maxPositionNumTrades) {
            const tx = await market.placeOrder({
              sender: this.trader,
              isBid: false,
              limitPrice: DU(ask / this.limitThreshold),
              quantity: exactAmountIn,
              auxToBurn: DU(0),
              orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
              stpActionType: STPActionType.CANCEL_AGGRESSIVE,
            });
            this.log.info(
              `>>>> ${new Date()} | SELL | FTX: ${ask}; AUX: ${marketBid}; Swap:`,
              tx
            );
            netPositionNumTrades--;
          } else {
            this.log.warn(
              `>>>> ${new Date()} | SELL | FTX: ${ask}; AUX: ${marketBid}; RISK LIMIT REACHED`
            );
          }
        } else {
          this.log.warn(
            `>>>> ${new Date()} | SELL | FTX: ${ask}; AUX: ${marketBid}; INSUFFICIENT BALANCE`
          );
        }
      }
      this.inFlight = false;
    };

    let previousBid: number | undefined = undefined;
    let previousAsk: number | undefined = undefined;
    let previousMarketBid: number | undefined = undefined;
    let previousMarketAsk: number | undefined = undefined;

    onMarketUpdate(ftxMarket, async (bid, ask) => {
      previousBid = bid;
      previousAsk = ask;
      await maybeTrade(bid, ask, previousMarketBid, previousMarketAsk);
    });

    while (true) {
      await market.update();
      const marketBid = market.l2.bids[0]?.price.toNumber();
      const marketAsk = market.l2.asks[0]?.price.toNumber();
      if (marketBid != previousMarketBid || marketAsk != previousMarketAsk) {
        previousMarketBid = marketBid;
        previousMarketAsk = marketAsk;
        await maybeTrade(previousBid, previousAsk, marketBid, marketAsk);
      }
    }
  }
}
