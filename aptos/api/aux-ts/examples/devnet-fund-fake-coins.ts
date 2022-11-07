import { AptosAccount, AptosClient, FaucetClient } from "aptos";
import { AU, DU } from "../src";
import { AuxClient } from "../src/client";
import { FakeCoin } from "../src/coin";
import { getAptosProfile } from "../src/env";

// While you can technically connect directly to the Aptos Full Node, we strongly recommend
// running your own Full Node.
//
// e.g.
// const auxClient = new AuxClient("devnet", new AptosClient("http://localhost:8080"));
const auxClient = new AuxClient(
  "devnet",
  new AptosClient("https://fullnode.devnet.aptoslabs.com/v1"),
  new FaucetClient(
    "https://fullnode.devnet.aptoslabs.com/v1",
    "https://faucet.devnet.aptoslabs.com"
  )
);

// Get the account that has authority over the module from local profile
// This is also the account that deployed the Aux program
const privateKeyHex = getAptosProfile("default")?.private_key!;
const trader: AptosAccount = AptosAccount.fromAptosAccountObject({
  privateKeyHex,
});

// We fund trader and module authority with Aptos, BTC, and USDC coins
async function setupTrader(): Promise<void> {
  await auxClient.fundAccount({
    account: trader.address(),
    quantity: AU(500_000_000),
  });

  // We're rich! Use canonical fake types for trading. Fake coins can be freely
  // minted by anybody. All AUX test markets use these canonical fake coins.
  await auxClient.registerAndMintFakeCoin(FakeCoin.BTC, DU(1000), {
    sender: trader,
  });

  await auxClient.registerAndMintFakeCoin(FakeCoin.USDC, DU(1_000_000), {
    sender: trader,
  });
}

async function main() {
  await setupTrader();
}

main().then(() => {});
