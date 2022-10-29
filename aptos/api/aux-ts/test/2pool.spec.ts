import { AptosAccount } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
import { Vault } from "../src";
import Pool from "../src/2pool/dsl/pool";
import { AuxClient, FakeCoin } from "../src/client";
import { AU, DU } from "../src/units";

const [auxClient, sender] = AuxClient.createFromEnvForTesting({});

const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
const auxAccountOwner = new AptosAccount();
const auxAccountOwnerAddr = auxAccountOwner.address().toShortString();

describe("2pool DSL tests", function () {
  this.timeout(30000);

  let pool: Pool;
  let vault: Vault;

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
      console.log("fs")
      pool = await Pool.create(auxClient, {
        sender,
        coinTypeX: auxCoin,
        coinTypeY: btcCoin,
        feePct: 0,
        startA: 85,
        xRampUpDec: 2, 
        yRampUpDec: 0,
      });
      assert.equal(pool.amountX, 0);
      assert.equal(pool.amountY, 0);
      assert.equal(pool.amountLP, 0);
    } else {
      pool = maybePool;
    }
  });

  it("addLiquidity", async function () {
    let initX = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoX.coinType,
    });
    let initY = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoY.coinType,
    });

    const tx = await pool.addLiquidity({
      sender,
      amountX: DU(2),
      amountY: DU(2),
    });
    assert.ok(tx.tx.success, JSON.stringify(tx, undefined, "  "));
    await pool.update();
    console.log(pool.amountX.toNumber())
    console.log(pool.amountY.toNumber())
    console.log(pool.amountLP.toNumber())


    assert.equal(pool.amountX.toNumber(), 2);
    assert.equal(pool.amountY.toNumber(), 2);
    assert.equal(pool.amountLP.toNumber(), 4);

    let finalX = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoX.coinType,
    });
    let finalY = await auxClient.getCoinBalanceDecimals({
      account: sender.address(),
      coinType: pool.coinInfoY.coinType,
    });

    assert.equal(initX.toNumber() - finalX.toNumber(), 2);
    assert.equal(initY.toNumber() - finalY.toNumber(), 2);
  });

  it("checkPoolSymmetricRead", async function () {
    const maybePool = await Pool.read(auxClient, {
      coinTypeX: btcCoin,
      coinTypeY: auxCoin,
    });

    assert.ok(maybePool !== undefined);

    assert.equal(maybePool.amountX.toNumber(), 2);
    assert.equal(maybePool.amountY.toNumber(), 2);
    assert.equal(maybePool.amountLP.toNumber(), 4);
  });

  it("position", async function () {
    await pool.update();
    const position = await pool.position(sender.address().toString())!;
    assert.equal(position?.amountX.toNumber(), 1.999995);
    assert.equal(position?.amountY.toNumber(), 1.999995);
    assert.equal(position?.amountLP.toNumber(),  3.99999);
    assert.equal(position?.share, 0.9999975);
  });

  it("swapXForY", async function () {
    await pool.swapXForY({
      sender,
      exactAmountIn: DU(2),
      minAmountOut: DU(1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 0.10274226);
    assert.equal(pool.amountLP.toNumber(), 4);
  });
  
  // not enought liquidity
  it("swapYForX", async function () {
    await pool.swapYForX({
      sender,
      exactAmountIn: DU(1),
      minAmountOut: DU(2),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 4);
    assert.equal(pool.amountY.toNumber(), 0.10274226);
    assert.equal(pool.amountLP.toNumber(), 4);
  });


  it("removeLiquidity", async function () {
    await pool.removeLiquidity({
      sender,
      amountLP: DU(0.1),
    });
    await pool.update();
    assert.equal(pool.amountX.toNumber(), 3.9);
    assert.equal(pool.amountY.toNumber(), 0.10017371);
    assert.equal(pool.amountLP.toNumber(), 3.9);
  });


  it("addLiquidity", async () => {
    await pool.resetPool({ sender });
    {
      let tx = await pool.addLiquidity({
        sender,
        amountX: AU("2000"),
        amountY: AU("2001"),
      });
      assert.ok(
        tx.tx.success,
        `${JSON.stringify(tx.tx.vm_status, undefined, "  ")}`
      );

      await pool.update();
      assert.equal(3902000, pool.amountAuX.toNumber());
      assert.equal(10019372, pool.amountAuY.toNumber());
      assert.equal(390193875, pool.amountAuLP.toNumber());
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

  it("depositToAuxAccount", async function () {
    vault = new Vault(auxClient);
    await auxClient.airdropNativeCoin({
      account: auxAccountOwner.address(),
      quantity: AU(500_000_000),
    });
    await auxClient.registerAuxCoin(auxAccountOwner);
    let tx = await auxClient.mintAux(sender, auxAccountOwnerAddr, DU(4));
    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
    tx = await auxClient.registerAndMintFakeCoin({
      sender: auxAccountOwner,
      coin: FakeCoin.BTC,
      amount: DU(4),
    });
    await vault.createAuxAccount(auxAccountOwner);
    tx = await vault.deposit(
      auxAccountOwner,
      auxCoin,
      DU(4),
      auxAccountOwnerAddr
    );
    assert.ok(tx.success, `${JSON.stringify(tx.vm_status, undefined, "  ")}`);
    assert.equal(
      (await vault.balance(auxAccountOwnerAddr, auxCoin)).toNumber(),
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
      (await vault.balance(auxAccountOwnerAddr, btcCoin)).toNumber(),
      4
    );
  });

  it("resetPool", async function () {
    await pool.resetPool({ sender });
  });
});
