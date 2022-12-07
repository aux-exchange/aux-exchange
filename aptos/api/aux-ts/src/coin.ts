/*
 * Mainnet
 */

import type { Types } from "aptos";
import type { AuxClient } from "./client";

export const MOJO =
  "0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO";
export const APT = "0x1::aptos_coin::AptosCoin";
export const USDC_ETH_WH =
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T";
export const USDC_SOL_WH =
  "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T";
export const USDT_WH =
  "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T";
export const USDC_L0 =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC";
export const USDT_L0 =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT";
export const SOL_WH =
  "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T";
export const WETH_WH =
  "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T";
export const WBTC_WH =
  "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T";
export const USDA =
  "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA";

export const ALL_USD_STABLES = [
  USDC_ETH_WH,
  USDC_SOL_WH,
  USDT_WH,
  USDC_L0,
  USDT_L0,
  USDA,
];

export interface CoinMapping {
  pythSymbol?: string;
  ftxInternationalMarket?: string;
}

export const COIN_MAPPING: Map<string, CoinMapping> = new Map();
COIN_MAPPING.set(APT, {
  pythSymbol: "Crypto.APT/USD",
  ftxInternationalMarket: "APT/USD",
});
COIN_MAPPING.set(SOL_WH, {
  pythSymbol: "Crypto.SOL/USD",
  ftxInternationalMarket: "SOL/USD",
});
COIN_MAPPING.set(WETH_WH, {
  pythSymbol: "Crypto.ETH/USD",
  ftxInternationalMarket: "ETH/USD",
});
COIN_MAPPING.set(WBTC_WH, {
  pythSymbol: "Crypto.BTC/USD",
  ftxInternationalMarket: "BTC/USD",
});

/*
 * Devnet
 */

/**
 * Supported fake coin types. These coins have no monetary value but can be used
 * for local and devnet testing of markets with multiple decimals, tick sizes,
 * and so on.
 */
export enum FakeCoin {
  USDC = "USDC",
  USDT = "USDT",
  BTC = "BTC",
  ETH = "ETH",
  SOL = "SOL",
  AUX = "AUX",
}

/**
 * a list of all fake coins
 */
export const ALL_FAKE_STABLES: FakeCoin[] = [FakeCoin.USDC, FakeCoin.USDT];

export function fakeStableTypes(auxClient: AuxClient): string[] {
  const types = [];
  for (let coin of ALL_FAKE_STABLES) {
    types.push(auxClient.getWrappedFakeCoinType(coin));
  }
  return types;
}

export const ALL_FAKE_VOLATILES: FakeCoin[] = [
  FakeCoin.BTC,
  FakeCoin.ETH,
  FakeCoin.SOL,
  FakeCoin.AUX,
];

export const ALL_FAKE_COINS: FakeCoin[] =
  ALL_FAKE_STABLES.concat(ALL_FAKE_VOLATILES);

export const APTOS_COIN_TYPE: Types.MoveStructTag =
  "0x1::aptos_coin::AptosCoin";

export function fakeMapping(auxClient: AuxClient) {
  const [fakeBtc, fakeEth, fakeSol, fakeUsdc] = [
    auxClient.getWrappedFakeCoinType(FakeCoin.BTC),
    auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
    auxClient.getWrappedFakeCoinType(FakeCoin.SOL),
    auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
  ];

  const FAKE_MAPPING = new Map<string, string>();
  FAKE_MAPPING.set(fakeBtc, WBTC_WH);
  FAKE_MAPPING.set(fakeEth, WETH_WH);
  FAKE_MAPPING.set(fakeSol, SOL_WH);
  FAKE_MAPPING.set(fakeUsdc, USDC_ETH_WH);
  return FAKE_MAPPING;
}
