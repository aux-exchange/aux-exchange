/**
 * Demo of the supported AMM instructions.
 */
import { AptosAccount, AptosClient } from "aptos";
import { assert } from "console";
import { AU, DU, Pool } from "../src";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";

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
  await auxClient.fundAccount({
    account: trader.address(),
    quantity: AU(500_000_000),
  });

  // We support several fake coins that can be used for test trading. You can
  // mint and burn any quantities.
  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.BTC,
    amount: DU(1000), // i.e. 1000 BTC
  });
  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.USDC,
    amount: DU(1_000_000), // i.e. $1m
  });

  // The full type names for the fake coins. For real trading.
  const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);

  let maybePool = await Pool.read(auxClient, {
    coinTypeX: btcCoin,
    coinTypeY: usdcCoin,
  });

  assert(
    maybePool !== undefined,
    "Pool should have been created during contract deployment."
  );
  const pool = maybePool as Pool;

  // Fetch current user positions in the pool.
  console.log(
    "pool.position:",
    await pool.position(trader.address().toShortString())
  );

  // Call update to refresh the internal variables.
  await pool.update();

  // Add some liquidity. This instruction may round the result in a way that is
  // unfavorable to me. Here we do not specify any limits on the rounding.
  const add = await pool.addApproximateLiquidity({
    sender: trader,
    maxX: DU(0.1),
    maxY: DU(2000),
  });

  // The returned event includes information about the quantities actually added
  // and LP received.
  console.log("add.payload:", add.payload);

  // Add liquidity in a more controlled way. Abort the add if the pool
  // parameters have moved against us, or if the rounding leads to a poor
  // outcome. In this example, ensure that we receive at least 90% of expected
  // LP based on our off-chain understanding of the pool state, and that the LP
  // represents a position in at least 90% of our off-chain undestanding of the
  // X and Y quantities.
  await pool.addApproximateLiquidity({
    sender: trader,
    maxX: DU(0.1),
    maxY: DU(2000),
    minLP: DU(
      ((0.9 * 0.1) / pool.amountX.toNumber()) * pool.amountLP.toNumber()
    ),
    minPoolX: DU(0.9 * pool.amountX.toNumber()),
    minPoolY: DU(0.9 * pool.amountY.toNumber()),
  });

  // Put in 0.1 BTC and get at least 1000 USDC out, or fail.
  const swap = await pool.swapXForY({
    sender: trader,
    exactAmountIn: DU(0.1),
    minAmountOut: DU(1000),
  });

  // The returned swap event includes information about the swapped quantities.
  // The swap instructions below also return this event, but we omit the output
  // for brevity.
  console.log("swap.payload:", swap.payload);

  // We would like to receive 1000 USDC using a maximum of 0.1 BTC. Fail if this
  // cannot be done.
  await pool.swapXForYExact({
    sender: trader,
    maxAmountIn: DU(0.1),
    exactAmountOut: DU(1000),
  });

  // We would like to swap exactly 0.1 BTC for USDC, where the swap price of
  // each marginal unit swapped is at least $10,000.
  await pool.swapXForYLimit({
    sender: trader,
    exactAmountIn: DU(0.1),
    minOutPerIn: DU(10000),
  });

  // We would like to swap up to 0.1 BTC for exactly 1000 USDC, where the swap
  // price of each marginal unit swapped is at least $10,000.
  await pool.swapXForYExactLimit({
    sender: trader,
    maxAmountIn: DU(0.1),
    exactAmountOut: DU(1000),
    maxInPerOut: DU(1 / 10000),
  });
}

main();
