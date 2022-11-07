import type { AptosAccount } from "aptos";
import * as assert from "assert";
import BN from "bn.js";
import { describe, it } from "mocha";
import AuxAccount from "../src/account";
import { AuxClient, CoinInfo, quantize } from "../src/client";
import * as clob from "../src/clob/core";
import type { OrderPlacedEvent } from "../src/clob/core/events";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import Market from "../src/clob/dsl/market";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AtomicUnits, AU, DecimalUnits, DU } from "../src/units";
import * as vault from "../src/vault/core";
import Vault from "../src/vault/dsl/vault";
import { getAliceBob, withdrawAll } from "./alice-and-bob";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);
const moduleAuthority = auxClient.moduleAuthority!;

const auxCoin = auxClient.getWrappedFakeCoinType(FakeCoin.AUX);
const baseCoin = auxCoin;
const quoteCoin = auxClient.getWrappedFakeCoinType(FakeCoin.SOL);

let alice: AptosAccount;
let bob: AptosAccount;
let aliceAddr: string;
let bobAddr: string;

function getZeroAuxOrderId(orderCounter: BN): string {
  let r = new BN(1);
  r = r.shln(64).subn(1).shln(64).add(orderCounter);

  return r.toString();
}

describe("CLOB DSL tests", function () {
  this.timeout(30000);

  let quoteCoinInfo: CoinInfo;

  let vault: Vault;
  let market: Market;

  it("fund accounts", async function () {
    [alice, bob] = await getAliceBob(auxClient);
    aliceAddr = alice.address().toString();
    bobAddr = bob.address().toString();

    quoteCoinInfo = await auxClient.getCoinInfo(quoteCoin);
    // Create two accounts, Alice and Bob, and fund
    console.log("\n=== Addresses ===");
    console.log(`Module: ${auxClient.moduleAddress}`);
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob.address()}`);
  });

  it("mintAux", async function () {
    let tx = await auxClient.registerAuxCoin({ sender: alice });
    // assert.ok(tx.success, `${tx.vm_status}`);
    tx = await auxClient.registerAuxCoin({ sender: bob });
    // assert.ok(tx.success, `${tx.vm_status}`);
    tx = await auxClient.mintAux(aliceAddr, AU(100_000_000), {
      sender: moduleAuthority,
    });
    assert.ok(tx.success, `${tx.vm_status}`);
    tx = await auxClient.mintAux(bobAddr, AU(100_000_000), {
      sender: moduleAuthority,
    });
    assert.ok(tx.success, `${tx.vm_status}`);
  });

  it("createVault", async function () {
    vault = new Vault(auxClient);
  });

  it("createAuxAccount", async function () {
    await vault.createAuxAccount({ sender: alice });
    await vault.createAuxAccount({ sender: bob });
  });

  it("depositToAuxAccount", async function () {
    let tx = await vault.deposit(alice, quoteCoin, DU(0.004));
    assert.ok(tx.success, `${tx.vm_status}}]`);
    assert.equal((await vault.balance(aliceAddr, quoteCoin)).toNumber(), 0.004);
    assert.equal((await vault.balance(aliceAddr, baseCoin)).toNumber(), 0);

    tx = await vault.deposit(bob, baseCoin, DU(50));
    assert.ok(tx.success, `${tx.vm_status}}]`);
    assert.equal((await vault.balance(bobAddr, quoteCoin)).toNumber(), 0);
    assert.equal((await vault.balance(bobAddr, baseCoin)).toNumber(), 50);
  });

  it("createMarket", async function () {
    market = await Market.create(auxClient, {
      sender: moduleAuthority,
      baseCoinType: baseCoin,
      quoteCoinType: quoteCoin,
      baseLotSize: new AtomicUnits(1000),
      quoteLotSize: new AtomicUnits(1000),
    });

    assert.ok(market);
  });

  it("placeLimitOrder", async function () {
    const tx = await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: true,
      limitPrice: new DecimalUnits(0.001),
      quantity: new DecimalUnits(2),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    assert.equal(1, tx.result?.length);
    const event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "2000000");
    assert.equal(
      await vault.availableBalance(aliceAddr, quoteCoin),
      quantize(0.004 - 0.002, quoteCoinInfo.decimals)
    );
    const auxAccount = new AuxAccount(auxClient, alice.address().toString());

    await auxAccount.openOrders({
      baseCoinType: baseCoin,
      quoteCoinType: quoteCoin,
    });

    await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: false,
      limitPrice: new DecimalUnits(0.001),
      quantity: new DecimalUnits(1),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    assert.equal((await vault.balance(bobAddr, baseCoin)).toNumber(), 49);
    assert.equal(
      (await vault.balance(bobAddr, quoteCoin)).toNumber(),
      quantize(0.001, quoteCoinInfo.decimals)
    );
    assert.equal(
      (await vault.availableBalance(bobAddr, quoteCoin)).toNumber(),
      quantize(0.001, quoteCoinInfo.decimals)
    );
    assert.equal(
      (await vault.balance(aliceAddr, quoteCoin)).toNumber(),
      quantize(0.004 - 0.001, quoteCoinInfo.decimals)
    );
    assert.equal((await vault.balance(aliceAddr, baseCoin)).toNumber(), 1);
    assert.equal(
      (await vault.availableBalance(aliceAddr, quoteCoin)).toNumber(),
      quantize(0.004 - 0.001 - 0.001, quoteCoinInfo.decimals)
    );
  });

  it("market book parsing", async () => {
    await market.update();
    const bid = market.l2.bids[0]!;
    assert.equal(bid.price.toString(), "0.001");
    assert.equal(bid.quantity.toNumber(), 1);
  });

  it("cancelOrder", async function () {
    await market.update();
    const orderId = getZeroAuxOrderId(market.nextOrderId.subn(2)).toString();
    await market.cancelOrder({ sender: alice, orderId });
    assert.equal(
      await vault.availableBalance(aliceAddr, quoteCoin),
      quantize(0.004 - 0.001, quoteCoinInfo.decimals)
    );
    assert.equal(
      (await vault.balance(aliceAddr, quoteCoin)).toNumber(),
      quantize(0.004 - 0.001, quoteCoinInfo.decimals)
    );
  });

  it("cancelAll", async function () {
    await market.update();
    await market.cancelAll(bob);
    await market.update();
    await market.cancelAll(alice);
    // this is actually a no-op since no open order for bob
    assert.equal((await vault.balance(bobAddr, baseCoin)).toNumber(), 49);
    assert.equal(
      (await vault.balance(bobAddr, quoteCoin)).toNumber(),
      quantize(0.001, quoteCoinInfo.decimals)
    );
    assert.equal(
      await vault.availableBalance(bobAddr, quoteCoin),
      quantize(0.001, quoteCoinInfo.decimals)
    );
  });

  it("withrawal", async function () {
    // withdrawal all the money, so core test can run successfully.
    await withdrawAll(auxClient);
  });

  it("getPlacedOrderEvents", async function () {
    await market.update();
    const placedOrderEvents = await market.orders();
    assert.ok(placedOrderEvents.length >= 1);
    const last = placedOrderEvents[placedOrderEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), alice.address().toShortString());
    assert.ok(last.isBid);
    assert.equal(
      last.quantity.toDecimalUnits(market.baseCoinInfo.decimals).toNumber(),
      2
    );
    assert.equal(
      last.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.001
    );
  });

  it("getFillEvents", async function () {
    await market.update();
    const fillEvents = await market.fills();
    assert.ok(fillEvents.length >= 2);

    // last is maker (alice)
    const last = fillEvents[fillEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), alice.address().toShortString());
    assert.ok(last.isBid);
    assert.equal(
      last.baseQuantity.toDecimalUnits(market.baseCoinInfo.decimals).toNumber(),
      1
    );
    assert.equal(
      last.remainingQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
    assert.equal(
      last.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.001
    );

    // secondLast is taker (bob)
    const secondLast = fillEvents[fillEvents.length - 2]!;
    assert.equal(
      secondLast.owner.toShortString(),
      bob.address().toShortString()
    );
    assert.ok(!secondLast.isBid);
    assert.equal(
      secondLast.baseQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
    assert.equal(
      secondLast.remainingQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      0
    );
    assert.equal(
      secondLast.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.001
    );
  });

  it("getCancelEvents", async function () {
    await market.update();
    const cancelEvents = await market.cancels();
    assert.ok(cancelEvents.length >= 1);
    const last = cancelEvents[cancelEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), alice.address().toShortString());
    assert.equal(
      last.cancelQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
  });
});

describe("CLOB Core tests", function () {
  this.timeout(30000);

  it("fund accounts", async function () {
    [alice, bob] = await getAliceBob(auxClient);
    aliceAddr = alice.address().toString();
    bobAddr = bob.address().toString();
    // Create two accounts, Alice and Bob, and fund
    console.log("\n=== Addresses ===");
    console.log(`module: ${auxClient.moduleAddress}`);
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob.address()}`);
  });

  it("mintAux", async function () {
    await Promise.all([
      await auxClient.registerAuxCoin({ sender: alice }),
      await auxClient.registerAuxCoin({ sender: bob }),
    ]);
    await Promise.all([
      await auxClient.mintAux(aliceAddr, AU(100_000_000), {
        sender: moduleAuthority,
      }),
      await auxClient.mintAux(bobAddr, AU(100_000_000), {
        sender: moduleAuthority,
      }),
    ]);
  });

  it("createAuxAccount", async function () {
    await vault.mutation.createAuxAccount(auxClient, { sender: alice });
    await vault.mutation.createAuxAccount(auxClient, { sender: bob });
  });

  it("depositToAuxAccount", async function () {
    let tx = await vault.mutation.deposit(auxClient, {
      sender: alice,
      to: aliceAddr,
      coinType: quoteCoin,
      amountAu: (400_000).toString(),
    });
    assert.ok(tx.success, `${JSON.stringify(tx.vm_status, undefined, "  ")}`);
    assert.equal(
      (await vault.query.balance(auxClient, aliceAddr, quoteCoin)).toNumber(),
      400_000
    );
    assert.equal(
      (await vault.query.balance(auxClient, aliceAddr, auxCoin)).toNumber(),
      0
    );

    tx = await vault.mutation.deposit(auxClient, {
      sender: bob,
      to: bobAddr,
      coinType: auxCoin,
      amountAu: (50_000_000).toString(),
    });
    assert.ok(tx.success, `${JSON.stringify(tx.vm_status, undefined, "  ")}`);
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, quoteCoin)).toNumber(),
      0
    );
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, auxCoin)).toNumber(),
      50_000_000
    );
  });

  it("createMarket", async function () {
    await clob.mutation.createMarket(auxClient, {
      sender: moduleAuthority,
      baseCoinType: baseCoin,
      quoteCoinType: quoteCoin,
      baseLotSize: "1000",
      quoteLotSize: "1000",
    });
    await clob.query.market(auxClient, baseCoin, quoteCoin);
  });

  it("listMarkets", async function () {
    // Create some fake markets
    const usdcCoin = await auxClient.getFakeCoinInfo(FakeCoin.USDC);
    await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, AU(100), {
      sender: alice,
    });
    await clob.mutation.createMarket(auxClient, {
      sender: moduleAuthority,
      baseCoinType: baseCoin,
      quoteCoinType: usdcCoin.coinType,
      baseLotSize: "100000",
      quoteLotSize: "1000",
    });
    await clob.query.market(auxClient, baseCoin, usdcCoin.coinType);
    await clob.mutation.createMarket(auxClient, {
      sender: moduleAuthority,
      baseCoinType: quoteCoin,
      quoteCoinType: usdcCoin.coinType,
      baseLotSize: "100000",
      quoteLotSize: "100000",
    });
    await clob.query.market(auxClient, quoteCoin, usdcCoin.coinType);
    const markets = await clob.query.markets(auxClient);
    assert.ok(markets.length >= 3);
  });

  it("placeLimitOrder", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    await clob.mutation.placeOrder(auxClient, {
      sender: alice,
      delegator: aliceAddr,
      market,
      isBid: true,
      limitPriceAu: (100_000).toString(),
      quantityAu: (2_000_000).toString(),
      auxToBurnAu: "0",
      clientOrderId: "0",
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    assert.equal(
      await vault.query.availableBalance(auxClient, aliceAddr, quoteCoin),
      400_000 - 200_000
    );
    await clob.mutation.placeOrder(auxClient, {
      sender: bob,
      delegator: bobAddr,
      market,
      isBid: false,
      limitPriceAu: (100_000).toString(),
      quantityAu: (1_000_000).toString(),
      auxToBurnAu: "0",
      clientOrderId: "0",
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, auxCoin)).toNumber(),
      49_000_000
    );
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, quoteCoin)).toNumber(),
      Math.floor(100_000)
    );
    assert.equal(
      (
        await vault.query.availableBalance(auxClient, bobAddr, quoteCoin)
      ).toNumber(),
      Math.floor(100_000)
    );
    assert.equal(
      (await vault.query.balance(auxClient, aliceAddr, quoteCoin)).toNumber(),
      400_000 - Math.floor(100_000)
    );
    assert.equal(
      (await vault.query.balance(auxClient, aliceAddr, auxCoin)).toNumber(),
      1_000_000
    );
    assert.equal(
      await vault.query.availableBalance(auxClient, aliceAddr, quoteCoin),
      400_000 - Math.floor(100_000) - Math.floor(100_000)
    );
  });
  it("getOrderbook", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    let book = await clob.query.orderbook(auxClient, baseCoin, quoteCoin);
    const initBidsLen = book.bids.length;
    const initAsksLen = book.asks.length;
    await clob.mutation.placeOrder(auxClient, {
      sender: alice,
      delegator: aliceAddr,
      market,
      isBid: true,
      limitPriceAu: (50_000).toString(),
      quantityAu: (1_000_000).toString(),
      auxToBurnAu: "0",
      clientOrderId: "100",
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    book = await clob.query.orderbook(auxClient, baseCoin, quoteCoin);
    assert.equal(book.bids.length, initBidsLen + 1);
    await clob.mutation.placeOrder(auxClient, {
      sender: bob,
      delegator: bobAddr,
      market,
      isBid: false,
      limitPriceAu: (200_000).toString(),
      quantityAu: (1_000_000).toString(),
      auxToBurnAu: "0",
      clientOrderId: "200",
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });

    book = await clob.query.orderbook(auxClient, baseCoin, quoteCoin);
    assert.equal(book.asks.length, initAsksLen + 1);
    assert.equal(
      book.asks
        .find((level) => {
          return level.price.toNumber() == 200_000;
        })
        ?.orders.at(-1)!.clientId,
      200
    );
    assert.equal(
      book.bids
        .find((level) => {
          return level.price.toNumber() == 50_000;
        })
        ?.orders.at(-1)!.clientId,
      100
    );
  });

  it("cancelOrder", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    const orderId = getZeroAuxOrderId(market.nextOrderId.subn(2)).toString();
    await clob.mutation.cancelOrder(auxClient, {
      sender: alice,
      delegator: aliceAddr,
      baseCoinType: auxCoin,
      quoteCoinType: quoteCoin,
      orderId,
    });
    assert.equal(
      await vault.query.availableBalance(auxClient, aliceAddr, quoteCoin),
      400_000 - 200_000
    );
  });

  it("cancelAll", async function () {
    await clob.mutation.cancelAll(auxClient, {
      sender: bob,
      delegator: bobAddr,
      baseCoinType: auxCoin,
      quoteCoinType: quoteCoin,
    });
    await clob.mutation.cancelAll(auxClient, {
      sender: alice,
      baseCoinType: auxCoin,
      quoteCoinType: quoteCoin,
    });
    // this is actually a no-op since no open order for bob
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, auxCoin)).toNumber(),
      49_000_000
    );
    assert.equal(
      (await vault.query.balance(auxClient, bobAddr, quoteCoin)).toNumber(),
      Math.floor(100_000)
    );
    assert.equal(
      (
        await vault.query.availableBalance(auxClient, bobAddr, quoteCoin)
      ).toNumber(),
      Math.floor(100_000)
    );
  });

  it("withdrawal", async function () {
    await withdrawAll(auxClient);
  });
  it("getPlacedOrderEvents", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    const placedOrderEvents = await clob.query.orderPlacedEvents(
      auxClient,
      auxClient.moduleAddress,
      market
    );

    assert.ok(placedOrderEvents.length >= 1);
    const last = placedOrderEvents[placedOrderEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), bob.address().toShortString());
    assert.ok(last.isBid == false);
    assert.equal(
      last.quantity.toDecimalUnits(market.baseCoinInfo.decimals).toNumber(),
      1
    );
    assert.equal(
      last.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.002
    );
  });

  it("getFillEvents", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    const fillEvents = await clob.query.orderFillEvents(
      auxClient,
      auxClient.moduleAddress,
      market
    );
    assert.ok(fillEvents.length >= 2);

    // last is maker (alice)
    const last = fillEvents[fillEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), alice.address().toShortString());
    assert.ok(last.isBid);
    assert.equal(
      last.baseQuantity.toDecimalUnits(market.baseCoinInfo.decimals).toNumber(),
      1
    );
    assert.equal(
      last.remainingQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
    assert.equal(
      last.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.001
    );

    // secondLast is taker (bob)
    const secondLast = fillEvents[fillEvents.length - 2]!;
    assert.equal(
      secondLast.owner.toShortString(),
      bob.address().toShortString()
    );
    assert.ok(!secondLast.isBid);
    assert.equal(
      secondLast.baseQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
    assert.equal(
      secondLast.remainingQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      0
    );
    assert.equal(
      secondLast.price.toDecimalUnits(market.quoteCoinInfo.decimals).toNumber(),
      0.001
    );
  });

  it("getCancelEvents", async function () {
    const market = await clob.query.market(auxClient, baseCoin, quoteCoin);
    const cancelEvents = await clob.query.orderCancelEvents(
      auxClient,
      auxClient.moduleAddress,
      market
    );

    assert.ok(cancelEvents.length >= 1);
    const last = cancelEvents[cancelEvents.length - 1]!;
    assert.equal(last.owner.toShortString(), alice.address().toShortString());
    assert.equal(
      last.cancelQuantity
        .toDecimalUnits(market.baseCoinInfo.decimals)
        .toNumber(),
      1
    );
  });
});
