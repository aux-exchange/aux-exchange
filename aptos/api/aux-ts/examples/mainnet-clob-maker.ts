/**
 * Place orders around FTX best bid and best ask.
 *
 * To trade on mainnet, run:
 *
 *  yarn ts-node mainnet-clob-maker.ts
 *
 * We HIGHLY recommend using your own full node to avoid rate limits:
 *
 *  APTOS_NODE_URL=https://your/node/address \
 *  yarn ts-node mainnet-clob-maker.ts
 */
import { AptosAccount, AptosClient } from "aptos";
import * as coins from "../src/coin";
import { DU } from "../src";
import { AuxClient} from "../src/client";
import { FTXMarketMakingStrategy } from "../bots/clob";
import { BN } from "bn.js";
import { getAptosProfile } from "../src/env";

const DEFAULT_MAINNET = "https://fullnode.mainnet.aptoslabs.com/v1";
const nodeUrl = process.env["APTOS_NODE_URL"] ?? DEFAULT_MAINNET;

async function main(): Promise<void> {
  const auxClient = new AuxClient("mainnet", new AptosClient(nodeUrl));
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });
  const strategy = new FTXMarketMakingStrategy({
    client: auxClient,
    trader,

    // Trade the APT-USDC market.
    baseCoin: coins.APT,

    // Place a new order 0.50 spreads further from midpoint than the FTX best
    // bid or best offer. Set to zero to match the FTX inside book exactly.
    // Setting this parameter higher results in higher profits when you get
    // fills on both sides, but reduces the likelihood you get filled. Setting
    // this parameter lower results in lower profits when you get fills on both
    // sides, but increases the likelihood you get fills.
    idealSpreadFraction: 0.5,

    // When the strategy's order price is more than 2 FTX spreads further from
    // midpoint than the ideal price, cancel the order. This should be set
    // higher than idealSpreadFraction, or you will immediately cancel after
    // placing a new order. Setting this to a higher number reduces the
    // likelihood you get filled, but reduces the number of actions and results
    // in better gas efficiency. Setting this to a lower number increases the
    // likelihood you get filled, but increses the number of actions and gas
    // usage.
    moveInSpreadFraction: 2.0,

    // When the strategy's order price is more than 1 FTX spread worse than the
    // ideal price, cancel the order. Setting this to a higher number increases
    // the likelihood you get an adverserial fill but reduces the action count
    // and gas, and increases fill rate. Setting this to a lower number
    // decreases the likelihood you get an adverserial fill but increases the
    // action count and gas usage, and decreases fill rate.
    backOffSpreadFraction: 1.0,

    // Throttle to one second between order placements. Setting to a higher
    // number reduces the liklihood of getting rekt by an infinite order
    // placement bug before you can catch the issue, and also reduces the gas of
    // the strategy. Setting to a lower number increases responsiveness,
    // operational risk, and gas usage.
    millisecondsBetweenNewOrders: 1000,

    // Place a buy or sell for 0.1 APT.
    quantityPerTrade: DU(0.1),

    // Allow up to +/- 100 APT filled in the current trading session.
    maxNetQuantity: 100,

    // Initialize the trading bot by transferring 1000 APT
    transferBase: DU(1000),

    // ... and 10_000 USDC
    transferQuote: DU(10000),

    // Choose a unique strategy for market making. Cancel all orders with this
    // ID to make accounting simpler.
    strategyId: new BN(42069),
  });
  await strategy.run();
}

main();
