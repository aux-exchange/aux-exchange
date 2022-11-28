import type { Types } from "aptos";
import type { AuxClient } from "../client";
import {
  ALL_USD_STABLES,
  COIN_MAPPING,
  fakeMapping,
  fakeStableTypes,
} from "../coin";
import { ConstantProductClient } from "../pool/constant-product/client";
import { PythRating, RatingColor } from "./generated/types";

export const LATEST_PYTH_PRICE = new Map<string, number>();

// pythConnection.onPriceChange((productAccount, priceAccount) => {
//   const symbol = productAccount.symbol;
//   const price = priceAccount.price;
//   if (price !== undefined) {
//     LATEST_PYTH_PRICE.set(symbol, price);
//   }
// });
// pythConnection.start();

export function getRecognizedTVL(coinType: string, amount: number): number {
  if (ALL_USD_STABLES.includes(coinType)) {
    return amount;
  } else {
    const pythSymbol = COIN_MAPPING.get(coinType)?.pythSymbol;
    if (pythSymbol !== undefined) {
      const pythPrice = LATEST_PYTH_PRICE.get(pythSymbol);
      if (pythPrice !== undefined) {
        return pythPrice * amount;
      }
    }
  }
  return 0;
}

export async function getUsdPrice(
  auxClient: AuxClient,
  coinType: Types.MoveStructTag
): Promise<number | undefined> {
  const FAKE_STABLES = fakeStableTypes(auxClient);
  if (ALL_USD_STABLES.includes(coinType) || FAKE_STABLES.includes(coinType)) {
    // if stable, return 1 (approx.)
    return 1.0;
  } else {
    // map fake coins
    const FAKE_MAPPING = await fakeMapping(auxClient);
    const newCoinType = FAKE_MAPPING.get(coinType);
    if (!!newCoinType) {
      coinType = newCoinType;
    }
    const symbol = COIN_MAPPING.get(coinType)?.pythSymbol;
    // Use Pyth price if available
    if (!!symbol) {
      return LATEST_PYTH_PRICE.get(symbol);
    } else {
      // Otherwise, use instantaneous pool price
      const pools = await auxClient.pools();
      for (let pool of pools) {
        let isX;
        if (
          (pool.coinTypeX === coinType && pool.coinTypeY in ALL_USD_STABLES) ||
          pool.coinTypeY in COIN_MAPPING.keys()
        ) {
          isX = true;
        } else if (
          (pool.coinTypeY === coinType && pool.coinTypeX in ALL_USD_STABLES) ||
          pool.coinTypeX in COIN_MAPPING.keys()
        ) {
          isX = false;
        }
        if (isX !== undefined) {
          // get other coin USD price
          let usdPriceOther;
          let otherCoinType;
          if (isX) {
            otherCoinType = pool.coinTypeY;
          } else {
            otherCoinType = pool.coinTypeX;
          }
          if (otherCoinType in ALL_USD_STABLES) {
            usdPriceOther = 1.0;
          } else {
            const pythSymbolOther = COIN_MAPPING.get(otherCoinType)?.pythSymbol;
            if (!!pythSymbolOther) {
              usdPriceOther = LATEST_PYTH_PRICE.get(pythSymbolOther);
            }
          }
          if (!!usdPriceOther) {
            const client = new ConstantProductClient(auxClient, pool);
            const info = await client.query();
            let usdPrice;
            if (isX) {
              usdPrice =
                (info.amountY.toNumber() * usdPriceOther) /
                info.amountX.toNumber();
            } else {
              usdPrice =
                (info.amountX.toNumber() * usdPriceOther) /
                info.amountY.toNumber();
            }
            return usdPrice;
          }
        }
      }
    }
  }
  return undefined;
}
export function generatePythRating({
  ratio,
  price,
  redPct,
  yellowPct,
}: {
  ratio: number;
  price: number;
  redPct: number;
  yellowPct: number;
}): PythRating {
  return ratio > redPct * 0.01
    ? {
        price,
        color: RatingColor.Red,
        message: `${ratio * 100}% more expensive than Pyth`,
      }
    : ratio > yellowPct * 0.01
    ? {
        price,
        color: RatingColor.Yellow,
        message: `within ${redPct}% of Pyth`,
      }
    : ratio >= 0
    ? {
        price,
        color: RatingColor.Green,
        message: `within ${yellowPct}% of Pyth`,
      }
    : {
        price,
        color: RatingColor.Green,
        message: `${ratio * -100}% cheaper than Pyth`,
      };
}
