/**
 * Example of interacting with AMM on mainnet.
 * yarn ts-node mainnet-amm-add-liquidity.ts
 */
import { AptosAccount } from "aptos";
import { assert } from "console";
import { DU, Pool } from "../src";
import { AuxClient, getAptosProfile } from "../src/client";

async function main() {
  const auxClient = new AuxClient("mainnet");
  const privateKeyHex = getAptosProfile("default")?.private_key!;
  const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
    privateKeyHex,
  });

  const APT = "0x1::aptos_coin::AptosCoin";
  const tAPT =
    "0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin";

  let maybePool = await Pool.read(auxClient, {
    coinTypeX: APT,
    coinTypeY: tAPT,
  });

  assert(
    maybePool !== undefined,
    "Pool should have been created during contract deployment."
  );
  const pool = maybePool as Pool;

  // Fetch current user positions in the pool.
  console.log(
    "pool.position:",
    await pool.position(trader.address().toShortString())
  );

  // Call update to refresh the internal variables.
  await pool.update();

  // Add some liquidity. This instruction may round the result in a way that is
  // unfavorable to me. Here we do not specify any limits on the rounding.
  const add = await pool.addApproximateLiquidity({
    sender: trader,
    maxX: DU(1000),
    maxY: DU(1000),
  });

  // The returned event includes information about the quantities actually added
  // and LP received.
  console.log("add.payload:", add.payload);
}

main();
