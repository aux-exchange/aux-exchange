import { ALL_USD_STABLES, COIN_MAPPING } from "../coin";
import { pythConnection } from "./connection";
import { PythRating, RatingColor } from "./generated/types";

export const LATEST_PYTH_PRICE = new Map<string, number>();

pythConnection.onPriceChange((productAccount, priceAccount) => {
  const symbol = productAccount.symbol;
  const price = priceAccount.price;
  if (price !== undefined) {
    LATEST_PYTH_PRICE.set(symbol, price);
  }
});
pythConnection.start();

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
