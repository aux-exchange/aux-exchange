import { mutation } from "../src/amm/core";
import Pool from "../src/amm/dsl/pool";
import { AuxClient } from "../src/client";
import { DecimalUnits } from "../src/units";

async function do_something() {
  const [auxClient, sender] = AuxClient.createFromEnvForTesting({});
  // auxClient
  // AptosAccount

  // const sender = AptosAccount.fromAptosAccountObject({
  //   privateKeyHex:
  //     "0x80e075a76146afeb2e177968b65fecc71bad64b1ea90a634f69ca810ca453528",
  // });

  const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
  const aptosCoin = "0x1::aptos_coin::AptosCoin";
  await mutation.createPool(auxClient, {
    sender,
    coinTypeX: auxCoin,
    coinTypeY: aptosCoin,
    feeBps: "0",
  });

  const maybePool = await Pool.read(auxClient, {
    coinTypeX: auxCoin,
    coinTypeY: aptosCoin,
  });
  let pool;
  if (maybePool == undefined) {
    pool = await Pool.create(auxClient, {
      sender,
      coinTypeX: auxCoin,
      coinTypeY: aptosCoin,
      feePct: 0,
    });
  } else {
    pool = maybePool;
  }
  pool.addExactLiquidity({
    sender,
    amountX: new DecimalUnits(0.000001),
    amountY: new DecimalUnits(0.0000001),
  });
}
do_something().then(() => {});
