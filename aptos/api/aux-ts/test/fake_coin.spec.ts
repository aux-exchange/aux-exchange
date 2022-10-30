import * as assert from "assert";
import { describe, it } from "mocha";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { env } from "../src/env";
import { AU } from "../src/units";
import { getAliceBob, withdrawAll } from "./alice_and_bob";

const auxClient = new AuxClient("localnet", env().aptosClient);

describe("Fake Coin tests", function () {
  this.timeout(30000);

  it("mint and check balance", async function () {
    await auxClient.getFakeCoinInfo(FakeCoin.USDC);

    const [alice, _] = await getAliceBob(auxClient);
    const aliceAddr = alice.address();

    await auxClient.registerAndMintFakeCoin({
      sender: alice,
      coin: FakeCoin.USDC,
      amount: AU(100),
    });
    const balance = await auxClient.getFakeCoinBalance(
      aliceAddr,
      FakeCoin.USDC
    );
    assert.equal("100", balance.toString());

    await withdrawAll(auxClient);
  });
});
