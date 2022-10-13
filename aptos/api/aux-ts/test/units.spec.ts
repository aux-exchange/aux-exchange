import assert from "assert";
import { describe, it } from "mocha";
import { AtomicUnits, DecimalUnits } from "../src/units";

describe("AtomicUnits basic operations", () => {
  it("create from number", () => {
    const au = new AtomicUnits(123);
    assert.equal(123, au.toNumber());
    assert.equal("123", au.toString());
    assert.equal("123", au.toU64());
    assert(au.toBN().eqn(123));
  });

  it("fail to return U64 from negative number", () => {
    const au = new AtomicUnits(-123);
    assert.throws(() => {
      au.toU64();
    });
  });
});

describe("AtomicUnits fromDecimalUnits", () => {
  it("zero number", () => {
    assert.equal(AtomicUnits.fromDecimalUnits(0, 1).toString(), "0");
  });
  it("zero string", () => {
    assert.equal(AtomicUnits.fromDecimalUnits("0", 1).toString(), "0");
  });
  it("same precision as decimals", () => {
    assert.equal(
      AtomicUnits.fromDecimalUnits("123.456", 3).toString(),
      "123456"
    );
  });
  it("higher precision than decimals", () => {
    assert.equal(
      AtomicUnits.fromDecimalUnits("123.456789", 3).toString(),
      "123456"
    );
  });
  it("lower precision than decimals without decimal", () => {
    assert.equal(AtomicUnits.fromDecimalUnits("123", 3).toString(), "123000");
  });
  it("lower precision than decimals with decimal and no trailing", () => {
    assert.equal(AtomicUnits.fromDecimalUnits("123.", 3).toString(), "123000");
  });
  it("lower precision than decimals with decimal", () => {
    assert.equal(AtomicUnits.fromDecimalUnits("123.4", 3).toString(), "123400");
  });
});

describe("DecimalUnits basic operations", () => {
  it("create from number", () => {
    const du = new DecimalUnits("123.456");
    assert.equal(123456, du.toAtomicUnits(3).toNumber());
    assert.equal(123.456, du.toNumber());
    assert.equal("123.456", du.toString());
  });

  it("create from atomic and decimals", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(123000), 3);
    assert.equal(123000, du.toAtomicUnits(3).toNumber());
    assert.equal(123, du.toNumber());
    assert.equal("123.0", du.toString());
  });

  it("format zero", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(0), 3);
    assert.equal("0.0", du.toString());
  });

  it("format atomic under precision", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(1), 3);
    assert.equal("0.001", du.toString());
  });

  it("format atomic under precision strip zeros", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(10), 3);
    assert.equal("0.01", du.toString());
  });

  it("format atomic equal precision", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(123), 3);
    assert.equal("0.123", du.toString());
  });

  it("format atomic greater than precision", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(1234), 3);
    assert.equal("1.234", du.toString());
  });

  it("format atomic greater than precision strip zeros after decimal", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(1200), 3);
    assert.equal("1.2", du.toString());
  });

  it("format atomic greater than precision strip zeros to decimal", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(1000), 3);
    assert.equal("1.0", du.toString());
  });

  it("format atomic greater than precision above decimal", () => {
    const du = DecimalUnits.fromAtomicUnits(new AtomicUnits(10000), 3);
    assert.equal("10.0", du.toString());
  });
});
