// import { AptosAccount } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
// import { Vault } from "../src";
import { StableSwapClient } from "../src/pool/stable-swap/client";
import type { StableSwap } from "../src/pool/stable-swap/schema";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AU, Bps} from "../src/units";
// import { toSafeInteger } from "lodash";

describe.only("Stable 3pool tests", function () {
  this.timeout(30000);

  const auxEnv = new AuxEnv();
  const auxClient = new AuxClient(
    auxEnv.aptosNetwork,
    auxEnv.aptosClient,
    auxEnv.faucetClient
  );
  const moduleAuthority = auxClient.moduleAuthority!;
  auxClient.sender = moduleAuthority;

  const usdcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
  const usdtCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDT);
  const usdaCoin = auxClient.getWrappedFakeCoinType(FakeCoin.USDA);
 
  /*
  const auxAccountOwner = AptosAccount.fromAptosAccountObject({
    privateKeyHex:
      "0x2b248dee740ee1e8d271afb89590554cd9655ee9fae8a0ec616b95911834eb49",
  });
  */

  // const auxAccountOwnerAddr = auxAccountOwner.address().toShortString();

  const poolClient: StableSwapClient = new StableSwapClient(auxClient, [usdcCoin, usdtCoin, usdcCoin]);
  let pool: StableSwap;
  // let vault: Vault;

  // mint USDC
  it("mintUSDC", async function () {
    await auxClient.registerAuxCoin();
    let tx = await auxClient.registerAndMintFakeCoin(
        FakeCoin.USDC,
        AU(2_000)
    );
    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
  });

  // mint USDT
  it("mintUSDT", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDT,
      AU(2_000)
    );
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
  });
  
  it("mintUSDA", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDC,
      AU(40)
    );
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
  });

  
  // create USDC-USDT stableswap pool. 
  it("createPool", async function () {
    let tx = await poolClient.create({ fee: new Bps(15) }, 10);
    pool = await poolClient.query();
    assert.ok(
        tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );
  });

  // testing test_add_liquidity line 390 - from 
  // ../../contract/aux/sources/stable_2pool_test.move
  it("addLiquidity", async () => {
    {
      let amounts = [AU("1000"), AU("2000"), AU("40")]
      let tx = await poolClient.addLiquidity(
        {amounts: amounts, minLP: AU("0")},
      );
      assert.ok(
        tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );
      const [expectedUSDCAmount, expectedUSDTAmount, expectedUSDAAmount, expectedLPAmount] = [1_000, 2000, 40, 292_527_494_605];
      let pool = await poolClient.query();
      const [usdcAmount, usdtAmount, usdaAmount] = pool.amounts;
      const [usdcInfo, usdtInfo, usdaInfo] = pool.coinInfos;
      
      assert.equal(
        expectedUSDCAmount,
        usdcAmount!.toAtomicUnits(usdcInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDTAmount,
        usdtAmount!.toAtomicUnits(usdtInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDAAmount,
        usdaAmount!.toAtomicUnits(usdaInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedLPAmount,
        pool.amountLP.toAtomicUnits(pool.coinInfoLP.decimals).toNumber()
      );
    }
  });

  it("swap", async () => {
    await poolClient.swap({
        coinTypeIn: usdcCoin,
        coinTypeOut: usdaCoin,
        exactAmountIn: AU(20),
        parameters: {minAmountOut: AU(0)},
    });
    const [expectedUSDCAmount, expectedUSDTAmount, expectedUSDAAmount, expectedLPAmount] = [1_000, 2000, 40, 292_527_494_605];
    pool = await poolClient.query();
    const [usdcAmount, usdtAmount, usdaAmount] = pool.amounts;
    //const [usdcInfo, usdtInfo, usdaInfo] = pool.coinInfos;
    console.log(usdcAmount, usdtAmount, usdaAmount);
    console.log(expectedUSDCAmount, expectedUSDTAmount, expectedUSDAAmount, expectedLPAmount);
    console.log(pool.amountLP);
    /*
    assert.equal(
        expectedUSDCAmount,
        usdcAmount!.toAtomicUnits(usdcInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDTAmount,
        usdtAmount!.toAtomicUnits(usdtInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedLPAmount,
        pool.amountLP.toAtomicUnits(pool.coinInfoLP.decimals).toNumber()
      );
      */


  })
  /*
  it("removeLiquidity", async function () {
    const removedLPAmount = AU(100_000);
    await poolClient.removeLiquidity({
      amountLP: removedLPAmount,
    });
    const [expectedUSDCAmount, expectedUSDTAmount, expectedLPAmount] = [802, 3198, 399181];
    pool = await poolClient.query();
    const [usdcAmount, usdtAmount] = pool.amounts;
    const [usdcInfo, usdtInfo] = pool.coinInfos;
    assert.equal(
        expectedUSDCAmount,
        usdcAmount!.toAtomicUnits(usdcInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDTAmount,
        usdtAmount!.toAtomicUnits(usdtInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedLPAmount,
        pool.amountLP.toAtomicUnits(pool.coinInfoLP.decimals).toNumber()
      );
  });
  */
});
