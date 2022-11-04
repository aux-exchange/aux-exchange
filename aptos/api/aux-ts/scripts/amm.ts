import { AptosClient } from "aptos";
import { Pool } from "../src";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";
import { getAliceBob } from "../test/alice-and-bob";

async function main() {
  const auxEnv = new AuxEnv();
  console.log(auxEnv);
  const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient);
  console.log(auxClient);
  const [alice, bob] = await getAliceBob(auxClient);
  console.log(alice)
  console.log(bob)
  alice
  bob
  // const auxClient = new AuxClient(
  //   "devnet",
  //   new AptosClient("http://100.110.50.17:8180")
  // );
  // const auxClient = new AuxClient(
  //   "mainnet",
  //   new AptosClient("http://100.110.50.17:8280")
  // );
  // const pool = await Pool.read(auxClient, {
  //   coinTypeX: auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
  //   coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
  // });
  const pool = await Pool.read(auxClient, {
    coinTypeX:
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
    coinTypeY:
      "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T",
  });
  console.log(pool);

  AptosClient;
  auxEnv;
  FakeCoin;
}

main();
