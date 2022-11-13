import { AptosAccount } from "aptos";
import { DU } from "../src";
import { ConstantProductClient } from "../src/pool/constant-product/client";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { AuxEnv } from "../src/env";

async function main() {
  const auxEnv = new AuxEnv();
  const auxClient = new AuxClient(
    auxEnv.aptosNetwork,
    auxEnv.aptosClient,
    auxEnv.faucetClient
  );
  const sender = auxClient.moduleAuthority!;
  // const sender = AptosAccount.fromAptosAccountObject({
  //   privateKeyHex:
  //     "0x4df3a75ebb6697e5fa79e2e3649b62026423698f44b7e50c703648b2af4cd882",
  // });
  AptosAccount
  auxClient.sender = sender;

  const auxCoin = `${auxClient.moduleAddress}::aux_coin::AuxCoin`;
  const btcCoin = auxClient.getWrappedFakeCoinType(FakeCoin.BTC);
  const poolClient = new ConstantProductClient(auxClient, {
    coinTypeX: auxCoin,
    coinTypeY: btcCoin,
  });
  console.log(await poolClient.query());
  const position = await poolClient.position(sender.address().toString());
  console.log(position);

  // await poolClient.removeLiquidity({ amountLP: position!.amountLP });
  DU;
  await poolClient.drain();
  console.log((await poolClient.query()).amountLP);
}

main();
