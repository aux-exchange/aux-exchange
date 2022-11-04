/**
 * If the price deviates from the CLOB price, swap in the CLOB assuming that FTX
 * price leads CLOB price. It is possible to run this script without any wallet
 * balances. In this case, you will see log messages printing out what action
 * would have been taken if there were sufficient wallet balances to make a trade.
 *
 * To trade on mainnet, run:
 *
 *  yarn ts-node mainnet-clob-taker.ts
 *
 * We HIGHLY recommend using your own full node to avoid rate limits:
 *
 *  APTOS_NODE=https://your/node/address \
 *  yarn ts-node mainnet-clob-taker.ts
 */

import { AptosAccount, AptosClient } from "aptos";
import { FTXArbitrageStrategy } from "../bots/clob";
import { DU } from "../src";
import { AuxClient } from "../src/client";
import * as coins from "../src/coin";
import { getAptosProfile } from "../src/env";

const DEFAULT_MAINNET = "https://fullnode.mainnet.aptoslabs.com/v1";
const aptosNode = process.env["APTOS_NODE"] ?? DEFAULT_MAINNET;

async function main(): Promise<void> {
  const auxClient = new AuxClient("mainnet", new AptosClient(aptosNode));
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });

  const strategy = new FTXArbitrageStrategy({
    client: auxClient,
    trader,
    baseCoin: coins.APT,

    // If you are doing a funds transfer with FTX and expecting to make
    // arbitrage profit, make sure this is at least one plus the pool fee plus
    // FTX trading fees plus spread.
    //
    // You should calibrate this parameter based on your own research. For
    // example, the 5 bps below would not be sufficient to make an arb profit,
    // but a 5 bps deviation may be enough to expect a profit when the price
    // eventually flips.
    deviationThreshold: 1.0005,

    // Don't do any safety threshold on top of the FTX prices.
    limitThreshold: 1,
    dollarsPerTrade: DU(10),

    // Initialize the trading bot by transferring 1000 APT
    transferBase: DU(1000),

    // ... and 10_000 USDC
    transferQuote: DU(10_000),

    // Allow a single buy or sell before the position must move the opposite
    // direction.
    maxPositionNumTrades: 1,
  });
  await strategy.run();
}

main();
