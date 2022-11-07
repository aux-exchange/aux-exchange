import type { AptosAccount } from "aptos";
import { describe, it } from "mocha";
import { FakeCoin } from "../src/coin";
import { AuxClient } from "../src/client";
import { OrderType, STPActionType } from "../src/clob/core/mutation";
import Market from "../src/clob/dsl/market";
import MarketSubscriber from "../src/subscriber";
import { AtomicUnits, AU, DecimalUnits, DU } from "../src/units";
import Vault from "../src/vault/dsl/vault";
import { getAliceBob, withdrawAll } from "./alice-and-bob";
import { AuxEnv } from "../src/env";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);
const moduleAuthority = auxClient.moduleAuthority!;

const auxCoin = auxClient.getWrappedFakeCoinType(FakeCoin.AUX);
const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);

const baseCoin = auxCoin;
const quoteCoin = btcCoin;

let alice: AptosAccount;
let bob: AptosAccount;
let aliceAddr: string;
let bobAddr: string;

describe("Subscriber DSL tests", function () {
  this.timeout(30000);

  it("subscribes to Market events", async function () {
    [alice, bob] = await getAliceBob(auxClient);
    aliceAddr = alice.address().toString();
    bobAddr = bob.address().toString();
    await Promise.all([
      auxClient.registerAuxCoin({ sender: alice }),
      auxClient.registerAuxCoin({ sender: bob }),
    ]);

    await auxClient.mintAux(aliceAddr, AU(100_000_000), {
      sender: moduleAuthority,
    });
    await auxClient.mintAux(bobAddr, AU(100_000_000), {
      sender: moduleAuthority,
    });

    const vault = new Vault(auxClient);
    await Promise.all([
      vault.createAuxAccount({ sender: alice }),
      vault.createAuxAccount({ sender: bob }),
    ]);
    await Promise.all([
      vault.deposit(alice, quoteCoin, DU(0.004)),
      vault.deposit(bob, baseCoin, DU(50)),
    ]);

    const market = await Market.create(auxClient, {
      sender: moduleAuthority,
      baseCoinType: baseCoin,
      quoteCoinType: quoteCoin,
      baseLotSize: new AtomicUnits(1000),
      quoteLotSize: new AtomicUnits(1000),
    });

    const marketSubscriber = new MarketSubscriber(market);
    const subscriber = marketSubscriber.onOrder((order, _market) =>
      console.log("<Subscriber>: received new order!", order)
    );

    await market.placeOrder({
      sender: alice,
      delegator: aliceAddr,
      isBid: true,
      limitPrice: new DecimalUnits(0.001),
      quantity: new DecimalUnits(2),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });

    await market.placeOrder({
      sender: bob,
      delegator: bobAddr,
      isBid: false,
      limitPrice: new DecimalUnits(0.001),
      quantity: new DecimalUnits(1),
      auxToBurn: new DecimalUnits(0),
      orderType: OrderType.LIMIT_ORDER,
      stpActionType: STPActionType.CANCEL_PASSIVE,
    });
    marketSubscriber.kill();
    await subscriber;
    await market.cancelAll(bob);
    await market.cancelAll(alice);
  });

  it("withdraw", async function () {
    await withdrawAll(auxClient);
  });
});
