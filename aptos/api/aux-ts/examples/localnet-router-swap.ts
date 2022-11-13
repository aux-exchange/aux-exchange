/**
 * Demo of the supported Router swap functionality.
 */
import { AptosAccount, AptosClient, Types } from "aptos";
import assert from "assert";
import { AU, DU, Market, Vault } from "../src";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import { AuxClient, CoinInfo } from "../src/client";
import type { OrderPlacedEvent } from "../src/clob/core/events";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import { FakeCoin } from "../src/coin";
import type { RouterQuote } from "../src/router/dsl/router_quote";
import { Bps, DecimalUnits } from "../src/units";

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
  await auxClient.fundAccount({
    account: account.address(),
    quantity: AU(50_000_000),
  });
  // We support several fake coins that can be used for test trading. You can
  // mint and burn any quantities.
  let tx = await auxClient.registerAndMintFakeCoin(
    FakeCoin.BTC,
    DU(1000), // i.e. 1000 BTC
    { sender: account }
  );
  assert(tx.success);
  // console.log(tx);
  tx = await auxClient.registerAndMintFakeCoin(
    FakeCoin.USDC,
    DU(1_000_000), // i.e. $1m
    { sender: account }
  );
  assert(tx.success);
}

async function main() {
  const auxClient = new AuxClient(
    "local",
    new AptosClient("http://localhost:8081")
  );
  const moduleAuthority = auxClient.moduleAuthority!;

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

  const poolClient = new ConstantProductClient(auxClient, {
    coinTypeX: btcCoinType,
    coinTypeY: usdcCoinType,
  });
  await poolClient.create({ fee: new Bps(0) }, { sender: moduleAuthority });
  let pool = await poolClient.query();
  console.log(
    "createPool",
    pool.amountX.toString(),
    pool.amountY.toString(),
    pool.amountLP.toString()
  );
  if (pool.amountLP.toNumber() === 0) {
    const tx = await poolClient.addExactLiquidity(
      {
        amountX: DU(10),
        amountY: DU(220_000),
      },
      { sender: alice }
    );

    assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
  } else {
    const tx = await poolClient.addLiquidity(
      {
        amountX: DU(10),
        amountY: DU(220_000),
        slippage: new Bps(100),
      },
      { sender: alice }
    );
    assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
  }
  pool = await poolClient.query();
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
  await vault.createAuxAccount({ sender: alice });
  await vault.createAuxAccount({ sender: bob });

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
  assert(tx.transaction.success, tx.transaction.hash);
  console.log("placeLimitOrder", tx.transaction.hash, tx.transaction.vm_status);
  assert.equal(1, tx.result);
  let event = tx.result![0]!;
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
  console.log("placeLimitOrder", tx.transaction.hash, tx.transaction.vm_status);
  assert.equal(1, tx.result ?? []?.length);
  event = tx.result![0]!;
  assert.equal(event.type, "OrderPlacedEvent");
  assert.equal((event as OrderPlacedEvent).quantity.toString(), "50000000");

  /********************/
  /* SWAP WITH ROUTER */
  /********************/

  const router = auxClient.getRouter(routerTrader);

  // get and process quote
  const exactAmount = DU(0.749);
  const quoteResult = await router.getQuoteCoinForExactCoin({
    coinTypeIn: usdcCoinType,
    coinTypeOut: btcCoinType,
    exactAmountOut: exactAmount,
  });

  if (quoteResult.result === undefined) {
    console.log("get quote failed");
    console.log(quoteResult.transaction);
  } else {
    await printQuote(auxClient, exactAmount, quoteResult.result);
  }

  // Swap up to 0.1 BTC for exactly 1000 USDC. Choose the best price between AMM
  // swaps and CLOB orders.
  const txResult = await router.swapCoinForExactCoin(
    {
      coinTypeIn: usdcCoinType,
      coinTypeOut: btcCoinType,
      maxAmountIn: !!quoteResult.result
        ? quoteResult.result.amount
        : DU(17_000),
      exactAmountOut: DU(0.749),
    },
    {
      maxGasAmount: AU(50_000),
      gasUnitPrice: AU(100),
    }
  );
  console.log("swapCoinForExactCoin", txResult.transaction.hash);

  // The swap returns the sequence of AMM swaps and CLOB fills that occurred.
  if (!txResult.transaction.success) {
    console.log(txResult.transaction);
    throw new Error("swap tx failed");
  } else {
    for (const event of txResult.result ?? []) {
      console.log("event", event);
    }
  }

  // Swap exactly 0.749 BTC for USDC. All wille execute via AMM since CLOB is empty.
  const quoteResult2 = await router.getQuoteExactCoinForCoin({
    coinTypeIn: btcCoinType,
    coinTypeOut: usdcCoinType,
    exactAmountIn: exactAmount,
  });

  if (quoteResult2.result === undefined) {
    console.log("get quote failed");
    console.log(quoteResult2.transaction);
  } else {
    await printQuote(auxClient, exactAmount, quoteResult2.result);
  }

  //  Similar to the above function, the payload contains
  // the sequence of AMM swaps and CLOB fills. We omit that for brevity.
  const txResult2 = await router.swapExactCoinForCoin(
    {
      coinTypeIn: btcCoinType,
      coinTypeOut: usdcCoinType,
      exactAmountIn: exactAmount,
      minAmountOut: !!quoteResult2.result
        ? quoteResult2.result.amount
        : DU(17_000),
    },
    {
      maxGasAmount: AU(50_000),
      gasUnitPrice: AU(100),
    }
  );
  // The swap returns the sequence of AMM swaps and CLOB fills that occurred.
  if (!txResult2.transaction.success) {
    console.log(txResult.transaction);
    throw new Error("swap tx failed");
  } else {
    console.log("swap BTC to USDC succeeded");
  }
}

main();
