import * as assert from "assert";
import { describe, it } from "mocha";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { AU } from "../src/units";
import { getAliceBob, withdrawAll } from "./alice-and-bob";

const auxEnv = new AuxEnv();
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);

describe("Fake Coin tests", function () {
  this.timeout(30000);

  it("mint and check balance", async function () {
    await auxClient.getFakeCoinInfo(FakeCoin.USDC);

    const [alice, _] = await getAliceBob(auxClient);
    const aliceAddr = alice.address();

    await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, AU(100), {
      sender: alice,
    });
    const balance = await auxClient.getFakeCoinBalance(
      aliceAddr,
      FakeCoin.USDC
    );
    assert.equal("100", balance.toString());

    await withdrawAll(auxClient);
  });
});
