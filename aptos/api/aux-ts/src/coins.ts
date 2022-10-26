export const MOJO =
  "0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO";
export const APT = "0x1::aptos_coin::AptosCoin";
export const USDC_eth =
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T";
export const USDC_sol =
  "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T";
export const USDT =
  "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T";
export const USDC_layerzero =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC";
export const USDT_layerzero =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT";
export const SOL =
  "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T";
export const WETH =
  "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T";
export const WBTC =
  "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T";
export const USDA =
  "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA";

export const ALL_USD_STABLES = [
  USDC_eth,
  USDC_sol,
  USDT,
  USDC_layerzero,
  USDT_layerzero,
  USDA,
];

export interface CoinMapping {
  pythSymbol?: string;
}

export const COIN_MAPPING: Map<string, CoinMapping> = new Map();
COIN_MAPPING.set(APT, { pythSymbol: "Crypto.APT/USD" });
COIN_MAPPING.set(SOL, { pythSymbol: "Crypto.SOL/USD" });
COIN_MAPPING.set(WETH, { pythSymbol: "Crypto.ETH/USD" });
COIN_MAPPING.set(WBTC, { pythSymbol: "Crypto.BTC/USD" });
