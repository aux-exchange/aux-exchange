// import { AptosAccount } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
// import { Vault } from "../src";
import { StableSwapClient } from "../src/pool/stable-swap/client";
import type { StableSwap } from "../src/pool/stable-swap/schema";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AU, Bps, DU} from "../src/units";
//import { toString } from "lodash";
// import { toSafeInteger } from "lodash";

describe("Stable 3pool tests", function () {
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
  const usdcD8Coin = auxClient.getWrappedFakeCoinType(FakeCoin.USDCD8);
  const token_mul = 1_000_000;

  /*
  const auxAccountOwner = AptosAccount.fromAptosAccountObject({
    privateKeyHex:
      "0x2b248dee740ee1e8d271afb89590554cd9655ee9fae8a0ec616b95911834eb49",
  });
  */

  // const auxAccountOwnerAddr = auxAccountOwner.address().toShortString();

  const poolClient: StableSwapClient = new StableSwapClient(auxClient, [usdcCoin, usdtCoin, usdcD8Coin]);
  let pool: StableSwap;
  // let vault: Vault;

  // mint USDC
  it("mintUSDC", async function () {
    await auxClient.registerAuxCoin();
    let tx = await auxClient.registerAndMintFakeCoin(
        FakeCoin.USDC,
        AU(2_000_000_000 * token_mul)
    );
    assert.ok(tx.success, JSON.stringify(tx, undefined, "  "));
  });

  // mint USDT
  it("mintUSDT", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDT,
      AU(2_000_000_000 * token_mul)
    );
    assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
  });
  
  // mint second USDC
  it("mintUSDCD8", async function () {
    let tx = await auxClient.registerAndMintFakeCoin(
      FakeCoin.USDCD8,
      AU(4_000_000_000 * token_mul)
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

  it("addLiquidity", async () => {
    { 
      let amounts = [AU(1000 * token_mul), AU(2000 * token_mul), AU(4000 * token_mul)];
      let tx = await poolClient.addLiquidity(
        {amounts: amounts, minLP: AU("0")},
      );
      assert.ok(
        tx.transaction.success,
        `${JSON.stringify(tx.transaction.vm_status, undefined, "  ")}`
      );
      const [expectedUSDCAmount, expectedUSDTAmount, expectedUSDCD8Amount, expectedLPAmount] = [1_000 * token_mul, 2_000 * token_mul, 4_000 * token_mul, 292_527_494_605];
      let pool = await poolClient.query();
      const [usdcAmount, usdtAmount, usdcD8Amount] = pool.amounts;
      const [usdcInfo, usdtInfo, usdcD8Info] = pool.coinInfos;
      assert.equal(
        expectedUSDCAmount,
        usdcAmount!.toAtomicUnits(usdcInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDTAmount,
        usdtAmount!.toAtomicUnits(usdtInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDCD8Amount,
        usdcD8Amount!.toAtomicUnits(usdcD8Info!.decimals).toNumber()
      );
      assert.equal(
        expectedLPAmount,
        pool.amountLP.toAtomicUnits(pool.coinInfoLP.decimals).toNumber()
      );
    }
  });

  it("swap Exact", async () => {
    {
      pool = await poolClient.query();
      await poolClient.swap({
          coinTypeIn: usdcCoin,
          coinTypeOut: usdcD8Coin,
          exactAmountIn: AU(20 * token_mul),
          parameters: {minAmountOut: AU(0)},
        },       
        {
          maxGasAmount: AU(1_000_000),
        }
      );
      const expectedUSDCD8Amount = 3_502_459_828;
      pool = await poolClient.query();
      const usdcD8Amount = pool.amounts[2];
      const usdcD8Info = pool.coinInfos[2];
      assert.equal(
        expectedUSDCD8Amount,
        usdcD8Amount!.toAtomicUnits(usdcD8Info!.decimals).toNumber()
      );
   }
  });
  
  it("removeLiquidity", async () => {
    {
      pool = await poolClient.query();
      const removedLPAmount = DU(1000);
      await poolClient.removeLiquidity(
        {amountLP: removedLPAmount,},
        {maxGasAmount: AU(1_000_000),}
      );
      const [expectedUSDCAmount, expectedUSDTAmount, expectedUSDCD8Amount, expectedLPAmount] = [671_314_828, 1_316_303_583, 2_612_141_107, 192_527_494_605]

      pool = await poolClient.query();
      const [usdcAmount, usdtAmount, usdcD8Amount] = pool.amounts;
      const [usdcInfo, usdtInfo, usdcD8Info] = pool.coinInfos;
      assert.equal(
        expectedUSDCAmount,
        usdcAmount!.toAtomicUnits(usdcInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDTAmount,
        usdtAmount!.toAtomicUnits(usdtInfo!.decimals).toNumber()
      );
      assert.equal(
        expectedUSDCD8Amount,
        usdcD8Amount!.toAtomicUnits(usdcD8Info!.decimals).toNumber()
      );
      assert.equal(
        expectedLPAmount,
        pool.amountLP.toAtomicUnits(pool.coinInfoLP.decimals).toNumber()
      );
    }    
  });
});