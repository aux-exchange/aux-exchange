import { ALL_USD_STABLES, COIN_MAPPING } from "../coins";
import { pythConnection } from "./connection";

export const LATEST_PYTH_PRICE = new Map<string, number>();

pythConnection.onPriceChange((productAccount, priceAccount) => {
  const symbol = productAccount.symbol;
  const price = priceAccount.price;
  if (price !== undefined) {
    LATEST_PYTH_PRICE.set(symbol, price);
  }
});

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
