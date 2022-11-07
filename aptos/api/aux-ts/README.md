# aux-ts

## Quickstart

```typescript
import { AptosClient, FaucetClient } from "aptos";
import { AuxClient } from "../src/client";
import { USDC_ETH_WH } from "../src/coin";

const auxClient = new AuxClient("mainnet", new AptosClient("https://fullnode.mainnet.aptoslabs.com"))

const poolClient = auxClient.pool({
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
});
let pool = poolClient.query();
await poolClient.swap({
    coinTypeIn: auxCoin,
    exactAmountIn: DU(2),
    parameters: { slippage: new Bps(50) },
});
pool = poolClient.query();
```


## Walkthrough

Let's breakdown the walkthrough above and showcase some additional features.

```typescript
import { AptosClient, FaucetClient } from "aptos";

const auxClient = new AuxClient("mainnet", new AptosClient("https://fullnode.devnet."))

// You can optionally attach a faucet client. We use devnet because there is no faucet on mainnet.
const auxClient = new AuxClient("devnet", new AptosClient("https://"))

// Initialize your account (only needed if sending txs).
const sender = AptosAccount.fromAptosAccountObject({privateKeyHex: "0xAUXUSER"})

// Set the sender for all future txs to this account. Note you can override this for individual txs
// by passing in `options` or you can set the sender to something else.
auxClient.sender = sender

// Simulate the transaction.
auxClient.simulate = true;

// Change the account you use to simulate transactions. Note, AUX has a default simulator on every
// network, but it will not have coin balances, etc. so you should set this to your own account.
auxClient.simulator = {
   address: "0xAUXSIMULATOR,
   publicKey: new TxnBuilderTypes.Ed25519PublicKey(new HexString("0x...").toUint8Array()) // Ed2551
}

// AuxClientOptions has additional options such as max gas, etc.

// Create a pool client
const poolClient = auxClient.pool({
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
});

// Alternatively
const poolClient = new PoolClient(auxClient, {
  coinTypeX: "0x1::aptos_coin::AptosCoin",
  coinTypeY: USDC_ETH_WH,
})
```
