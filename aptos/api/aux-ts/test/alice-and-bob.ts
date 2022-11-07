import { AptosAccount, HexString } from "aptos";
import * as assert from "assert";
import { Vault } from "../src";
import type { AuxClient } from "../src/client";
import { ALL_FAKE_COINS, FakeCoin } from "../src/coin";
import { getAptosProfile } from "../src/env";
import { AU } from "../src/units";

async function getUser(
  name: string,
  auxClient: AuxClient
): Promise<AptosAccount> {
  let userProfile;
  try {
    userProfile = getAptosProfile(name);
  } catch {}
  let user = new AptosAccount();
  if (userProfile !== undefined) {
    user = AptosAccount.fromAptosAccountObject({
      privateKeyHex: userProfile.private_key!,
    });
  } else {
    auxClient.sender = user;
    await auxClient.fundAccount({
      account: user.address(),
      quantity: AU(1_000_000_000),
    });
    let privateKey = HexString.fromUint8Array(user.signingKey.secretKey);
    console.log(`
    ${name}:
        private_key: "0x${privateKey}"
        public_key: "0x${user.pubKey()}"
        account: ${user.address()}
`);
  }

  return user;
}

async function fundFakeCoin(auxClient: AuxClient, user: AptosAccount) {
  let tx = await auxClient.registerAndMintFakeCoin(
    FakeCoin.BTC,
    AU(5_000_000_000),
    {
      sender: user,
    }
  );

  assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);

  tx = await auxClient.registerAndMintFakeCoin(
    FakeCoin.SOL,
    AU(5_000_000_000_000),
    {
      sender: user,
    }
  );
  assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);

  tx = await auxClient.registerAndMintFakeCoin(
    FakeCoin.AUX,
    AU(100_000_000_000),
    {
      sender: user,
    }
  );

  assert.ok(tx.success, `${JSON.stringify(tx, undefined, "  ")}`);
}

let is_init = false;
let alice: AptosAccount;
let bob: AptosAccount;

export async function getAliceBob(
  auxClient: AuxClient
): Promise<[AptosAccount, AptosAccount]> {
  if (!is_init) {
    alice = await getUser(`alice-${process.env["APTOS_PROFILE"]}`, auxClient);
    bob = await getUser(`bob-${process.env["APTOS_PROFILE"]}`, auxClient);
    is_init = true;
  }
  await fundFakeCoin(auxClient, alice);
  await fundFakeCoin(auxClient, bob);
  return [alice, bob];
}

export async function withrawAndBurn(auxClient: AuxClient, user: AptosAccount) {
  let vault = new Vault(auxClient);
  for (const { coin, coinType } of allCoins) {
    const maybeWithdraw = await vault.withdrawAll(user, coinType);
    if (maybeWithdraw !== undefined) {
      assert.ok(
        maybeWithdraw.success,
        `failed to withdraw all balance for ${user.address().toString()}: ${
          maybeWithdraw.vm_status
        }`
      );
    }

    const maybeBurn = await auxClient.burnAllFakeCoin(coin, { sender: user });
    if (maybeBurn !== undefined) {
      assert.ok(
        maybeBurn.success,
        `failed to withdraw all balance for ${user.address().toString()}: ${
          maybeBurn.vm_status
        }`
      );
    }
  }
}

let allCoins: { coin: FakeCoin; coinType: string }[] = [];

export async function withdrawAll(auxClient: AuxClient) {
  if (allCoins.length == 0) {
    for (const coin of ALL_FAKE_COINS) {
      let coinType = auxClient.getWrappedFakeCoinType(coin);
      allCoins.push({ coin, coinType });
    }
  }
  await getAliceBob(auxClient);
  // withdrawal all the money, so core test can run successfully.
  await withrawAndBurn(auxClient, alice);
  await withrawAndBurn(auxClient, bob);
}
