import { AptosAccount, CoinClient } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
import { AuxClient, CoinInfo } from "../src/client";
import type { OrderPlacedEvent } from "../src/clob/core/events";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import Market from "../src/clob/dsl/market";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import type { ConstantProduct } from "../src/pool/constant-product/schema";
import * as core from "../src/router/core";
import type Router from "../src/router/dsl/router";
import type { RouterQuote } from "../src/router/dsl/router_quote";
import { AtomicUnits, AU, Bps, DecimalUnits, DU } from "../src/units";
import Vault from "../src/vault/dsl/vault";
import { getAliceBob, withdrawAll } from "./alice-and-bob";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);
const moduleAuthority = auxClient.moduleAuthority!;
const coinClient = new CoinClient(auxClient.aptosClient);

const moduleAddress = auxClient.moduleAddress;
const clobAddress = auxClient.moduleAddress;
const vaultAddress = auxClient.moduleAddress;

let alice: AptosAccount;
let bob: AptosAccount;
let aliceAddr: string;
let bobAddr: string;

describe("Router Core tests", function () {
  this.timeout(30000);
  const aux: AptosAccount = moduleAuthority;

  let vault: Vault;
  let market: Market;

  let pool: ConstantProduct;
  let poolClient: ConstantProductClient;

  let btcCoinInfo: CoinInfo;
  let usdcCoinInfo: CoinInfo;
  let btcCoinType: string;
  let usdcCoinType: string;

  it("fund accounts", async function () {
    [alice, bob] = await getAliceBob(auxClient);
    aliceAddr = alice.address().toString();
    bobAddr = bob.address().toString();

    // Create two accounts, Alice and Bob, and fund
    console.log("\n=== Addresses ===");
    console.log(`Sender: ${moduleAuthority.address()}`);
    console.log(`Module: ${moduleAddress}`);
    console.log("CLOB Resource: " + clobAddress);
    console.log("VAULT Resource: " + vaultAddress);
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob.address()}`);
  });

  it("registerAndMint fake coins", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: moduleAuthority }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: moduleAuthority }
    );
    console.log(tx.success, tx.hash);
    await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: alice }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: alice }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: bob }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: bob }
    );
    console.log(tx.success, tx.hash);
  });

  it("createPool", async function () {
    usdcCoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.USDC);
    btcCoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.BTC);
    usdcCoinType = usdcCoinInfo.coinType;
    btcCoinType = btcCoinInfo.coinType;

    poolClient = new ConstantProductClient(auxClient, {
      coinTypeX: btcCoinType,
      coinTypeY: usdcCoinType,
    });
    await poolClient.create({ fee: new Bps(0) }, { sender: moduleAuthority });
    pool = await poolClient.query();

    if ((await pool).amountLP.toNumber() === 0) {
      const tx = await poolClient.addExactLiquidity(
        {
          amountX: DU(1),
          amountY: DU(22_000),
        },
        { sender: moduleAuthority }
      );
      assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
      pool = await poolClient.query();
    }
  });

  it("createVault", async function () {
    vault = new Vault(auxClient);
  });

  it("createAuxAccount", async function () {
    await vault.createAuxAccount({ sender: alice });
    await vault.createAuxAccount({ sender: bob });
  });

  it("depositToAuxAccount", async function () {
    await vault.deposit(alice, usdcCoinType, DU(50_000));
    await vault.deposit(alice, btcCoinType, DU(100));
    assert.equal(
      (await vault.balance(aliceAddr, usdcCoinType)).toNumber(),
      50_000
    );
    assert.equal((await vault.balance(aliceAddr, btcCoinType)).toNumber(), 100);

    await vault.deposit(bob, usdcCoinType, DU(50_000));
    await vault.deposit(bob, btcCoinType, DU(100));
    assert.equal(
      (await vault.balance(bobAddr, usdcCoinType)).toNumber(),
      50_000
    );
    assert.equal((await vault.balance(bobAddr, btcCoinType)).toNumber(), 100);
  });

  it("createMarket", async function () {
    market = await Market.create(auxClient, {
      sender: aux,
      baseCoinType: btcCoinType,
      quoteCoinType: usdcCoinType,
      baseLotSize: new AtomicUnits(10000),
      quoteLotSize: new AtomicUnits(10000),
    });

    assert.ok(market);
  });

  it("placeLimitSellOrder", async function () {
    // alice sells .25 @ 23,100
    market.update();
    let tx = await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: false,
      limitPrice: new DecimalUnits(23_100),
      quantity: new DecimalUnits(0.25),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    let event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "25000000");

    // bob sells .5 @ 22,500
    tx = await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: false,
      limitPrice: new DecimalUnits(22_500),
      quantity: new DecimalUnits(0.5),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");
  });

  it("swapUsdcForBtc", async function () {
    const initBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    console.log("initBtc", initBtc);
    const initUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    console.log("initUSDC", initUsdc);
    const txResult = await core.mutation.swapExactCoinForCoin(
      auxClient,
      {
        exactAmountAuIn: "17000000000",
        minAmountAuOut: "74900000",
        coinTypeIn: usdcCoinType,
        coinTypeOut: btcCoinType,
      },
      {
        sender: moduleAuthority,
        maxGasAmount: AU(1_000_000),
      }
    );
    assert.ok(
      txResult.transaction.success,
      `${JSON.stringify(txResult.transaction.vm_status)}`
    );
    console.log("swapUsdcForBtc", txResult.transaction.hash);
    // console.dir(txResult.result, { depth: null });
    const finalBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    const finalUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    assert.equal(initUsdc - finalUsdc, 17000000000);
    assert.ok(finalBtc - initBtc >= 74900000);
  });

  it("placeLimitBuyOrder", async function () {
    // alice buys .25 @ 20,900
    market.update();
    let tx = await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: true,
      limitPrice: new DecimalUnits(20_900),
      quantity: new DecimalUnits(0.25),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    let event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "25000000");

    // bob buys .5 @ 21,500
    tx = await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: true,
      limitPrice: new DecimalUnits(21_500),
      quantity: new DecimalUnits(0.5),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");
  });

  it("swapBtcForUsdc", async function () {
    const initBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    console.log("initBtc", initBtc);
    const initUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    const txResult = await core.mutation.swapExactCoinForCoin(
      auxClient,
      {
        exactAmountAuIn: "75000000",
        minAmountAuOut: "14900000000",
        coinTypeIn: btcCoinType,
        coinTypeOut: usdcCoinType,
      },
      {
        sender: moduleAuthority,
        maxGasAmount: AU(1_000_000),
      }
    );
    assert.ok(
      txResult.transaction.success,
      `${txResult.transaction.vm_status}`
    );
    // console.dir(txResult.result, { depth: null });
    pool = await poolClient.query();
    const finalBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    const finalUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    assert.equal(initBtc - finalBtc, 75000000);
    assert.ok(finalUsdc - initUsdc >= 15900000000);
  });

  it("cancelAllAndWithdraw", async function () {
    await market.cancelAll(bob);
    await market.cancelAll(alice);

    pool = await poolClient.query();

    const auLP = pool.amountLP
      .toAtomicUnits(pool.coinInfoLP.decimals)
      .toNumber();
    if (auLP >= 1000) {
      const tx1 = await poolClient.removeLiquidity(
        {
          amountLP: AU(auLP - 1000),
        },
        { sender: moduleAuthority }
      );
      assert.ok(tx1.transaction.success, `${tx1.transaction.vm_status}`);
      const tx = await poolClient.drain({ sender: moduleAuthority });
      assert.ok(tx.transaction.success, `${tx.transaction.vm_status}`);
    }

    await withdrawAll(auxClient);
  });
});

describe("Router DSL tests", function () {
  this.timeout(30000);
  const aux: AptosAccount = moduleAuthority;

  let vault: Vault;
  let market: Market;

  let pool: ConstantProduct;
  let poolClient: ConstantProductClient;

  let router: Router;

  let btcCoinInfo: CoinInfo;
  let usdcCoinInfo: CoinInfo;
  let btcCoinType: string;
  let usdcCoinType: string;

  let quoteBtcOut: DecimalUnits;
  let quoteUsdcIn: DecimalUnits;
  let quoteUsdcOut: DecimalUnits;

  it("fund accounts", async function () {
    [alice, bob] = await getAliceBob(auxClient);
    aliceAddr = alice.address().toString();
    bobAddr = bob.address().toString();

    // Create two accounts, Alice and Bob, and fund
    console.log("\n=== Addresses ===");
    console.log(`Sender: ${moduleAuthority.address()}`);
    console.log(`Module: ${moduleAddress}`);
    console.log("CLOB Resource: " + clobAddress);
    console.log("VAULT Resource: " + vaultAddress);
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob.address()}`);
  });

  it("registerAndMint fake coins", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: moduleAuthority }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: moduleAuthority }
    );
    console.log(tx.success, tx.hash);
    await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: alice }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: alice }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(100_000_000_000),
      { sender: bob }
    );
    console.log(tx.success, tx.hash);
    tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(100_000_000_000),
      { sender: bob }
    );
    console.log(tx.success, tx.hash);
  });

  it("createPool", async function () {
    usdcCoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.USDC);
    btcCoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.BTC);
    usdcCoinType = usdcCoinInfo.coinType;
    btcCoinType = btcCoinInfo.coinType;

    poolClient = new ConstantProductClient(auxClient, {
      coinTypeX: btcCoinType,
      coinTypeY: usdcCoinType,
    });
    await poolClient.create({ fee: new Bps(0) }, { sender: moduleAuthority });
    pool = await poolClient.query();

    if (pool.amountLP.toNumber() === 0) {
      const tx = await poolClient.addExactLiquidity(
        {
          amountX: DU(1),
          amountY: DU(22_000),
        },
        { sender: moduleAuthority }
      );
      assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
      pool = await poolClient.query();
    }
  });

  it("createVault", async function () {
    vault = new Vault(auxClient);
  });

  it("createAuxAccount", async function () {
    await vault.createAuxAccount({ sender: alice });
    await vault.createAuxAccount({ sender: bob });
  });

  it("depositToAuxAccount", async function () {
    await vault.deposit(alice, usdcCoinType, DU(50_000));
    await vault.deposit(alice, btcCoinType, DU(100));
    assert.equal(
      (await vault.balance(aliceAddr, usdcCoinType)).toNumber(),
      50_000
    );
    assert.equal((await vault.balance(aliceAddr, btcCoinType)).toNumber(), 100);

    await vault.deposit(bob, usdcCoinType, DU(50_000));
    await vault.deposit(bob, btcCoinType, DU(100));
    assert.equal(
      (await vault.balance(bobAddr, usdcCoinType)).toNumber(),
      50_000
    );
    assert.equal((await vault.balance(bobAddr, btcCoinType)).toNumber(), 100);
  });

  it("createMarket", async function () {
    market = await Market.create(auxClient, {
      sender: aux,
      baseCoinType: btcCoinType,
      quoteCoinType: usdcCoinType,
      baseLotSize: new AtomicUnits(10000),
      quoteLotSize: new AtomicUnits(10000),
    });

    assert.ok(market);
  });

  it("placeLimitSellOrder", async function () {
    // alice sells .25 @ 23,100
    market.update();
    let tx = await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: false,
      limitPrice: new DecimalUnits(23_100),
      quantity: new DecimalUnits(0.25),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    let event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "25000000");

    // bob sells .5 @ 22,500
    tx = await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: false,
      limitPrice: new DecimalUnits(22_500),
      quantity: new DecimalUnits(0.5),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");
  });

  it("createRouter", async function () {
    router = auxClient.getRouter(moduleAuthority);
    assert.ok(router);
  });

  it("quoteExactUsdcForBtc", async function () {
    const txResult = await router.getQuoteExactCoinForCoin({
      exactAmountIn: DU(17_000),
      coinTypeIn: usdcCoinType,
      coinTypeOut: btcCoinType,
    });
    assert.ok(
      txResult.transaction.success,
      `${JSON.stringify(txResult.transaction.vm_status)}`
    );
    console.log("quoteExactUsdcForBtc", txResult.transaction.hash);
    const quote: RouterQuote = txResult.result!;
    assert.equal(quote.routes.length, 2);
    assert.equal(
      quote.routes[0]!.amountOut.toNumber() +
        quote.routes[1]!.amountOut.toNumber(),
      quote.amount.toNumber()
    );
    // console.dir(quote, { depth: null });
    quoteBtcOut = quote.amount.toDecimalUnits(btcCoinInfo.decimals);
    assert.ok(quoteBtcOut.toNumber() >= 0.749);
  });

  it("quoteUsdcForExactBtc", async function () {
    const txResult = await router.getQuoteCoinForExactCoin({
      exactAmountOut: DU(0.749),
      coinTypeIn: usdcCoinType,
      coinTypeOut: btcCoinType,
    });
    assert.ok(
      txResult.transaction.success,
      `${JSON.stringify(txResult.transaction.vm_status)}`
    );
    console.log("quoteUsdcForExactBtc", txResult.transaction.hash);
    assert.ok(!!txResult.result);
    const quote: RouterQuote = txResult.result;
    assert.equal(quote.routes.length, 2);
    assert.equal(
      quote.routes[0]!.amountIn.toNumber() +
        quote.routes[1]!.amountIn.toNumber(),
      quote.amount.toNumber()
    );
    console.dir(quote.routes, { depth: null });
    quoteUsdcIn = quote.amount.toDecimalUnits(usdcCoinInfo.decimals);
    assert.ok(quoteUsdcIn.toNumber() <= 17_000);
  });

  it("swapUsdcForExactBtc", async function () {
    const initBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    console.log("initBtc", initBtc);
    const initUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    console.log("initUSDC", initUsdc);

    const txResult = await router.swapCoinForExactCoin(
      {
        maxAmountIn: DU(17_000),
        exactAmountOut: DU(0.749),
        coinTypeIn: usdcCoinType,
        coinTypeOut: btcCoinType,
      },
      { sender: moduleAuthority, maxGasAmount: AU(1_000_000) }
    );
    assert.ok(
      txResult.transaction.success,
      `${JSON.stringify(txResult.transaction.vm_status)}`
    );
    console.log("swapUsdcForBtc", txResult.transaction.hash);
    const finalBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    const btcReceived = AU(finalBtc - initBtc).toDecimalUnits(
      btcCoinInfo.decimals
    );
    assert.ok(btcReceived.toNumber() == 0.749);

    const finalUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    assert.equal(
      AU(initUsdc - finalUsdc)
        .toDecimalUnits(usdcCoinInfo.decimals)
        .toNumber(),
      quoteUsdcIn.toNumber()
    );
    assert.ok(initUsdc - finalUsdc <= 17000000000);
  });

  it("placeLimitBuyOrder", async function () {
    // alice buys .25 @ 20,900
    market.update();
    let tx = await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: true,
      limitPrice: new DecimalUnits(20_900),
      quantity: new DecimalUnits(0.25),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    let event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "25000000");

    // bob buys .5 @ 21,500
    tx = await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: true,
      limitPrice: new DecimalUnits(21_500),
      quantity: new DecimalUnits(0.5),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    console.log(
      "placeLimitOrder",
      tx.transaction.hash,
      tx.transaction.vm_status
    );
    assert.equal(1, tx.result?.length);
    event = tx.result![0]!;
    assert.equal(event.type, "OrderPlacedEvent");
    assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");
  });

  it("quoteExactBtcForUsdc", async function () {
    const txResult = await router.getQuoteExactCoinForCoin({
      exactAmountIn: DU(0.75),
      coinTypeIn: btcCoinType,
      coinTypeOut: usdcCoinType,
    });
    assert.ok(
      txResult.transaction.success,
      `${JSON.stringify(txResult.transaction.vm_status)}`
    );
    console.log("quoteExactBtcForUsdc", txResult.transaction.hash);
    assert.ok(!!txResult.result);
    const quote: RouterQuote = txResult.result;
    assert.equal(quote.routes.length, 2);
    assert.equal(
      quote.routes[0]!.amountOut.toNumber() +
        quote.routes[1]!.amountOut.toNumber(),
      quote.amount.toNumber()
    );
    // console.dir(quote, { depth: null });
    quoteUsdcOut = quote.amount.toDecimalUnits(usdcCoinInfo.decimals);
    assert.ok(quoteUsdcOut.toNumber() >= 14_900);
  });

  it("swapExactBtcForUsdc", async function () {
    const initBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    console.log("initBtc", initBtc);
    const initUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    const txResult = await router.swapExactCoinForCoin(
      {
        exactAmountIn: DU(0.75),
        minAmountOut: DU(14_900),
        coinTypeIn: btcCoinType,
        coinTypeOut: usdcCoinType,
      },
      { sender: moduleAuthority, maxGasAmount: AU(1_000_000) }
    );
    assert.ok(
      txResult.transaction.success,
      `${txResult.transaction.vm_status}`
    );
    pool = await poolClient.query();
    const finalUsdc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: usdcCoinType,
      })
    );
    const usdcReceived = AU(finalUsdc - initUsdc).toDecimalUnits(
      usdcCoinInfo.decimals
    );
    assert.equal(usdcReceived.toNumber(), quoteUsdcOut.toNumber());
    assert.ok(usdcReceived.toNumber() >= 15_900);

    const finalBtc = Number(
      await coinClient.checkBalance(moduleAuthority, {
        coinType: btcCoinType,
      })
    );
    assert.equal(initBtc - finalBtc, 75000000);
  });

  it("cancelAllAndWithdraw", async function () {
    await market.cancelAll(bob);
    await market.cancelAll(alice);

    pool = await poolClient.query();

    const auLP = pool.amountLP
      .toAtomicUnits(pool.coinInfoLP.decimals)
      .toNumber();
    if (auLP >= 1000) {
      const tx1 = await poolClient.removeLiquidity(
        {
          amountLP: AU(auLP - 1000),
        },
        { sender: moduleAuthority }
      );
      assert.ok(tx1.transaction.success, `${tx1.transaction.vm_status}`);
      const tx2 = await poolClient.drain({ sender: moduleAuthority });
      assert.ok(tx2.transaction.success, `${tx2.transaction.vm_status}`);
    }

    await withdrawAll(auxClient);
  });
});
