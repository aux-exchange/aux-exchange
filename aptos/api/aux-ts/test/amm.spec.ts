import * as assert from "assert";
import { describe, it } from "mocha";
import Pool from "../src/amm/dsl/pool";
import { AuxClient, FakeCoin } from "../src/client";
import { AU, DU } from "../src/units";

const [auxClient, sender] = AuxClient.createFromEnvForTesting({});

const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);

describe("AMM DSL tests", function () {
  this.timeout(30000);

  let pool: Pool;

  it("mintAux", async function () {
    await auxClient.registerAuxCoin(sender);
    let tx = await auxClient.mintAux(
      sender,
      sender.address().toString(),
      AU(1_000_000_000_000)
    );

    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
  });

  it("mintOther", async function () {
    let tx = await auxClient.registerAndMintFakeCoin({
      sender,
      coin: FakeCoin.BTC,
      amount: AU(5_000_000_000_000),
    });
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
  });

  it("createPool", async function () {
    const maybePool = await Pool.read(auxClient, {
      coinTypeX: auxCoin,
      coinTypeY: btcCoin,
    });
    if (maybePool == undefined) {
      pool = await Pool.create(auxClient, {
        sender,
        coinTypeX: auxCoin,
        coinTypeY: btcCoin,
        feePct: 0,
      });
      assert.equal(pool.amountX, 0);
      assert.equal(pool.amountY, 0);
      assert.equal(pool.amountLP, 0);
    } else {
      pool = maybePool;
    }
  });

  it("addExactLiquidity", async function () {
    const tx = await pool.addExactLiquidity({
      sender,
      amountX: DU(2),
      amountY: DU(2),
    });

    assert.ok(tx.tx.success, JSON.stringify(tx, undefined, "  "));
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("checkPoolSymmetricRead", async function () {
    const maybePool = await Pool.read(auxClient, {
      coinTypeX: btcCoin,
      coinTypeY: auxCoin,
    });

    assert.ok(maybePool !== undefined);

    assert.equal(maybePool.amountX.toNumber(), 2);
    assert.equal(maybePool.amountY.toNumber(), 2);
    assert.equal(maybePool.amountLP.toNumber(), 0.2);
  });

  it("position", async function () {
    await pool.update();
    const position = await pool.position(sender.address().toString())!;
    assert.equal(position?.amountX.toNumber(), 1.9999);
    assert.equal(position?.amountY.toNumber(), 1.9999);
    assert.equal(position?.amountLP.toNumber(), 0.19999);
    assert.equal(position?.share, 0.99995);
  });

  it("swapXForY", async function () {
    await pool.swapXForY({
      sender,
      exactAmountIn: DU(2),
      minAmountOut: DU(1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 1);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapYForX", async function () {
    await pool.swapYForX({
      sender,
      exactAmountIn: DU(1),
      minAmountOut: DU(2),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapXForYLimit binding limit price", async function () {
    // Starting from (X, Y) = (2, 2)
    // The marginal price of X:Y is currently 1.
    // Swap with a max price of 1 should do nothing.
    await pool.swapXForYLimit({
      sender,
      exactAmountIn: DU(2),
      minOutPerIn: DU(1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapXForYLimit relaxed limit price", async function () {
    // Starting from (X, Y) = (2,
    //                         2)
    // The marginal price of X:Y is currently 1.
    // Swap with a max price of 4 should enable a swap.
    await pool.swapXForYLimit({
      sender,
      exactAmountIn: DU(2),
      minOutPerIn: DU(0.25),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 1);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapYForXLimit binding limit price", async function () {
    // Starting from (X, Y) = (4,
    //                         1)
    // The marginal price of Y:X is 0.25
    // Swap with a max price of 0.25 should do nothing.
    await pool.swapYForXLimit({
      sender,
      exactAmountIn: DU(0.00000005),
      minOutPerIn: DU(4),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 1);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapYForXLimit relaxed limit price", async function () {
    // Starting from (X, Y) = (4,
    //                         1)
    // The marginal price of Y:X is 0.25
    await pool.swapYForXLimit({
      sender,
      exactAmountIn: DU(1),
      minOutPerIn: DU(1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapXForYExact", async function () {
    await pool.swapXForYExact({
      sender,
      maxAmountIn: DU(2),
      exactAmountOut: DU(1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 1);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapYForXExact", async function () {
    await pool.swapYForXExact({
      sender,
      maxAmountIn: DU(1),
      exactAmountOut: DU(2),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapXForYExactLimit", async function () {
    let tx = await pool.swapXForYExactLimit({
      sender,
      maxAmountIn: DU(2),
      maxInPerOut: DU(4),
      exactAmountOut: DU(1),
    });
    assert.ok(
      tx.tx.success,
      `failed: ${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
    );
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 1);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("swapYForXExactLimit", async function () {
    let tx = await pool.swapYForXExactLimit({
      sender,
      maxAmountIn: DU(3),
      maxInPerOut: DU(4),
      exactAmountOut: DU(3),
    });
    await pool.update();
    assert.ok(
      tx.tx.success,
      `failed: ${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
    );
    assert.equal(pool.amountX.toNumber(), 1);
    assert.equal(pool.amountY.toNumber(), 4);
    assert.equal(pool.amountLP.toNumber(), 0.2);
  });

  it("removeLiquidity", async function () {
    await pool.removeLiquidity({
      sender,
      amountLP: DU(0.1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 0.5);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 0.1);
  });

  it("addApproximateLiquidity", async () => {
    let tx = await pool.addExactLiquidity({
      sender,
      amountX: DU("49.5"),
      amountY: DU("198"),
    });
    assert.ok(
      tx.tx.success,
      `${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
    );

    await pool.update();
    const originalLP = pool.amountAuLP;
    assert.equal(50, pool.amountX.toNumber());
    assert.equal(200, pool.amountY.toNumber());

    // Should fail because the LP will increase.
    tx = await pool.addApproximateLiquidity({
      sender,
      maxX: AU("1"),
      maxY: AU("10"),
      maxPoolLP: originalLP,
    });
    assert.ok(!tx.tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
    await pool.update();
    assert.equal(50, pool.amountX.toNumber());
    assert.equal(200, pool.amountY.toNumber());

    // Should fail because X only increases by 1.
    tx = await pool.addApproximateLiquidity({
      sender,
      maxX: DU("1"),
      maxY: DU("10"),
      minPoolX: DU("52"),
    });
    assert.ok(!tx.tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
    await pool.update();
    assert.equal(50, pool.amountX.toNumber());
    assert.equal(200, pool.amountY.toNumber());

    // Should fail because Y only increases by 4
    tx = await pool.addApproximateLiquidity({
      sender,
      maxX: DU("1"),
      maxY: DU("4"),
      minPoolY: DU("205"),
    });
    assert.ok(!tx.tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
    await pool.update();
    assert.equal(50, pool.amountX.toNumber());
    assert.equal(200, pool.amountY.toNumber());

    tx = await pool.addApproximateLiquidity({
      sender,
      maxX: DU("1"),
      maxY: DU("10"),
      maxPoolLP: DU("10404"),
      minPoolX: DU("51"),
      minPoolY: DU("204"),
    });
    assert.ok(tx.tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
    await pool.update();
    assert.equal(51, pool.amountX.toNumber());
    assert.equal(204, pool.amountY.toNumber());

    assert.ok(
      (
        await pool.removeLiquidity({
          sender,
          amountLP: AU(pool.amountAuLP.toNumber() - 1000),
        })
      ).tx.success
    );
  });

  it("addLiquidity", async () => {
    await pool.resetPool({ sender });
    {
      let tx = await pool.addExactLiquidity({
        sender,
        amountX: AU("1000"),
        amountY: AU("4001"),
      });
      assert.ok(
        tx.tx.success,
        `${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
      );

      await pool.update();
      assert.equal(1000, pool.amountAuX.toNumber());
      assert.equal(4001, pool.amountAuY.toNumber());
      assert.equal(2000, pool.amountAuLP.toNumber());
    }

    {
      // Should fail because user will receive 1999 tokens for the deposit.
      // 1 / 2000 = 5 bps.
      let tx = await pool.addLiquidity({
        sender,
        amountX: AU("1000"),
        amountY: AU("4000"),
        maxSlippageBps: AU("4"),
      });
      assert.ok(
        !tx.tx.success,
        `${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
      );
      await pool.update();
      assert.equal(1000, pool.amountAuX.toNumber());
      assert.equal(4001, pool.amountAuY.toNumber());
      assert.equal(2000, pool.amountAuLP.toNumber());
    }

    {
      let tx = await pool.addLiquidity({
        sender,
        amountX: AU("1000"),
        amountY: AU("4000"),
        maxSlippageBps: AU("5"),
      });
      assert.ok(
        tx.tx.success,
        `${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
      );
      await pool.update();
      assert.equal(2000, pool.amountAuX.toNumber());
      assert.equal(8001, pool.amountAuY.toNumber());
      assert.equal(3999, pool.amountAuLP.toNumber());
    }

    assert.ok(
      (
        await pool.removeLiquidity({
          sender,
          amountLP: AU(pool.amountAuLP.toNumber() - 1000),
        })
      ).tx.success
    );
  });

  it("events", async function () {
    await pool.update();
    await Promise.all([
      assert.ok(await pool.swapEvents()),
      assert.ok(await pool.addLiquidityEvents()),
      assert.ok(await pool.removeLiquidityEvents()),
    ]);
  });

  it("resetPool", async function () {
    await pool.resetPool({ sender });
  });
});
