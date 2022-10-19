import { AptosAccount } from "aptos";
import { AU, DU } from "../src";
import { AuxClient, FakeCoin, getAptosProfile, Network } from "../src/client";

// While you can technically connect directly to Devnet, we strongly recommend
// running a full validator for RPCs.
// const auxClient = AuxClient.create(Network.Devnet);
const auxClient = AuxClient.create({
  network: Network.Devnet,
  // validatorAddress: "http://localhost:8080",
});

// Get the account that has authority over the module from local profile
// This is also the account that deployed the Aux program
const privateKeyHex = getAptosProfile("default")?.private_key!;
const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
  privateKeyHex,
});

// We fund trader and module authority with Aptos, BTC, and USDC coins
async function setupTrader(): Promise<void> {
  await auxClient.airdropNativeCoin({
    account: trader.address(),
    quantity: AU(500_000_000),
  });

  // We're rich! Use canonical fake types for trading. Fake coins can be freely
  // minted by anybody. All AUX test markets use these canonical fake coins.
  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.BTC,
    amount: DU(1000),
  });

  await auxClient.registerAndMintFakeCoin({
    sender: trader,
    coin: FakeCoin.USDC,
    amount: DU(1_000_000),
  });
}

async function main() {
  await setupTrader();
}

main().then(() => {});
