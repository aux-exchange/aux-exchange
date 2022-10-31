import { AptosAccount } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
import { Pool, Vault } from "../src";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AU, Bps, DU } from "../src/units";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);
const moduleAuthority = auxClient.options.moduleAuthority!;
auxClient.options.sender = moduleAuthority;

const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
const auxAccountOwner = new AptosAccount();
const auxAccountOwnerAddr = auxAccountOwner.address().toShortString();

describe("AMM tests", function () {
  this.timeout(30000);

  let pool: Pool;
  let vault: Vault;

  it("mintAux", async function () {
    await auxClient.registerAuxCoin();
    let tx = await auxClient.mintAux(
      moduleAuthority.address().toString(),
      AU(1_000_000_000_000)
    );

    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
  });

  it("mintOther", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.BTC,
      AU(5_000_000_000_000)
    );
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
  });

  it("createPool", async function () {
    pool = new Pool(auxClient, {
      coinTypeX: auxCoin,
      coinTypeY: btcCoin,
    });
    await pool.create({ fee: new Bps(0) });
    await pool.query();
  });

  it("addExactLiquidity", async function () {
    let initX = await auxClient.getCoinBalanceDecimals({
      account: moduleAuthority.address(),
      coinType: pool.coinInfoX!.coinType,
    });
    let initY = await auxClient.getCoinBalanceDecimals({
      account: moduleAuthority.address(),
      coinType: pool.coinInfoY!.coinType,
    });

    const tx = await pool.addExactLiquidity({
      amountX: DU(2),
      amountY: DU(2),
    });
    assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);

    let finalX = await auxClient.getCoinBalanceDecimals({
      account: moduleAuthority.address(),
      coinType: pool.coinInfoX!.coinType,
    });
    let finalY = await auxClient.getCoinBalanceDecimals({
      account: moduleAuthority.address(),
      coinType: pool.coinInfoY!.coinType,
    });

    assert.equal(initX!.toNumber() - finalX!.toNumber(), 2);
    assert.equal(initY!.toNumber() - finalY!.toNumber(), 2);
  });

  it("position", async function () {
    const position = await pool.position(moduleAuthority.address().toString())!;
    assert.equal(position?.amountX!.toNumber(), 1.9999);
    assert.equal(position?.amountY!.toNumber(), 1.9999);
    assert.equal(position?.amountLP!.toNumber(), 0.19999);
    assert.equal(position?.share, 0.99995);
  });

  it("swap AUX for BTC", async function () {
    await pool.swap({
      coinTypeIn: auxCoin,
      exactAmountIn: DU(2),
      parameters: { minAmountOut: DU(1) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 4);
    assert.equal(pool.amountY!.toNumber(), 1);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap BTC for AUX", async function () {
    await pool.swap({
      coinTypeIn: btcCoin,
      exactAmountIn: DU(1),
      parameters: { minAmountOut: DU(2) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap AUX for BTC binding limit price", async function () {
    // Starting from (X, Y) = (2, 2)
    // The marginal price of X:Y is currently 1.
    // Swap with a max price of 1 should do nothing.
    await pool.swap({
      coinTypeIn: auxCoin,
      exactAmountIn: DU(2),
      parameters: { minAmountOutPerIn: DU(1) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap AUX for BTC relaxed limit price", async function () {
    // Starting from (X, Y) = (2,
    //                         2)
    // The marginal price of X:Y is currently 1.
    // Swap with a max price of 4 should enable a swap.
    await pool.swap({
      coinTypeIn: auxCoin,
      exactAmountIn: DU(2),
      parameters: { minAmountOutPerIn: DU(0.25) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 4);
    assert.equal(pool.amountY!.toNumber(), 1);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap BTC for AUX binding limit price", async function () {
    // Starting from (X, Y) = (4,
    //                         1)
    // The marginal price of Y:X is 0.25
    // Swap with a max price of 0.25 should do nothing.
    await pool.swap({
      coinTypeIn: btcCoin,
      exactAmountIn: DU(0.00000005),
      parameters: { minAmountOutPerIn: DU(4) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 4);
    assert.equal(pool.amountY!.toNumber(), 1);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap BTC for AUX relaxed limit price", async function () {
    // Starting from (X, Y) = (4,
    //                         1)
    // The marginal price of Y:X is 0.25
    await pool.swap({
      coinTypeIn: btcCoin,
      exactAmountIn: DU(1),
      parameters: { minAmountOutPerIn: DU(1) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap AUX for BTC exact out", async function () {
    await pool.swap({
      coinTypeOut: btcCoin,
      exactAmountOut: DU(1),
      parameters: { maxAmountIn: DU(2) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 4);
    assert.equal(pool.amountY!.toNumber(), 1);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap BTC for AUX exact out", async function () {
    await pool.swap({
      coinTypeOut: auxCoin,
      exactAmountOut: DU(2),
      parameters: { maxAmountIn: DU(1) },
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap AUX for BTC exact out limit", async function () {
    let tx = await pool.swap({
      coinTypeOut: btcCoin,
      exactAmountOut: DU(1),
      parameters: {
        maxAmountIn: DU(2),
        maxAmountInPerOut: DU(4),
      },
    });
    assert.ok(
      tx.transaction.success,
      `failed: ${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
    );
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 4);
    assert.equal(pool.amountY!.toNumber(), 1);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("swap BTC for AUX exact out limit", async function () {
    let tx = await pool.swap({
      coinTypeOut: auxCoin,
      exactAmountOut: DU(3),
      parameters: {
        maxAmountIn: DU(3),
        maxAmountInPerOut: DU(4),
      },
    });
    await pool.query();
    assert.ok(
      tx.transaction.success,
      `failed: ${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
    );
    assert.equal(pool.amountX!.toNumber(), 1);
    assert.equal(pool.amountY!.toNumber(), 4);
    assert.equal(pool.amountLP!.toNumber(), 0.2);
  });

  it("removeLiquidity", async function () {
    await pool.removeLiquidity({
      amountLP: DU(0.1),
    });
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 0.5);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.1);
  });

  it("addApproximateLiquidity", async () => {
    let tx = await pool.addExactLiquidity({
      amountX: DU("49.5"),
      amountY: DU("198"),
    });
    assert.ok(
      tx.transaction.success,
      `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
    );

    await pool.query();
    const originalLP = pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals);
    assert.equal(50, pool.amountX!.toNumber());
    assert.equal(200, pool.amountY!.toNumber());

    // Should fail because the LP will increase.
    tx = await pool.addApproximateLiquidity({
      maxX: AU("1"),
      maxY: AU("10"),
      maxPoolLP: originalLP,
    });
    assert.ok(
      !tx.transaction.success,
      `${JSON.stringify(tx, undefined, "  ")}`
    );
    await pool.query();
    assert.equal(50, pool.amountX!.toNumber());
    assert.equal(200, pool.amountY!.toNumber());

    // Should fail because X only increases by 1.
    tx = await pool.addApproximateLiquidity({
      maxX: DU("1"),
      maxY: DU("10"),
      minPoolX: DU("52"),
    });
    assert.ok(
      !tx.transaction.success,
      `${JSON.stringify(tx, undefined, "  ")}`
    );
    await pool.query();
    assert.equal(50, pool.amountX!.toNumber());
    assert.equal(200, pool.amountY!.toNumber());

    // Should fail because Y only increases by 4
    tx = await pool.addApproximateLiquidity({
      maxX: DU("1"),
      maxY: DU("4"),
      minPoolY: DU("205"),
    });
    assert.ok(
      !tx.transaction.success,
      `${JSON.stringify(tx, undefined, "  ")}`
    );
    await pool.query();
    assert.equal(50, pool.amountX!.toNumber());
    assert.equal(200, pool.amountY!.toNumber());

    tx = await pool.addApproximateLiquidity({
      maxX: DU("1"),
      maxY: DU("10"),
      maxPoolLP: DU("10404"),
      minPoolX: DU("51"),
      minPoolY: DU("204"),
    });
    assert.ok(tx.transaction.success, `${JSON.stringify(tx, undefined, "  ")}`);
    await pool.query();
    assert.equal(51, pool.amountX!.toNumber());
    assert.equal(204, pool.amountY!.toNumber());

    assert.ok(
      (
        await pool.removeLiquidity({
          amountLP: AU(
            pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals).toNumber() -
              1000
          ),
        })
      ).transaction.success
    );
  });

  it("addLiquidity", async () => {
    await pool.drain();
    {
      let tx = await pool.addExactLiquidity({
        amountX: AU("1000"),
        amountY: AU("4001"),
      });
      assert.ok(
        tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );

      await pool.query();
      assert.equal(
        1000,
        pool.amountX!.toAtomicUnits(pool.coinInfoX!.decimals).toNumber()
      );
      assert.equal(
        4001,
        pool.amountY!.toAtomicUnits(pool.coinInfoY!.decimals).toNumber()
      );
      assert.equal(
        2000,
        pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals).toNumber()
      );
    }

    {
      // Should fail because user will receive 1999 tokens for the deposit.
      // 1 / 2000 = 5 bps.
      let tx = await pool.addLiquidity({
        amountX: AU("1000"),
        amountY: AU("4000"),
        slippage: new Bps(4),
      });
      assert.ok(
        !tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );
      await pool.query();
      assert.equal(
        1000,
        pool.amountX!.toAtomicUnits(pool.coinInfoX!.decimals).toNumber()
      );
      assert.equal(
        4001,
        pool.amountY!.toAtomicUnits(pool.coinInfoY!.decimals).toNumber()
      );
      assert.equal(
        2000,
        pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals).toNumber()
      );
    }

    {
      let tx = await pool.addLiquidity({
        amountX: AU("1000"),
        amountY: AU("4000"),
        slippage: new Bps(5),
      });
      assert.ok(
        tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );
      await pool.query();
      assert.equal(
        2000,
        pool.amountX!.toAtomicUnits(pool.coinInfoX!.decimals).toNumber()
      );
      assert.equal(
        8001,
        pool.amountY!.toAtomicUnits(pool.coinInfoY!.decimals).toNumber()
      );
      assert.equal(
        3999,
        pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals).toNumber()
      );
    }

    assert.ok(
      (
        await pool.removeLiquidity({
          amountLP: AU(
            pool.amountLP!.toAtomicUnits(pool.coinInfoLP!.decimals).toNumber() -
              1000
          ),
        })
      ).transaction.success
    );
  });

  it("events", async function () {
    await pool.query();
    await Promise.all([
      assert.ok(await pool.swapEvents()),
      assert.ok(await pool.addLiquidityEvents()),
      assert.ok(await pool.removeLiquidityEvents()),
    ]);
  });

  it("depositToAuxAccount", async function () {
    vault = new Vault(auxClient);
    await auxClient.fundAccount({
      account: auxAccountOwner.address(),
      quantity: AU(500_000_000),
    });
    await auxClient.registerAuxCoin();
    let tx = await auxClient.mintAux(auxAccountOwnerAddr, DU(4));
    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
    tx = await auxClient.registerAndMintFakeCoin(FakeCoin.BTC, DU(4));
    await vault.createAuxAccount();
    tx = await vault.deposit(
      auxAccountOwner,
      auxCoin,
      DU(4),
      auxAccountOwnerAddr
    );
    assert.ok(tx.success, `${JSON.stringify(tx.vm_status, undefined, "  ")}`);
    assert.equal(
      (await vault.balance(auxAccountOwnerAddr, auxCoin))!.toNumber(),
      4
    );
    tx = await vault.deposit(
      auxAccountOwner,
      btcCoin,
      DU(4),
      auxAccountOwnerAddr
    );
    assert.ok(tx.success, `${JSON.stringify(tx.vm_status, undefined, "  ")}`);
    assert.equal(
      (await vault.balance(auxAccountOwnerAddr, btcCoin))!.toNumber(),
      4
    );
  });

  it("addLiquidityWithAccount", async function () {
    await pool.drain();
    let initX = await vault.balance(
      auxAccountOwnerAddr,
      pool.coinInfoX!.coinType
    );
    let initY = await vault.balance(
      auxAccountOwnerAddr,
      pool.coinInfoY!.coinType
    );

    const tx = await pool.addLiquidity({
      amountX: DU(2),
      amountY: DU(2),
      slippage: new Bps(0),
      useAccountBalance: true,
    });
    assert.ok(tx.transaction.success, JSON.stringify(tx, undefined, "  "));
    await pool.query();
    assert.equal(pool.amountX!.toNumber(), 2);
    assert.equal(pool.amountY!.toNumber(), 2);
    assert.equal(pool.amountLP!.toNumber(), 0.2);

    let finalX = await vault.balance(
      auxAccountOwnerAddr,
      pool.coinInfoX!.coinType
    );
    let finalY = await vault.balance(
      auxAccountOwnerAddr,
      pool.coinInfoY!.coinType
    );

    assert.equal(initX!.toNumber() - finalX!.toNumber(), 2);
    assert.equal(initY!.toNumber() - finalY!.toNumber(), 2);
    await pool.removeLiquidity({
      amountLP: DU(0.2),
      useAccountBalance: true,
    });
  });

  it("resetPool", async function () {
    await pool.drain();
  });
});
