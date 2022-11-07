import { AptosAccount } from "aptos";
import { describe, it } from "mocha";
import { AuxClient } from "../src/client";
import { AuxEnv } from "../src/env";
import { AU } from "../src/units";
import Vault from "../src/vault/dsl/vault";

const auxClient = new AuxClient("local", new AuxEnv().aptosClient);
const moduleAuthority = auxClient.moduleAuthority!;

const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
const aptosCoin = "0x1::aptos_coin::AptosCoin";

describe("ACCOUNT DSL tests", function () {
  this.timeout(30000);

  const alice: AptosAccount = new AptosAccount();
  const bob: AptosAccount = new AptosAccount();
  const aliceAddr = alice.address().toString();
  const bobAddr = bob.address().toString();

  it.skip("account should summarize a user's activity", async function () {
    console.log("\n=== Addresses ===");
    console.log(`Alice: ${alice.address()}`);
    console.log(`Bob: ${bob.address()}`);

    let hash = await auxClient.fundAccount({
      account: alice.address(),
      quantity: AU(500_000),
    });
    console.log("fund alice account hash", hash);
    hash = await auxClient.fundAccount({
      account: bob.address(),
      quantity: AU(500_000),
    });
    console.log("fund bob account hash", hash);

    await Promise.all([
      await auxClient.registerAuxCoin({ sender: alice }),
      await auxClient.registerAuxCoin({ sender: bob }),
    ]);
    await Promise.all([
      await auxClient.mintAux(aliceAddr, AU(100_000_000), {
        sender: moduleAuthority,
      }),
      await auxClient.mintAux(bobAddr, AU(100_000_000), {
        sender: moduleAuthority,
      }),
    ]);

    const vault = new Vault(auxClient);

    await vault.createAuxAccount({ sender: alice });
    await vault.createAuxAccount({ sender: bob });
    await vault.deposit(alice, aptosCoin, AU(42));
    await vault.deposit(alice, auxCoin, AU(42));
    await vault.deposit(bob, aptosCoin, AU(42));
    await vault.deposit(bob, auxCoin, AU(42));
  });
});
