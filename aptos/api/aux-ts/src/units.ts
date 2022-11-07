/**
 * API quantities are represented in either AtomicUnits or DecimalUnits.
 * AtomicUnits are the smallest increment of on-chain quantity of a coin.
 * DecimalUnits are the canonical decimal quantities.
 *
 * AtomicUnits and DecimalUnits are incompatible types. APIs that accept both
 * types will be annotated as AnyUnits. APIs will return an explicit type.
 *
 * Conversion between atomic and decimal units requires the number of decimals
 * of precision. This can be fetched using util.coinInfo.
 */

import type { Types } from "aptos";
import BN from "bn.js";

export const MAX_U64 = "18446744073709551615";

export class Pct {
  pct: number;

  constructor(percent: number) {
    if (percent < 0 || percent > 100) {
      throw new Error("Percent out of range.");
    }
    this.pct = percent;
  }

  toNumber() {
    return this.pct / 100;
  }

  toPercent() {
    return this.pct;
  }

  toBps() {
    return this.pct * 100;
  }
}

export class Bps {
  bps: number;

  constructor(bps: number) {
    if (bps != Math.round(bps)) {
      throw new Error("Bps must be an integer.");
    }
    if (bps < 0 || bps > 10000) {
      throw new Error("Bps out of range.");
    }

    this.bps = bps;
  }

  toNumber() {
    return this.bps / 10000;
  }

  toPercent() {
    return this.bps / 100;
  }

  toBps() {
    return this.bps;
  }
}

// TODO should this live in units or "query"?
export interface Quote {
  amount: AtomicUnits;
  gasUsed: AtomicUnits;
  gasUnitPrice: AtomicUnits;
}

/**
 * @param amount value in atomic units
 * @returns wrapped atomic units
 */
export function AU(amount: string | number | BN) {
  return new AtomicUnits(amount);
}

/**
 * @param amount value in decimal units
 * @returns wrapped decimal units
 */
export function DU(amount: string | number | BN) {
  return new DecimalUnits(amount);
}

/**
 * All supported units.
 */
export type AnyUnits = AtomicUnits | DecimalUnits;

/**
 * Converts the input into atomic units.
 * @param amount atomic or decimal units
 * @param decimals precision
 * @returns atomic units
 */
export function toAtomicUnits(
  amount: AnyUnits | undefined,
  decimals: number
): AtomicUnits {
  if (amount instanceof AtomicUnits) {
    return amount;
  } else if (amount === undefined) {
    return new AtomicUnits(new BN(0));
  }
  return amount.toAtomicUnits(decimals);
}

/**
 * Converts the input ratio r into a / b where a and b are both atomic units.
 * @param amount atomic or decimal units
 * @param numeratorDecimals precision of numerator
 * @param denominatorDecimals precision of denominator
 * @returns atomic units numerator and denominator
 */
export function toAtomicUnitsRatio(
  amount: AnyUnits | undefined,
  numeratorDecimals: number,
  denominatorDecimals: number
): [AtomicUnits, AtomicUnits] {
  if (amount === undefined) {
    return [new AtomicUnits(0), new AtomicUnits(0)];
  }

  if (amount instanceof AtomicUnits) {
    return [amount, new AtomicUnits(1)];
  }

  const precision = amount.getPrecision();
  const divisor = new BN(10).pow(new BN(precision));
  const atomicUnits = amount.toAtomicUnits(precision).toBN();

  if (numeratorDecimals == denominatorDecimals) {
    const gcd = atomicUnits.gcd(divisor);
    return [
      new AtomicUnits(atomicUnits.div(gcd)),
      new AtomicUnits(divisor.div(gcd)),
    ];
  }

  if (numeratorDecimals > denominatorDecimals) {
    const powerTen = new BN(10).pow(
      new BN(numeratorDecimals - denominatorDecimals)
    );
    const numerator = atomicUnits.mul(powerTen);
    const gcd = numerator.gcd(divisor);
    return [
      new AtomicUnits(numerator.div(gcd)),
      new AtomicUnits(divisor.div(gcd)),
    ];
  }

  const powerTen = new BN(10).pow(
    new BN(denominatorDecimals - numeratorDecimals)
  );
  const denominator = powerTen.mul(divisor);
  const gcd = atomicUnits.gcd(denominator);
  return [
    new AtomicUnits(atomicUnits.div(gcd)),
    new AtomicUnits(denominator.div(gcd)),
  ];
}

/**
 * Illegal unit conversion.
 */
export class UnitConversionError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UnitConversionError.prototype);
  }
}

/**
 * Representation of the smallest increment of on-chain quantity.
 */
export class AtomicUnits {
  amount: BN;

  /**
   * @param amount smallest increment of on-chain quantity
   */
  constructor(amount: string | number | BN) {
    this.amount = new BN(amount);
  }

  /**
   * Constructs atomic quantity from decimal quantity.
   *
   * @param amount decimal quantity
   * @param decimals number of units of precision
   * @returns atomic quantity
   */
  static fromDecimalUnits(
    amount: string | number | BN | DecimalUnits,
    decimals: number
  ): AtomicUnits {
    if (typeof amount === "number") {
      amount = amount.toFixed(17);
    } else if (amount instanceof BN) {
      amount = amount.toString();
    } else if (amount instanceof DecimalUnits) {
      amount = amount.toString();
    }
    const findDecimal = amount.indexOf(".");
    const beforeDecimal =
      findDecimal < 0 ? amount : amount.substring(0, findDecimal);
    const afterDecimal =
      findDecimal < 0 ? "" : amount.substring(findDecimal + 1);
    const paddedAfterDecimal =
      afterDecimal.length < decimals
        ? afterDecimal + "0".repeat(decimals - afterDecimal.length)
        : afterDecimal;
    const truncatedAfterDecimal = paddedAfterDecimal.substring(0, decimals);
    return new AtomicUnits(beforeDecimal + truncatedAfterDecimal);
  }

  /**
   * Converts atomic quantity to decimal quantity.
   *
   * @param decimals number of units of precision
   * @returns decimal quantity
   */
  toDecimalUnits(decimals: number): DecimalUnits {
    const atomicString = this.toString();
    const paddedString =
      atomicString.length < decimals
        ? "0".repeat(decimals - atomicString.length) + atomicString
        : atomicString;
    // Example: in 1234 with 2 decimals, the location is 2.
    const decimalLocation = paddedString.length - decimals;
    const paddedDecimalString =
      (decimalLocation == 0 ? "0" : "") +
      paddedString.substring(0, decimalLocation) +
      "." +
      paddedString.substring(decimalLocation);

    let lastZeroIndex = paddedDecimalString.length;
    // This is guaranteed to stay in bounds because of the decimal point.
    while (paddedDecimalString[lastZeroIndex - 1] === "0") {
      lastZeroIndex--;
    }
    const lastCharacterIsDecimal =
      paddedDecimalString[lastZeroIndex - 1] === ".";
    return new DecimalUnits(
      paddedDecimalString.substring(0, lastZeroIndex) +
        (lastCharacterIsDecimal ? "0" : "")
    );
  }

  /**
   * @returns possibly inexact representation of atomic quantity
   */
  toNumber(): number {
    return this.amount.toNumber();
  }

  /**
   * @returns exact numerical representation of atomic quantity
   */
  toBN(): BN {
    return this.amount;
  }

  /**
   * @returns exact numerical representation of atomic quantity as a string
   */
  toString(): string {
    return this.amount.toString();
  }

  /**
   * @returns exact U64 representation of atomic quantity
   */
  toU64(): Types.U64 {
    const amount = this.amount.toString();
    if (this.amount.isNeg()) {
      throw new UnitConversionError(
        amount + " is negative so it cannot be converted to U64"
      );
    }
    return amount;
  }
}

/**
 * Representation of an exact quantity in decimal units.
 */
export class DecimalUnits {
  amount: string;

  /**
   * @param amount decimal amount
   */
  constructor(amount: string | number | BN) {
    if (amount instanceof BN) {
      amount = amount.toString();
    } else if (typeof amount === "number") {
      amount = amount.toFixed(17);
    }
    this.amount = amount;
  }

  /**
   * Constructs a decimal quantity from atomic quantity and decimals.
   *
   * @param atomic exact atomic quantity to represent
   * @param decimals units of precision
   * @returns exact quantity in decimal units
   */
  static fromAtomicUnits(
    amount: string | number | BN | AtomicUnits,
    decimals: number
  ): DecimalUnits {
    if (!(amount instanceof AtomicUnits)) {
      amount = new AtomicUnits(amount);
    }
    return amount.toDecimalUnits(decimals);
  }

  /**
   * If this decimal is exactly representable, then this returns an exact atomic
   * representation. Otherwise, this returns a truncated representation.
   * @returns atomic units
   */
  toAtomicUnits(decimals: number): AtomicUnits {
    return AtomicUnits.fromDecimalUnits(this, decimals);
  }

  /**
   * @returns possibly inexact decimal representation
   */
  toNumber(): number {
    return parseFloat(this.amount);
  }

  /**
   * @returns decimal representation
   */
  toString(): string {
    return this.amount;
  }

  /**
   * @returns number of digits after the decimal
   */
  getPrecision(): number {
    const findDecimal = this.amount.indexOf(".");
    if (findDecimal < 0) {
      return 0;
    }
    return this.amount.length - findDecimal - 1;
  }
}
