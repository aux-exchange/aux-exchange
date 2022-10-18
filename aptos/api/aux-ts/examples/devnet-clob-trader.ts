/**
 * Poll FTX every second. Make extremely tight markets around FTX midpoint for
 * illustration. When the AUX book crosses FTX, aggress assuming that FTX price
 * movements predict AUX price movements.
 *
 * Run ts-node devnet-clob-trader.ts to trade on devnet.
 */
import { AptosAccount } from "aptos";
import axios from "axios";
import BN from "bn.js";
import { assert } from "console";
import { AU, DU, Market, MarketSubscriber, Vault } from "../src";
import { AuxClient, FakeCoin, Network } from "../src/client";
import { OrderType, STPActionType } from "../src/clob/core/mutation";

const AUX_TRADER_CONFIG = {
  // The frequency at which we fetch price updates from both FTX and AUX,
  // in milliseconds
  refreshTime: 1_000,
  // The size of each order, denoted in decimal units. "DU" or "DecimalUnits"
  // represents a quantity with decimals. DU("0.1") means 0.1 BTC. The on chain
  // representation is in "AU" or "AtomicUnits".
  btcOrderSize: DU("0.1"),
  // The REST API endpoint URL to get oracle price updates
  oracleUrl: "https://ftx.com/api/markets/BTC/USD/orderbook?depth=1",
};

// While you can technically connect directly to Devnet, we strongly recommend
// running a full validator for RPCs.
const auxClient = AuxClient.create({
  network: Network.Devnet,
  // validatorAddress: "http://localhost:8080",
});

// We create a new Aptos account for the trader
const trader: AptosAccount = new AptosAccount();

async function setupTrader(): Promise<void> {
  await auxClient.airdropNativeCoin({
    account: trader.address(),
    quantity: AU(500_000),
  });

  // We're rich! Use canonical fake types for trading. Fake coins can be freely
  // minted by anybody.
  const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);

  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.BTC,
    amount: DU(1000),
  });

  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.USDC,
    amount: DU(1_000_000),
  });

  // The vault must be configurd to accept all types being traded.
  const vault = new Vault(auxClient);

  // Deposit funds to prepare for trading.
  await vault.createAuxAccount(trader);
  await vault.deposit(trader, btcCoin, DU(1000));
  await vault.deposit(trader, usdcCoin, DU(1_000_000));
}

// This function first sets up the CLOB market, then runs an infinite loop
// to listen for prices from two venues and place trades if opportunity exists
async function tradeCLOB(): Promise<void> {
  const vault = new Vault(auxClient);
  const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
  const btcInfo = await auxClient.getCoinInfo(btcCoin);
  // const usdcInfo = await auxClient.getCoinInfo(usdcCoin);
  const maybeMarket = await Market.read(auxClient, {
    baseCoinType: btcCoin,
    quoteCoinType: usdcCoin,
  });
  assert(
    maybeMarket !== undefined,
    "Fake market should have been created during deploy"
  );
  const market = maybeMarket as Market;
  await market.update();

  let lastMidpoint: number | undefined = undefined;

  let bidOrderId: BN | undefined = undefined;
  let askOrderId: BN | undefined = undefined;

  // Get notified on passive fill. We also get fills from the transaction
  // itself. The example here does not account for the two sources, but you can
  // arbitrate the two sources of feed info or ignore the events returned by the
  // transaction.
  const marketSubscriber = new MarketSubscriber(market);

  // Subscribe forever. We can also call marketSubscriber.kill() and then await
  // this to block on fill subscription handling. For this example, we will leave
  // the subscriber up until the entire process is killed.
  marketSubscriber.onFill((fill, _market) => {
    // You will see two events per fill representing fills for both sides.
    console.log(">>>> Subscriber saw fill:", fill);
  });

  while (true) {
    console.log(new Date());
    // Fetch FTX midprice
    const ftxRes = await axios.get(AUX_TRADER_CONFIG.oracleUrl);
    const ftxBid = ftxRes.data.result.bids[0][0];
    const ftxAsk = ftxRes.data.result.asks[0][0];
    const ftxMid = (ftxBid + ftxAsk) / 2;

    console.log("  FTX Bid=", ftxBid, ", Ask=", ftxAsk, ", Mid=", ftxMid);

    await market.update();
    const marketBid = market.bids[0]?.price
      ?.toDecimalUnits(market.quoteCoinInfo.decimals)
      .toNumber();
    const marketAsk = market.asks[0]?.price
      ?.toDecimalUnits(market.quoteCoinInfo.decimals)
      .toNumber();

    // TODO: This is pretty inefficient. We will have better tools for
    // interacting with the book data.
    console.log("  5x5 book");
    for (let i = 4; i >= 0; i--) {
      const price = market.asks[i]?.price;
      if (price !== undefined) {
        const quantity = market.asks[i]!.orders.map((o) => o.quantity).reduce(
          (a, b) => {
            return a.add(b.toBN());
          },
          new BN(0)
        );
        console.log(
          "          ",
          AU(quantity).toDecimalUnits(market.baseCoinInfo.decimals).toString(),
          " @ $",
          price!.toDecimalUnits(market.quoteCoinInfo.decimals).toString()
        );
      }
    }
    for (let i = 0; i < 5; i++) {
      const price = market.bids[i]?.price;
      if (price !== undefined) {
        const quantity = market.bids[i]!.orders.map((o) => o.quantity).reduce(
          (a, b) => {
            return a.add(b.toBN());
          },
          new BN(0)
        );
        console.log(
          "  ",
          AU(quantity).toDecimalUnits(market.baseCoinInfo.decimals).toString(),
          " @ $",
          price!.toDecimalUnits(market.quoteCoinInfo.decimals).toString()
        );
      }
    }

    // Aggressive logic: take when crossed.
    if (marketBid !== undefined && marketBid > ftxAsk) {
      console.log(">>>> Selling at ", marketBid);
      const tx = await market.placeOrder({
        sender: trader,
        isBid: false,
        limitPrice: DU(marketBid),
        quantity: AUX_TRADER_CONFIG.btcOrderSize,
        auxToBurn: DU(0),
        orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
        stpActionType: STPActionType.CANCEL_AGGRESSIVE,
      });
      for (const e of tx.payload) {
        if (e.type == "OrderFillEvent") {
          console.log(
            "    Fill for ",
            e.baseQuantity.toDecimalUnits(btcInfo.decimals)
          );
        }
      }
    }

    if (marketAsk !== undefined && marketAsk < ftxBid) {
      console.log(">>>> Buying at ", marketAsk);
      const tx = await market.placeOrder({
        sender: trader,
        isBid: true,
        limitPrice: DU(marketAsk),
        quantity: AUX_TRADER_CONFIG.btcOrderSize,
        auxToBurn: DU(0),
        orderType: OrderType.IMMEDIATE_OR_CANCEL_ORDER,
        stpActionType: STPActionType.CANCEL_AGGRESSIVE,
      });
      for (const e of tx.payload) {
        if (e.type == "OrderFillEvent") {
          console.log(
            "    Fill for ",
            e.baseQuantity.toDecimalUnits(btcInfo.decimals)
          );
        }
      }
    }

    // Passive logic: place tight markets around FTX.
    if (lastMidpoint === undefined || (lastMidpoint != ftxMid && ftxMid > 0)) {
      console.log(">>>> Making market around ", ftxMid);

      console.log(">>>> Cancel current passive orders");
      if (bidOrderId !== undefined) {
        await market.cancelOrder({
          sender: trader,
          orderId: bidOrderId.toString(),
        });
      }
      if (askOrderId !== undefined) {
        await market.cancelOrder({
          sender: trader,
          orderId: askOrderId.toString(),
        });
      }

      // Vary the placed spread so that the book starts to look interesting when
      // we run multiple copies of the demo.
      const ticks = Math.random() % 5;
      const previousTick = (
        Math.round((ftxMid - 0.1 * ticks) * 10) / 10
      ).toFixed(1);
      const nextTick = (Math.round((ftxMid + 0.1 * ticks) * 10) / 10).toFixed(
        1
      );

      console.log(">>>> Place new passive orders");
      console.log(">>>>     Passive Buy at", previousTick);
      const bidTx = await market.placeOrder({
        sender: trader,
        isBid: true,
        limitPrice: DU(previousTick),
        quantity: AUX_TRADER_CONFIG.btcOrderSize,
        auxToBurn: DU(0),
        orderType: OrderType.LIMIT_ORDER,
        stpActionType: STPActionType.CANCEL_AGGRESSIVE,
      });
      for (const e of bidTx.payload) {
        if (e.type == "OrderPlacedEvent") {
          bidOrderId = e.orderId;
        }
        if (e.type == "OrderFillEvent") {
          console.log(
            "    Fill for ",
            e.baseQuantity.toDecimalUnits(btcInfo.decimals)
          );
        }
      }

      console.log(">>>>     Passive Sell at", nextTick);
      const askTx = await market.placeOrder({
        sender: trader,
        isBid: false,
        limitPrice: DU(nextTick),
        quantity: AUX_TRADER_CONFIG.btcOrderSize,
        auxToBurn: DU(0),
        orderType: OrderType.LIMIT_ORDER,
        stpActionType: STPActionType.CANCEL_AGGRESSIVE,
      });
      for (const e of askTx.payload) {
        if (e.type == "OrderPlacedEvent") {
          askOrderId = e.orderId;
        }
        if (e.type == "OrderFillEvent") {
          console.log(
            "    Fill for ",
            e.baseQuantity.toDecimalUnits(btcInfo.decimals)
          );
        }
      }

      lastMidpoint = ftxMid;
    }

    // As discussed above, anybody can mint unlimited quantities of fake
    // assets for test trading. To avoid issues dealing with inventory, we
    // simply mint ourselves more fake coins when we run out.

    const traderBtcBalance = await vault.ensureMinimumFakeCoinBalance({
      sender: trader,
      coin: FakeCoin.BTC,
      minQuantity: DU(10),
      replenishQuantity: DU(1000),
    });

    const traderUsdcBalance = await vault.ensureMinimumFakeCoinBalance({
      sender: trader,
      coin: FakeCoin.USDC,
      minQuantity: DU(100_000),
      replenishQuantity: DU(1_000_000),
    });

    console.log(
      "  Current balance BTC=",
      traderBtcBalance.toString(),
      ", balance USDC=",
      traderUsdcBalance.toString()
    );

    await new Promise((f) => setTimeout(f, AUX_TRADER_CONFIG.refreshTime));
  }
}

async function main() {
  await setupTrader();
  await tradeCLOB();
}

main().then(() => {});
