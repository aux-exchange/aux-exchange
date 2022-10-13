/**
 * Poll FTX every second. If the price deviates from the AMM price, swap in the
 * AMM assuming that FTX price leads AMM price.
 *
 * See aux-exchange/README.md for details on how to run this example.
 */
import { AptosAccount } from "aptos";
import axios from "axios";
import { assert } from "console";
import { AU, DU, Pool } from "../src";
import {
  AuxClient,
  deriveModuleAddress,
  FakeCoin,
  getAptosProfile,
  Network,
} from "../src/client";

const AUX_TRADER_CONFIG = {
  // The frequency at which we fetch price updates from both FTX and AUX,
  // in milliseconds
  refreshTime: 1_000,
  // If the deviation ratio between AMM and oracle reaches this threshold, send
  // a swap.
  deviationThreshold: 0.0005,
  // The size of each order, denoted in decimal units. "DU" or "DecimalUnits"
  // represents a quantity with decimals. DU(0.005) means 0.005 BTC and DU(100)
  // means $100. The on chain representation is in "AU" or "AtomicUnits".
  btcPerSwap: DU(0.005),
  usdcPerSwap: DU(100),
  // The REST API endpoint URL to get oracle price updates
  oracleUrl: "https://ftx.com/api/markets/BTC/USD/orderbook?depth=1",
};

// Get the account that has authority over the module from local profile
// This is also the account that deployed the Aux program
const privateKeyHex = getAptosProfile("localnet")?.private_key!;
const moduleAuthority: AptosAccount = AptosAccount.fromAptosAccountObject({
  privateKeyHex,
});

// This is the address where the AUX module is published to
const moduleAddress = deriveModuleAddress(moduleAuthority);

// Start an AUX client
const auxClient = AuxClient.create({
  network: Network.Localnet,
  moduleAddress,
});

// We create a new Aptos account for the trader
const trader: AptosAccount = new AptosAccount();

// We fund trader and module authority with Aptos, BTC, and USDC coins
async function setupTrader(): Promise<void> {
  await auxClient.airdropNativeCoin({
    account: trader.address(),
    quantity: DU(500_000),
  });

  await auxClient.airdropNativeCoin({
    account: moduleAuthority.address(),
    quantity: DU(500_000),
  });

  // We're rich! Use canonical fake types for trading. Fake coins can be freely
  // minted by anybody. All AUX test markets use these canonical fake coins.
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
}

async function tradeAMM(): Promise<void> {
  let pool = await Pool.read(auxClient, {
    coinTypeX: auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
    coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
  });

  assert(pool !== undefined);
  pool = pool as Pool;

  while (true) {
    try {
      console.log(new Date());

      if (pool.amountX.toNumber() == 0) {
        const amountXToAdd = DU(10);
        const amountYToAdd = DU(200000);
        const tx = await pool.addExactLiquidity({
          sender: trader,
          amountX: amountXToAdd,
          amountY: amountYToAdd,
        });
        // The transaction contains the raw transaction (tx.tx) as well as a parsed
        // payload (tx.payload).
        console.log(">>>> Add Liquidity event:", tx.payload);
      }

      // Note that amountX and amountY are DecimalUnits, so the ratio is the
      // conventional human price.
      await pool.update();

      console.log(
        `Pool BTC=${pool.amountX.toString()}, USDC=${pool.amountY.toString()}`
      );

      const poolMid = pool.amountY.toNumber() / pool.amountX.toNumber();

      // As an example, we will compare against FTX midpoint.
      const ftxRes = await axios.get(AUX_TRADER_CONFIG.oracleUrl);
      const ftxMid =
        (ftxRes.data.result.bids[0][0] + ftxRes.data.result.asks[0][0]) / 2;

      if (ftxMid <= 0 || poolMid <= 0) {
        throw new Error("Invalid price");
      }

      // If FTX and AUX prices deviate over threshold, place an order.
      if (
        Math.abs(poolMid / ftxMid - 1) > AUX_TRADER_CONFIG.deviationThreshold
      ) {
        let tx;
        try {
          if (poolMid < ftxMid) {
            console.log(">>>> Swapping for BTC");
            tx = await pool.swapYForX({
              sender: trader,
              exactAmountIn: AUX_TRADER_CONFIG.usdcPerSwap,
              minAmountOut: AU(0),
            });
          } else {
            console.log(">>>> Swapping for USDC");
            tx = await pool.swapXForY({
              sender: trader,
              exactAmountIn: AUX_TRADER_CONFIG.btcPerSwap,
              minAmountOut: AU(0),
            });
          }

          console.log(">>>> Swap event:", tx.payload);
        } catch (e) {
          console.log("  Placing order failed with error", e);
        }
      }

      // As discussed above, anybody can mint unlimited quantities of fake
      // assets for test trading. To avoid issues dealing with inventory, we
      // simply mint ourselves more fake coins when we run out.
      const traderBtcBalance =
        await auxClient.ensureMinimumFakeCoinBalance({
          sender: trader,
          coin: FakeCoin.BTC,
          minQuantity: DU(100),
          replenishQuantity: DU(1000),
        });

      const traderUsdcBalance =
        await auxClient.ensureMinimumFakeCoinBalance({
          sender: trader,
          coin: FakeCoin.USDC,
          minQuantity: DU(100_000),
          replenishQuantity: DU(1_000_000),
        });

      console.log(
        "  Trader BTC=",
        (
          await auxClient.toDecimalUnits(
            auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
            traderBtcBalance
          )
        ).toString(),
        ", USDC=",
        (
          await auxClient.toDecimalUnits(
            auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
            traderUsdcBalance
          )
        ).toString()
      );
    } catch (e) {
      console.log("  Trader update failed with error", e);
    }

    await new Promise((f) => setTimeout(f, AUX_TRADER_CONFIG.refreshTime));
  }
}

async function main() {
  await setupTrader();
  await tradeAMM();
}

main().then(() => {});
