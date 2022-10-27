/**
 * If the price deviates from the AMM price, swap in the
 * AMM assuming that FTX price leads AMM price.
 *
 * Run ts-node mainnet-amm-limit-trader.ts to trade on mainnet.
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
  // represents a quantity with decimals. DU(0.07) means 0.07 ETH and DU(100)
  // means $100. The on chain representation is in "AU" or "AtomicUnits".
  ethPerSwap: DU(0.0007),
  usdcPerSwap: DU(1),
  market: "ETH/USD",
};

const aptosNode = process.env["APTOS_NODE"] ?? "https://fullnode.mainnet.aptoslabs.com/v1";

async function printAccountBalance(auxClient: AuxClient, trader: AptosAccount) : Promise<void> {
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

  try {
    const ws = new WebSocket("wss://ftx.com/ws/");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          market: "ETH/USD",
          channel: "ticker",
        })
      );
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data.toString()) as any;
      
      if (data.type === "subscribed") {
        assert(data.type === "subscribed");
        assert(data.channel === "ticker");
        assert(data.market === AUX_TRADER_CONFIG.market);
      } 
      else if (data.type === "update") {
        let bestBid = data.data.bid;
        let bestAsk = data.data.ask;
        let poolX = pool.amountX;
        let poolY = pool.amountY;
        if (prevBid !== bestBid || prevAsk !== bestAsk) {
          try {
            await pool.update();
            if (poolX.toNumber() === 0 || poolY.toNumber() === 0){
              throw new Error("Empty pool");
            }
          } catch (e) {
            console.log("  Pool update failed with error: ", e);
          }

          if (prevPoolX !== poolX.toNumber() || prevPoolY !== poolY.toNumber()) {
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
              tx = await pool.swapYForXExactLimit({
                sender: trader,
                maxAmountIn: AUX_TRADER_CONFIG.usdcPerSwap,
                exactAmountOut: AUX_TRADER_CONFIG.ethPerSwap,
                maxInPerOut: DU(1 / bestBid),
              });
              console.log(">>>> Swap event:", tx.payload);
              await printAccountBalance(auxClient, trader);
            } catch(e) {
              console.log("  Swap from USDC to ETH failed with error: ", e);
            }
          }
          // If FTX prices are relatively lower than a given threshold, swap out of ETH from AUX
          else if (poolPrice / bestAsk - 1 > AUX_TRADER_CONFIG.deviationThreshold) {
            console.log(">>>> Swapping for USDC");
            try {
              tx = await pool.swapXForYExactLimit({
                sender: trader,
                maxAmountIn: AUX_TRADER_CONFIG.ethPerSwap,
                exactAmountOut: AUX_TRADER_CONFIG.usdcPerSwap,
                maxInPerOut: DU(bestAsk),
              });
              console.log(">>>> Swap event:", tx.payload);
              await printAccountBalance(auxClient, trader);
            } catch (e) {
              console.log("  Swap from ETH to USDC failed with error: ", e);
            }
          }
          prevBid = bestBid;
          prevAsk = bestAsk;
        }
      }
    }
  } catch (e) {
    console.log ("  FTX Websocket connection failed with error:", e);
  }
 }
 
 async function main() {
   await tradeAMM();
 }
 
 main().then(() => {});
 