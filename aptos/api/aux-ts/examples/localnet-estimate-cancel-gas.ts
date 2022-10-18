import type { AptosAccount } from "aptos";
import * as assert from "assert";
import { AuxClient, FakeCoin, NATIVE_APTOS_COIN } from "../src/client";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import Market from "../src/clob/dsl/market";
import { AtomicUnits, AU, DecimalUnits } from "../src/units";
import Vault from "../src/vault/dsl/vault";
import { getAliceBob } from "../test/alice_and_bob";
import { writeFileSync } from "fs";
import { join } from "path";

// const N_ORDERS = 100;
// const N_CANCELS = 1;

const [auxClient, aux] = AuxClient.createFromEnvForTesting({});

const auxCoin = auxClient.getWrappedFakeCoinType(FakeCoin.AUX);
const baseCoin = auxCoin;
const quoteCoin = auxClient.getWrappedFakeCoinType(FakeCoin.SOL);
let alice: AptosAccount;
let bob: AptosAccount;
let aliceAddr: string;
let bobAddr: string;
let vault: Vault;
let market: Market;

async function setup() {
  [alice, bob] = await getAliceBob(auxClient);
  aliceAddr = alice.address().toString();
  bobAddr = bob.address().toString();

  // Create two accounts, Alice and Bob, and fund
  console.log("\n=== Addresses ===");
  console.log(`Module: ${auxClient.moduleAddress}`);
  console.log(`Alice: ${alice.address()}`);
  console.log(`Bob: ${bob.address()}`);

  let tx = await auxClient.registerAuxCoin(alice);
  // assert.ok(tx.success, `${tx.vm_status}`);
  tx = await auxClient.registerAuxCoin(bob);
  // assert.ok(tx.success, `${tx.vm_status}`);
  tx = await auxClient.mintAux(aux, aliceAddr, AU(100_000_000));
  assert.ok(tx.success, `${tx.vm_status}`);
  tx = await auxClient.mintAux(aux, bobAddr, AU(100_000_000));
  assert.ok(tx.success, `${tx.vm_status}`);

  vault = new Vault(auxClient);

  await vault.createAuxAccount(alice);
  await vault.createAuxAccount(bob);

  tx = await vault.deposit(alice, quoteCoin, AU(5_000_000_000));
  tx = await vault.deposit(alice, NATIVE_APTOS_COIN, AU(100_000_000));
  assert.ok(tx.success, `${tx.vm_status}}]`);
  assert.equal((await vault.balance(aliceAddr, quoteCoin)).toNumber(), 5);
  assert.equal((await vault.balance(aliceAddr, baseCoin)).toNumber(), 0);
  assert.equal(
    (await vault.balance(aliceAddr, NATIVE_APTOS_COIN)).toNumber(),
    1
  );

  tx = await vault.deposit(bob, baseCoin, AU(5_000_000_000));
  tx = await vault.deposit(bob, NATIVE_APTOS_COIN, AU(100_000_000));
  assert.ok(tx.success, `${tx.vm_status}}]`);
  assert.equal((await vault.balance(bobAddr, quoteCoin)).toNumber(), 0);
  assert.equal((await vault.balance(bobAddr, baseCoin)).toNumber(), 5000);
  assert.equal((await vault.balance(bobAddr, NATIVE_APTOS_COIN)).toNumber(), 1);

  market = await Market.create(auxClient, {
    sender: aux,
    baseCoinType: baseCoin,
    quoteCoinType: quoteCoin,
    baseLotSize: new AtomicUnits(1000),
    quoteLotSize: new AtomicUnits(1000),
  });

  assert.ok(market);
}

async function estimate(
  n_cancels: number,
  n_orders: number,
  n_levels: number,
  iterations: number
) {
  await writeFileSync(join(__dirname, "output.json"), "[", {
    flag: "w",
  });
  for (let iter = 1; iter <= iterations; iter++) {
    let lastTime = 0;
    for (let i = n_cancels; i < n_levels; i++) {
      const placeTimeoutResult = await market.placeOrder({
        sender: bob,
        delegator: bobAddr,
        isBid: false,
        limitPrice: new DecimalUnits(0.01 * iter + i * 10 ** -4),
        quantity: new DecimalUnits(0.1),
        auxToBurn: new DecimalUnits(0),
        orderType: OrderType.LIMIT_ORDER,
        stpActionType: STPActionType.CANCEL_PASSIVE,
      });
      assert.ok(
        placeTimeoutResult.tx.success,
        `${placeTimeoutResult.tx.vm_status}`
      );
      lastTime = Number(placeTimeoutResult.tx.timestamp);
    }
    for (let i = 1; i <= n_cancels; i++) {
      for (let j = 0; j < n_orders; j++) {
        const placeOrderResult = await market.placeOrder({
          sender: bob,
          delegator: bobAddr,
          isBid: false,
          limitPrice: new DecimalUnits(0.01),
          quantity: new DecimalUnits(0.1),
          auxToBurn: new DecimalUnits(0),
          orderType: OrderType.LIMIT_ORDER,
          stpActionType: STPActionType.CANCEL_PASSIVE,
        });
        assert.ok(
          placeOrderResult.tx.success,
          `${placeOrderResult.tx.vm_status}`
        );
        //   confirm order was actually placed
        //   console.dir(placeTimeoutResult, { depth: null });
        console.log(placeOrderResult);
        assert.ok(placeOrderResult.payload[0]!.type === "OrderPlacedEvent");
        lastTime = Number(placeOrderResult.tx.timestamp);
      }
      const simResultNoTimeout = await market.placeOrder(
        {
          sender: alice,
          delegator: aliceAddr,
          isBid: true,
          limitPrice: new DecimalUnits(0.01),
          quantity: new DecimalUnits(100),
          auxToBurn: new DecimalUnits(0),
          orderType: OrderType.LIMIT_ORDER,
          stpActionType: STPActionType.CANCEL_PASSIVE,
        },
        { simulate: true }
      );
      console.log("simResultNoTimeout", simResultNoTimeout);
      assert.ok(simResultNoTimeout.tx.success, `${simResultNoTimeout.tx}`);
      // confirm order was actually placed
      assert.ok(simResultNoTimeout.payload[0]!.type === "OrderFillEvent");
      const withoutCancelGasAmount = Number(simResultNoTimeout.tx.gas_used);
      console.log(
        "place order no timeout",
        `Gas used: ${simResultNoTimeout.tx.gas_used}, gas price: ${simResultNoTimeout.tx.gas_unit_price}, timestamp: ${simResultNoTimeout.tx.timestamp}`
      );
      lastTime = Number(simResultNoTimeout.tx.timestamp);
      console.log(lastTime);
      const placeTimeoutResult = await market.placeOrder({
        sender: bob,
        delegator: bobAddr,
        isBid: false,
        limitPrice: new DecimalUnits(0.01),
        quantity: new DecimalUnits(0.1),
        auxToBurn: new DecimalUnits(0),
        orderType: OrderType.LIMIT_ORDER,
        stpActionType: STPActionType.CANCEL_PASSIVE,
        timeoutTimestamp: (lastTime + 2e6).toString(),
      });
      assert.ok(
        placeTimeoutResult.tx.success,
        `${placeTimeoutResult.tx.vm_status}`
      );
      //   confirm order was actually placed
      //   console.dir(placeTimeoutResult, { depth: null });
      console.log(placeTimeoutResult);
      assert.ok(placeTimeoutResult.payload[0]!.type === "OrderPlacedEvent");
      await new Promise((r) => setTimeout(r, 2000));
      const simResultWithTimeout = await market.placeOrder(
        {
          sender: alice,
          delegator: aliceAddr,
          isBid: true,
          limitPrice: new DecimalUnits(0.01),
          quantity: new DecimalUnits(100),
          auxToBurn: new DecimalUnits(0),
          orderType: OrderType.LIMIT_ORDER,
          stpActionType: STPActionType.CANCEL_PASSIVE,
        },
        { simulate: true }
      );
      assert.ok(
        simResultWithTimeout.tx.success,
        `${simResultWithTimeout.tx.vm_status}`
      );
      // confirm order was actually cancelled
      //   console.dir(simResultWithTimeout, { depth: null });
      console.log(simResultWithTimeout);
      assert.ok(
        simResultWithTimeout.payload.find((e) => {
          return e.type === "OrderCancelEvent";
        })
      );
      const withCancelGasAmount = Number(simResultWithTimeout.tx.gas_used);
      const res = {
        without_cancel_gas_amount: withoutCancelGasAmount,
        with_cancel_gas_used: simResultWithTimeout.tx.gas_used,
        with_cancel_gas_price: simResultWithTimeout.tx.gas_unit_price,
        n_levels: n_levels * iter,
        n_cancels: 1,
        n_orders: i * n_orders,
        cancel_gas: withCancelGasAmount - withoutCancelGasAmount,
      };
      await writeFileSync(
        join(__dirname, "output.json"),
        JSON.stringify(res) + ",",
        {
          flag: "a",
        }
      );
    }
  }
  await writeFileSync(join(__dirname, "output.json"), "]", {
    flag: "a",
  });
}

async function main() {
  await setup();
  await estimate(4, 5, 5, 3);
}

main();
