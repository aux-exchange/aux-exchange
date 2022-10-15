/**
 * Demo of the supported Router swap functionality.
 */
import { AptosAccount, Types } from "aptos";
import assert from "assert";
import type { DecimalUnits } from "../src/units";
import { AU, DU, Market, Pool, Vault } from "../src";
import { AuxClient, CoinInfo, FakeCoin } from "../src/client";
import type { OrderPlacedEvent } from "../src/clob/core/events";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import type { RouterQuote } from "../src/router/dsl/router_quote";

async function printQuote(
  auxClient: AuxClient,
  exactAmount: DecimalUnits,
  quote: RouterQuote
) {
  const coinInSymbol = fakeCoinSymbol(quote.coinIn);
  const coinOutSymbol = fakeCoinSymbol(quote.coinOut);
  const coinIn = await auxClient.getCoinInfo(quote.coinIn);
  const coinOut = await auxClient.getCoinInfo(quote.coinOut);

  if (quote.type == "ExactOut") {
    console.log(
      `Quote for swapping ${coinInSymbol} for ${exactAmount.toNumber()} ${coinOutSymbol}:`
    );
    console.log(
      `required ${fakeCoinSymbol(quote.coinIn)}: ${quote.amount.toDecimalUnits(
        coinIn.decimals
      )}`
    );
  } else {
    console.log(
      `Quote for swapping ${exactAmount.toNumber()} ${coinInSymbol} for ${coinOutSymbol}:`
    );
    console.log(
      `expected ${fakeCoinSymbol(quote.coinOut)}: ${quote.amount.toDecimalUnits(
        coinOut.decimals
      )}`
    );
  }
  console.log(`gas amount: ${quote.estGasAmount}`);
  console.log(`gas price: ${quote.estGasPrice}`);
  console.log("Route:");
  quote.routes.forEach(async (route, i) => {
    console.log(
      `${i}: swap ${route.amountIn.toDecimalUnits(
        coinIn.decimals
      )} ${coinInSymbol} for ${route.amountOut.toDecimalUnits(
        coinOut.decimals
      )} ${coinOutSymbol} via ${route.venue}`
    );
    const feeDecimals =
      route.feeOrRebateCurrency === coinIn.coinType
        ? coinIn.decimals
        : coinOut.decimals;
    console.log(
      `   fee: ${route.feeAmount.toDecimalUnits(feeDecimals)} (${fakeCoinSymbol(
        route.feeOrRebateCurrency
      )})`
    );
    console.log(`   price impact: ${route.priceImpactPct}%)`);
  });
}

function fakeCoinSymbol(name: Types.MoveStructTag): string {
  let [inner] = name.split("<").slice(-1);
  inner = inner!.split(">")[0];
  let [fakeCoinSymbol] = inner!.split("::").slice(-1);
  return fakeCoinSymbol!;
}

async function setupAccount(
  auxClient: AuxClient,
  account: AptosAccount
): Promise<void> {
  await auxClient.airdropNativeCoin({
    account: account.address(),
    quantity: AU(50_000_000),
  });
  // We support several fake coins that can be used for test trading. You can
  // mint and burn any quantities.
  let tx = await auxClient.registerAndMintFakeCoin({
    sender: account,
    coin: FakeCoin.BTC,
    amount: DU(1000), // i.e. 1000 BTC
  });
  assert(tx.success);
  // console.log(tx);
  tx = await auxClient.registerAndMintFakeCoin({
    sender: account,
    coin: FakeCoin.USDC,
    amount: DU(1_000_000), // i.e. $1m
  });
  assert(tx.success);
}

async function main() {
  const [auxClient, moduleAuthority] = AuxClient.createFromEnvForTesting({});

  /***********************/
  /* INITIALIZE ACCOUNTS */
  /***********************/

  // Create accounts for the demo and provide a bit of native token and fake
  // currency to play with.
  //
  // AU is a shortcut for AtomicUnits, the native u64 on-chain quantity. DU is a
  // shortcut for DecimalUnits, the fixed-precision representation that will be
  // converted to AU in API calls.

  const alice: AptosAccount = new AptosAccount();
  const bob: AptosAccount = new AptosAccount();
  const aliceAddr = alice.address().toString();
  const bobAddr = bob.address().toString();
  const routerTrader = new AptosAccount();
  console.log("alice", alice.address().toString());
  console.log("bob", bob.address().toString());
  console.log("routerTrader", routerTrader.address().toString());

  await setupAccount(auxClient, alice);
  await setupAccount(auxClient, bob);
  await setupAccount(auxClient, routerTrader);

  const usdcCoinInfo: CoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.USDC);
  const btcCoinInfo: CoinInfo = await auxClient.getFakeCoinInfo(FakeCoin.BTC);
  const usdcCoinType: string = usdcCoinInfo.coinType;
  const btcCoinType: string = btcCoinInfo.coinType;

  /***************/
  /* CREATE POOL */
  /***************/

  let pool: Pool;
  const maybePool = await Pool.read(auxClient, {
    coinTypeX: btcCoinType,
    coinTypeY: usdcCoinType,
  });
  if (maybePool == undefined) {
    pool = await Pool.create(auxClient, {
      sender: moduleAuthority,
      coinTypeX: btcCoinType,
      coinTypeY: usdcCoinType,
      feePct: 0,
    });
    console.log(
      "createPool",
      pool.amountX.toString(),
      pool.amountY.toString(),
      pool.amountLP.toString()
    );
    assert.equal(pool.amountX, 0);
    assert.equal(pool.amountY, 0);
    assert.equal(pool.amountLP, 0);
  } else {
    pool = maybePool;
  }

  if (pool.amountAuLP.toNumber() === 0) {
    const tx = await pool.addExactLiquidity({
      sender: alice,
      amountX: DU(10),
      amountY: DU(220_000),
    });
    assert.ok(tx.tx.success, JSON.stringify(tx, undefined, "  "));
  } else {
    const tx = await pool.addLiquidity({
      sender: alice,
      amountX: DU(10),
      amountY: DU(220_000),
      maxSlippageBps: AU(100),
    });
    assert.ok(tx.tx.success, JSON.stringify(tx, undefined, "  "));
  }
  await pool.update();
  console.log(`Pool reserves:`);
  console.log(
    `    ${fakeCoinSymbol(pool.coinInfoX.coinType)}: ${pool.amountX}`
  );
  console.log(
    `    ${fakeCoinSymbol(pool.coinInfoY.coinType)}: ${pool.amountY}`
  );

  /**********************************/
  /* CREATE VAULT AND USER ACCOUNTS */
  /**********************************/

  const vault: Vault = new Vault(auxClient);
  await vault.createAuxAccount(alice);
  await vault.createAuxAccount(bob);

  await vault.deposit(alice, usdcCoinType, DU(50_000));
  await vault.deposit(alice, btcCoinType, DU(100));
  assert.equal(
    (await vault.balance(aliceAddr, usdcCoinType)).toNumber(),
    50_000
  );
  assert.equal((await vault.balance(aliceAddr, btcCoinType)).toNumber(), 100);

  await vault.deposit(bob, usdcCoinType, DU(50_000));
  await vault.deposit(bob, btcCoinType, DU(100));
  assert.equal((await vault.balance(bobAddr, usdcCoinType)).toNumber(), 50_000);
  assert.equal((await vault.balance(bobAddr, btcCoinType)).toNumber(), 100);

  /*****************/
  /* CREATE MARKET */
  /*****************/

  const market: Market = await Market.create(auxClient, {
    sender: moduleAuthority,
    baseCoinType: btcCoinType,
    quoteCoinType: usdcCoinType,
    baseLotSize: AU(10000),
    quoteLotSize: AU(10000),
  });
  assert.ok(market);

  /**********************/
  /* PLACE LIMIT ORDERS */
  /**********************/

  let tx = await market.placeOrder({
    sender: alice,
    delegator: aliceAddr,
    isBid: false,
    limitPrice: DU(23_100),
    quantity: DU(0.25),
    auxToBurn: DU(0),
    orderType: OrderType.LIMIT_ORDER,
    stpActionType: STPActionType.CANCEL_PASSIVE,
  });
  assert(tx.tx.success, tx.tx.hash);
  console.log("placeLimitOrder", tx.tx.hash, tx.tx.vm_status);
  assert.equal(1, tx.payload?.length);
  let event = tx.payload[0]!;
  assert.equal(event.type, "OrderPlacedEvent");
  assert.equal((event as OrderPlacedEvent).quantity.toString(), "25000000");

  // bob sells .5 @ 22,500
  tx = await market.placeOrder({
    sender: bob,
    delegator: bobAddr,
    isBid: false,
    limitPrice: DU(22_500),
    quantity: DU(0.5),
    auxToBurn: DU(0),
    orderType: OrderType.LIMIT_ORDER,
    stpActionType: STPActionType.CANCEL_PASSIVE,
  });
  console.log("placeLimitOrder", tx.tx.hash, tx.tx.vm_status);
  assert.equal(1, tx.payload?.length);
  event = tx.payload[0]!;
  assert.equal(event.type, "OrderPlacedEvent");
  assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");

  /********************/
  /* SWAP WITH ROUTER */
  /********************/

  const router = auxClient.getRouter(routerTrader);

  // get and process quote
  const exactAmount = DU(0.749);
  const quoteResult = await router.quoteCoinForExactCoin({
    coinTypeIn: usdcCoinType,
    coinTypeOut: btcCoinType,
    exactAmountOut: exactAmount,
  });

  if (quoteResult.payload === undefined) {
    console.log("get quote failed");
    console.log(quoteResult.tx);
  } else {
    await printQuote(auxClient, exactAmount, quoteResult.payload);
  }

  // Swap up to 0.1 BTC for exactly 1000 USDC. Choose the best price between AMM
  // swaps and CLOB orders.
  const txResult = await router.swapCoinForExactCoin(
    {
      coinTypeIn: usdcCoinType,
      coinTypeOut: btcCoinType,
      maxAmountIn: !!quoteResult.payload
        ? quoteResult.payload.amount
        : DU(17_000),
      exactAmountOut: DU(0.749),
    },
    {
      maxGasAmount: AU(50_000),
      gasUnitPrice: AU(100),
    }
  );
  console.log("swapCoinForExactCoin", txResult.tx.hash);

  // The swap returns the sequence of AMM swaps and CLOB fills that occurred.
  if (!txResult.tx.success) {
    console.log(txResult.tx);
    throw new Error("swap tx failed");
  } else {
    for (const event of txResult.payload) {
      console.log("event", event);
    }
  }

  // Swap exactly 0.749 BTC for USDC. All wille execute via AMM since CLOB is empty.
  const quoteResult2 = await router.quoteExactCoinForCoin({
    coinTypeIn: btcCoinType,
    coinTypeOut: usdcCoinType,
    exactAmountIn: exactAmount,
  });

  if (quoteResult2.payload === undefined) {
    console.log("get quote failed");
    console.log(quoteResult2.tx);
  } else {
    await printQuote(auxClient, exactAmount, quoteResult2.payload);
  }

  //  Similar to the above function, the payload contains
  // the sequence of AMM swaps and CLOB fills. We omit that for brevity.
  const txResult2 = await router.swapExactCoinForCoin(
    {
      coinTypeIn: btcCoinType,
      coinTypeOut: usdcCoinType,
      exactAmountIn: exactAmount,
      minAmountOut: !!quoteResult2.payload
        ? quoteResult2.payload.amount
        : DU(17_000),
    },
    {
      maxGasAmount: AU(50_000),
      gasUnitPrice: AU(100),
    }
  );
  // The swap returns the sequence of AMM swaps and CLOB fills that occurred.
  if (!txResult2.tx.success) {
    console.log(txResult.tx);
    throw new Error("swap tx failed");
  } else {
    console.log("swap BTC to USDC succeeded");
  }
}

main();
