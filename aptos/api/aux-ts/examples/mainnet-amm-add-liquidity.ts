/**
 * Example of interacting with AMM on mainnet.
 * yarn ts-node mainnet-amm-add-liquidity.ts
 */
import { AptosAccount, AptosClient } from "aptos";
import { DU } from "../src";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import { AuxClient } from "../src/client";
import { getAptosProfile } from "../src/env";

const DEFAULT_MAINNET = "https://fullnode.mainnet.aptoslabs.com/v1";
const nodeUrl = process.env["APTOS_NODE"] ?? DEFAULT_MAINNET;

async function main() {
  const auxClient = new AuxClient("mainnet", new AptosClient(nodeUrl));
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });

  const APT = "0x1::aptos_coin::AptosCoin";
  const tAPT =
    "0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin";

  const poolClient = await new ConstantProductClient(auxClient, {
    coinTypeX: APT,
    coinTypeY: tAPT,
  });

  let pool;
  try {
    pool = await poolClient.query();
  } catch {
    throw new Error(
      "Pool should have been created during contract deployment."
    );
  }
  pool

  // Fetch current user positions in the pool.
  console.log(
    "pool.position:",
    await poolClient.position(trader.address().toShortString())
  );

  // Call update to refresh the internal variables.
  pool = await poolClient.query();

  // Add some liquidity. This instruction may round the result in a way that is
  // unfavorable to me. Here we do not specify any limits on the rounding.
  const add = await poolClient.addApproximateLiquidity({
    maxX: DU(1000),
    maxY: DU(1000),
  });

  // The returned event includes information about the quantities actually added
  // and LP received.
  console.log("add.result:", add.result);
}

main();
