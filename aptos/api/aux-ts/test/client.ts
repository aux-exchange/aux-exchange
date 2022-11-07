import { FailedTransactionError } from "aptos";
import * as assert from "assert";
import { describe, it } from "mocha";
import { AuxClient } from "../src/client";
import { AuxEnv } from "../src/env";

const auxClient = new AuxClient("local", new AuxEnv().aptosClient);
const moduleAuthority = auxClient.moduleAuthority!;

describe("AUX Client tests", function () {
  this.timeout(30000);

  it("propagate errors", async function () {
    assert.rejects(async () => {
      await auxClient.registerAuxCoin({ sender: moduleAuthority });
      // coin already registered
      await auxClient.registerAuxCoin({
        sender: moduleAuthority,
        checkSuccess: true,
      });
    }, FailedTransactionError);
  });
});
