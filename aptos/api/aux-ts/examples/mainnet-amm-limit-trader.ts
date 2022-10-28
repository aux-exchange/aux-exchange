/**
 * If the price deviates from the AMM price, swap in the
 * AMM assuming that FTX price leads AMM price.
 *
 * Run APTOS_NODE=https://your/validator/address yarn ts-node mainnet-amm-limit-trader.ts to trade on mainnet.
 */
import { AptosAccount } from "aptos";
import { assert } from "console";
import * as coins from "../src/coins";
import { DU, Pool } from "../src";
import { AuxClient, getAptosProfile, Network } from "../src/client";
import { WebSocket } from "ws";

const AUX_TRADER_CONFIG = {
  // If the deviation ratio between AMM and oracle reaches this threshold, send
  // a swap.
  deviationThreshold: 0.0003,
  // The size of each order, denoted in decimal units. "DU" or "DecimalUnits"
  // represents a quantity with decimals. DU(0.005) for ethPerSwap means 0.005 ETH and DU(10)
  // for usdcPerSwap means 10 USDC. The on chain representation is in "AU" or "AtomicUnits".
  ethPerSwap: DU(0.005),
  usdcPerSwap: DU(10),
  market: "ETH/USD",
};

const DEFAULT_MAINNET = "https://fullnode.mainnet.aptoslabs.com/v1";
const aptosNode =
  process.env["APTOS_NODE"] ?? DEFAULT_MAINNET;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printAccountBalance(
  auxClient: AuxClient,
  trader: AptosAccount
): Promise<void> {
  console.log(
    "  Trader ETH=",
    (
      await auxClient.getCoinBalanceDecimals({
        account: trader.address(),
        coinType: coins.WETH,
      })
    ).toString(),
    ", USDC=",
    (
      await auxClient.getCoinBalanceDecimals({
        account: trader.address(),
        coinType: coins.USDC_eth,
      })
    ).toString()
  );
}
async function tradeAMM(): Promise<void> {
  const auxClient = AuxClient.create({
    network: Network.Mainnet,
    validatorAddress: aptosNode,
  });
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });
  let maybePool = await Pool.read(auxClient, {
    coinTypeX: coins.WETH,
    coinTypeY: coins.USDC_eth,
  });

  assert(maybePool !== undefined);
  const pool = maybePool as Pool;

  let prevBid = 0;
  let prevAsk = 0;
  let prevPoolX = 0;
  let prevPoolY = 0;

  let queue: any[] = [];

  let swap = async function () {
    while (true) {
      if (queue.length == 0) {
        await sleep(500);
        continue;
      }
      if (queue.length > 100) {
        // Clear queue if it becomes too clogged, as we don't want to use outdated prices from FTX
        queue = [];
        continue;
      }
      let data = queue.pop();
      if (data.type === "subscribed") {
        assert(data.type === "subscribed");
        assert(data.channel === "ticker");
        assert(data.market === AUX_TRADER_CONFIG.market);
      } else if (data.type === "update") {
        let bestBid = data.data.bid;
        let bestAsk = data.data.ask;
        let poolX = pool.amountX;
        let poolY = pool.amountY;
        if (prevBid !== bestBid || prevAsk !== bestAsk) {
          try {
            await pool.update();
            if (poolX.toNumber() === 0 || poolY.toNumber() === 0) {
              throw new Error("Empty pool");
            }
          } catch (e) {
            console.log("  Pool update failed with error: ", e);
          }

          if (
            prevPoolX !== poolX.toNumber() ||
            prevPoolY !== poolY.toNumber()
          ) {
            console.log(
              `Pool ETH=${poolX.toString()}, USDC=${poolY.toString()}`
            );
            prevPoolX = poolX.toNumber();
            prevPoolY = poolY.toNumber();
          }

          let tx;
          const poolPrice = poolY.toNumber() / poolX.toNumber();
          // If FTX prices are relatively higher than a given threshold, swap in for ETH from AUX
          if (bestBid / poolPrice - 1 > AUX_TRADER_CONFIG.deviationThreshold) {
            console.log(">>>> Swapping for ETH");
            try {
              tx = await pool.swapYForXLimit({
                sender: trader,
                exactAmountIn: AUX_TRADER_CONFIG.usdcPerSwap,
                minOutPerIn: DU(1 / bestBid),
              });
              console.log(">>>> Swap event:", tx);
              await printAccountBalance(auxClient, trader);
            } catch (e) {
              console.log("  Swap from USDC to ETH failed with error: ", e);
            }
          }
          // If FTX prices are relatively lower than a given threshold, swap out of ETH from AUX
          else if (
            poolPrice / bestAsk - 1 >
            AUX_TRADER_CONFIG.deviationThreshold
          ) {
            console.log(">>>> Swapping for USDC");
            try {
              tx = await pool.swapXForYLimit({
                sender: trader,
                exactAmountIn: AUX_TRADER_CONFIG.ethPerSwap,
                minOutPerIn: DU(bestAsk),
              });
              console.log(">>>> Swap event:", tx.payload);
              await printAccountBalance(auxClient, trader);
            } catch (e) {
              console.log("  Swap from ETH to USDC failed with error: ", e);
            }
          }
          prevBid = bestBid;
          prevAsk = bestAsk;
          if (aptosNode === DEFAULT_MAINNET) {
            // Avoid rate limiting
            await sleep(1000);
          }
        }
      }
    }
  };
  try {
    const ws = new WebSocket("wss://ftx.com/ws/");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          market: AUX_TRADER_CONFIG.market,
          channel: "ticker",
        })
      );
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data.toString()) as any;
      queue.push(data);
    };
  } catch (e) {
    console.log("  FTX Websocket connection failed with error:", e);
  }

  swap();
}

async function main() {
  await tradeAMM();
}

main().then(() => {});
