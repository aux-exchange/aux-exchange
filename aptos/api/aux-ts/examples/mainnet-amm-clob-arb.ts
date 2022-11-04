/**
 * If the prices from AUX AMM and CLOB deviate, buy from the cheaper venue to sell
 * on the other for arbitrage profit.
 *
 * To trade on mainnet, run:
 *
 *  yarn ts-node mainnet-amm-clob-arb.ts
 *
 * We HIGHLY recommend using your own full node to avoid rate limits:
 *
 *  APTOS_NODE=https://your/node/address \
 *  yarn ts-node mainnet-amm-clob-arb.ts
 */
import { AptosAccount, AptosClient } from "aptos";
import * as coins from "../src/coin";
import { DU } from "../src";
import { AuxClient } from "../src/client";
import { AUXArbitrageStrategy } from "../bots/amm-clob";
import { getAptosProfile } from "../src/env";

const DEFAULT_MAINNET = "https://fullnode.mainnet.aptoslabs.com/v1";
const aptosNode = process.env["APTOS_NODE"] ?? DEFAULT_MAINNET;

async function main(): Promise<void> {
  const auxClient = new AuxClient("mainnet", new AptosClient(aptosNode));
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });

  const strategy = new AUXArbitrageStrategy({
    client: auxClient,
    trader,
    baseCoin: coins.APT,

    // Trades occur when the price between the AMM and CLOB deviates above
    // the deviationThreshold.
    // You should calibrate this parameter based on your own research.
    deviationThreshold: 1.0005,

    // Don't do any safety threshold on top of the FTX prices.
    limitThreshold: 1,
    dollarsPerTrade: DU(10),

    // Initialize the trading bot by transferring 1000 APT
    transferBase: DU(1000),

    // ... and 10_000 USDC
    transferQuote: DU(10_000),
  });
  await strategy.run();
}

main();
