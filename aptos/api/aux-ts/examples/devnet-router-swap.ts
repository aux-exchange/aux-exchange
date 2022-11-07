/**
 * Demo of the supported Router swap functionality.
 */
import { AptosAccount, AptosClient } from "aptos";
import { AU, DU } from "../src";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import type { RouterQuote } from "../src/router/dsl/router_quote";

async function main() {
  // While you can technically connect directly to the Aptos Full Node, we strongly recommend
  // running your own Full Node.
  //
  // e.g.
  // const auxClient = new AuxClient("devnet", new AptosClient("http://localhost:8080"));
  const auxClient = new AuxClient(
    "devnet",
    new AptosClient("https://fullnode.devnet.aptoslabs.com/v1")
  );

  // Create a new trader for the demo and provide a bit of native token and fake
  // currency to play with.
  //
  // AU is a shortcut for AtomicUnits, the native u64 on-chain quantity. DU is a
  // shortcut for DecimalUnits, the fixed-precision representation that will be
  // converted to AU in API calls.
  const trader = new AptosAccount();
  auxClient.sender = trader
  await auxClient.fundAccount({
    account: trader.address(),
    quantity: AU(10_000_000),
  });

  // We support several fake coins that can be used for test trading. You can
  // mint and burn any quantities.
  await auxClient.registerAndMintFakeCoin(FakeCoin.BTC, DU(1000));
  await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, DU(1_000_000));

  // The full type names for the fake coins. For real trading.
  const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
  const btcDecimals = (await auxClient.getCoinInfo(btcCoin)).decimals;
  const usdcDecimals = (await auxClient.getCoinInfo(btcCoin)).decimals;

  const btcToUsdc = auxClient.getRouter(trader);

  // swap BTC for USDC

  // get and process quote
  const quoteResult = await btcToUsdc.getQuoteCoinForExactCoin({
    coinTypeIn: btcCoin,
    coinTypeOut: usdcCoin,
    exactAmountOut: DU(10),
  });

  if (quoteResult.result === undefined) {
    console.log("get quote failed:");
    throw new Error("get quote failed");
  }
  const quote: RouterQuote = quoteResult.result;
  console.log(`Quote for swapping BTC for ${DU(10)} USDC:`);
  console.log(`required BTC: ${quote.amount}`);
  console.log(`gas amount: ${quote.estGasAmount}`);
  console.log(`gas price: ${quote.estGasPrice}`);
  console.log("Route:");
  quote.routes.forEach(async (route, i) => {
    console.log(
      `${i}: swap ${route.amountIn.toDecimalUnits(
        btcDecimals
      )} BTC for ${route.amountOut.toDecimalUnits(usdcDecimals)} USDC via ${
        route.venue
      }`
    );
    const feeDecimals = (await auxClient.getCoinInfo(route.feeOrRebateCurrency))
      .decimals;
    console.log(
      `   fee: ${route.feeAmount.toDecimalUnits(feeDecimals)} (${
        route.feeOrRebateCurrency
      })`
    );
    console.log(`   price impact: ${route.priceImpactPct}%)`);
  });

  // Swap up to 0.1 BTC for exactly 1000 USDC. Choose the best price between AMM
  // swaps and CLOB orders.
  const txResult = await btcToUsdc.swapCoinForExactCoin({
    coinTypeIn: btcCoin,
    coinTypeOut: usdcCoin,
    maxAmountIn: quote.amount,
    exactAmountOut: DU(10),
  });

  // The swap returns the sequence of AMM swaps and CLOB fills that occurred.
  if (txResult.result === undefined) {
    throw new Error("swap tx failed");
  } else {
    for (const event of txResult.result) {
      console.log("event", event);
    }
  }

  // Swap exactly 0.1 for at least 1000 USDC. Choose the best price between AMM
  // swaps and CLOB orders. Similar to the above function, the payload contains
  // the sequence of AMM swaps and CLOB fills. We omit that for brevity.
  await btcToUsdc.swapExactCoinForCoin({
    coinTypeIn: btcCoin,
    coinTypeOut: usdcCoin,
    exactAmountIn: DU(0.1),
    minAmountOut: DU(10),
  });
}

main();
