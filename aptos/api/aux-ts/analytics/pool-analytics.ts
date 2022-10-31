import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from "@pythnetwork/client";
import type { PythHttpClientResult } from "@pythnetwork/client/lib/PythHttpClient";
import { Connection } from "@solana/web3.js";
import { AptosClient } from "aptos";
import { BN } from "bn.js";
import { poolEvents, pools } from "../src/amm/core/query";
import { AuxClient } from "../src/client";
import Market from "../src/clob/dsl/market";
import { ALL_USD_STABLES, COIN_MAPPING } from "../src/coin";
import { AU } from "../src/units";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

export class PoolAnalytics {
  auxClient: AuxClient;
  pythClient: PythHttpClient;
  pythData: undefined | PythHttpClientResult;

  constructor() {
    const connection = new Connection("https://solana-api.projectserum.com");
    const pythPublicKey = getPythProgramKeyForCluster("mainnet-beta");
    this.pythClient = new PythHttpClient(connection, pythPublicKey);
    this.auxClient = new AuxClient(
      "mainnet",
      new AptosClient("http://127.0.0.1:8080")
    );
  }

  async refresh() {
    this.pythData = await this.pythClient.getData();
  }

  async compute() {
    const allPools = await pools(this.auxClient);
    await this.refresh();
    const now = Date.now();

    let totalUSDAdded = 0;
    let totalUSDTraded = 0;
    const volumeByHoursAgo = new Array<number>(24);
    volumeByHoursAgo.fill(0);

    const actionsByHoursAgo = new Array<number>(24);
    actionsByHoursAgo.fill(0);
    let actions = 0;

    const usersByHoursAgo = new Array<Set<string>>(24);
    for (let i = 0; i < usersByHoursAgo.length; i++) {
      usersByHoursAgo[i] = new Set();
    }
    const users = new Set<string>();

    for (const pool of allPools) {
      const allEvents = await poolEvents(this.auxClient, pool, {
        start: new BN(0),
      });
      for (const event of allEvents) {
        const kind = event.kind;
        switch (kind) {
          case "SwapEvent":
            const inUSD = this.toUSD(
              event.coinTypeIn,
              (
                await this.auxClient.toDecimalUnits(
                  event.coinTypeIn,
                  event.amountIn
                )
              ).toNumber()
            );
            const outUSD = this.toUSD(
              event.coinTypeOut,
              (
                await this.auxClient.toDecimalUnits(
                  event.coinTypeOut,
                  event.amountOut
                )
              ).toNumber()
            );
            const tradeUSD = Math.max(inUSD, outUSD);

            const hoursAgo = Math.max(
              0,
              Math.floor(
                (now - event.timestamp.toNumber() / 1000) /
                  MILLISECONDS_PER_HOUR
              )
            );

            if (hoursAgo < volumeByHoursAgo.length) {
              volumeByHoursAgo[hoursAgo]! += tradeUSD;
              usersByHoursAgo[hoursAgo]!.add(event.senderAddr.hex());
              actionsByHoursAgo[hoursAgo]!++;
            }

            totalUSDTraded += tradeUSD;
            users.add(event.senderAddr.hex());
            actions++;
            break;
          case "AddLiquidityEvent":
            totalUSDAdded += this.toUSD(
              event.xCoinType,
              (
                await this.auxClient.toDecimalUnits(
                  event.xCoinType,
                  event.xAdded
                )
              ).toNumber()
            );
            totalUSDAdded += this.toUSD(
              event.yCoinType,
              (
                await this.auxClient.toDecimalUnits(
                  event.yCoinType,
                  event.yAdded
                )
              ).toNumber()
            );
            break;

          case "RemoveLiquidityEvent":
            break;
          default:
            const _exhaustiveCheck: never = kind;
            return _exhaustiveCheck;
        }
      }
    }

    let clobVolume24H = 0;
    const allMarkets = await Market.index(this.auxClient);
    for (const marketInfo of allMarkets) {
      const market = await Market.read(this.auxClient, marketInfo);
      const fills = await market.fills({ start: new BN(0) });
      for (const fill of fills) {
        console.log(fill);
        // Fills are duplicated once for maker once for taker.
        if (fill.sequenceNumber.mod(new BN(2)).eqn(0)) {
          continue;
        }
        /*
        const baseQuantity = fill.baseQuantity.toDecimalUnits(
          market.baseDecimals
        );
        */
        const quoteQuantity = AU(
          fill.baseQuantity.toBN().mul(fill.price.toBN())
        ).toDecimalUnits(market.baseDecimals + market.quoteDecimals);
        const tradeValue = Math.max(
          0,
          // this.toUSD(market.baseCoinInfo.coinType, baseQuantity.toNumber()),
          this.toUSD(market.quoteCoinInfo.coinType, quoteQuantity.toNumber())
        );
        if (
          fill.timestamp.toNumber() / 1000 >
          now - MILLISECONDS_PER_HOUR * 24
        ) {
          clobVolume24H += tradeValue;
        }
      }
    }

    console.log("$TVL:", totalUSDAdded);

    console.log("Total/24h/h volume:", totalUSDTraded);
    console.log(volumeByHoursAgo.reduce((a, b) => a + b, 0));
    console.log(volumeByHoursAgo);

    console.log("Total/24h/h swaps:", actions);
    console.log(actionsByHoursAgo.reduce((a, b) => a + b, 0));
    console.log(actionsByHoursAgo);

    console.log("Total/24h/h users:", users.size);
    const cumulativeUsers = new Set();
    console.log(
      usersByHoursAgo.reduce((_a, b) => {
        for (const val of b.values()) {
          cumulativeUsers.add(val);
        }
        return cumulativeUsers;
      }, cumulativeUsers).size
    );
    console.log(usersByHoursAgo.map((s) => s.size));
    console.log("Clob 24H volume:", clobVolume24H);
  }

  toUSD(coinType: string, value: number): number {
    if (ALL_USD_STABLES.includes(coinType)) {
      return value;
    }
    const pythSymbol = COIN_MAPPING.get(coinType)?.pythSymbol;
    if (pythSymbol === undefined) {
      return 0;
    }

    const pythPriceObj = this.pythData!.productPrice.get(pythSymbol);
    const pythPrice = pythPriceObj!.price ?? pythPriceObj!.previousPrice;
    return pythPrice * value;
  }
}

async function main() {
  const analytics = new PoolAnalytics();
  await analytics.compute();
}

main();
