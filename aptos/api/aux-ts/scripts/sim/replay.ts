import { AptosAccount } from "aptos";
import fs from "fs";
import * as readline from "node:readline";
import { Market, Vault } from "../../src";
import { AuxClient } from "../../src/client";
import { OrderType } from "../../src/clob/core/mutation";
import { APTOS_COIN_TYPE, FakeCoin } from "../../src/coin";
import { AuxEnv } from "../../src/env";
import { AU, DU } from "../../src/units";

const auxEnv = new AuxEnv();
if (auxEnv.faucetClient === undefined) {
  throw new Error("Cannot sim:live without a faucet.")
}
const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient, auxEnv.faucetClient);

const privateKeyHexs: string[] = [
  "0x2b248dee740ee1e8d271afb89590554cd9655ee9fae8a0ec616b95911834eb49", // mnemoic: observe stairs visual bracket sick clog sport erode domain concert ecology strike, address: 0x767b7442b8547fa5cf50989b9b761760ca6687b83d1c23d3589a5ac8acb50639
  "0xe2326b7116633f8cb150e7ad56affd631e20789440317c47721862a62bcf362e", // mnemoic: rack ahead main cabin damp elephant script border rhythm sustain evil ivory, address: 0x574f99ff4a373ce168ea203f10b2bf815564fac19f516077f7c19b6e2b4322d0
  "0x1694f58f05205a0a77b442f71b4b50265dbce8e2db995b9deef1f1f21695aa71", // mnemoic: apart canvas monitor nephew certain oxygen happy answer element oven cup ladder, address: 0x4be70160747088bc530edaaf3dcbfae41b0cfe1b575ef157f6c61bd3a2bb3810
  "0x32daae38ec9a3f9dfe7e282f8cf115d3409724b724e6670ec568c9fa25f4349d", // mnemoic: degree rebuild door infant visa piece mesh vintage farm dish series twice, address: 0xdb80682ae4081ac4d352f9b1f7f035c60c965eb72f661d0437c153e905606486
  "0xa9d868a10d746286e1c6efeccc93d803cf3007b073d328d2298c4980393b1c67", // mnemoic: industry endless monkey jeans sustain rubber funny negative mountain bamboo boring bean, address: 0xfc2d52dc5652eadf87edefd1ea3507bb6e391c03ab86293610fcd965aaac1e28
  "0xdbe7699634d2c5b20047dceb1207188e973aeba929bb2ee17b2038e4653a9786", // mnemoic: leaf chapter close drum fortune section wink ranch stereo smart pulse section, address: 0x33f33c44a93759be84896d8773e069b3373d1057e5dc7e2b60f69c13086dfc30
  // we only use 5 traders for now.
  "0x714bb709740ba3360dc17f59cc78e9961837fcf6a3f429ce6cb70a328cfc5de9", // mnemoic: note parent fun wasp universe lunar undo pyramid theme mirror hurdle situate, address: 0xf73cd425efa20fb23aa3560754618ca318083189b8a26796808068240832c414
  "0xb634beeb1967b9ca58011b61fcd85b10b272f2f3c5fa5d51a6981ef43defd683", // mnemoic: gym pigeon bullet sock arctic shove marble high accuse comfort ready imitate, address: 0xcd64ffbe7c4a264aca39c951db57c3c465a3b1bd2b60506d09c7f6860b2592f6
  "0xbe47e80db44b541fbb2b652cb5dcd7f4c44ed956c34ecc368851f8da243e7daa", // mnemoic: net trumpet nest virus soldier decline hope spend lobster either toy mass, address: 0x5797dd0c5812cd64eb56c1d3b327c79264b2839bca01aeee639aecae0c812df3
  "0x760cc6f816a4601623d152cd66ef5e8d96f2eac46445bd7775398c7d1650dde1", // mnemoic: want upon tide reject avocado diesel symptom gentle raven spell puppy reveal, address: 0x1dec28209621795e9bff2f4dd09987c440fc8745f9a149f69c03ea75369de7a3
  "0x1f62cbd53634725f62cd27de59ab8867d9d3ad1c00aaf688012c526eea052e0a", // mnemoic: trumpet twice dolphin wall puzzle harsh fault carbon near stem table thunder, address: 0xbb849f5b4ad16e49121d5fcb28a8ec4ab321dbe3781549daa305607d36c84bfa
  "0x2ff3c931546b891411806735c35112aec37d47f174af4d59234571825fe88bcf", // mnemoic: yard clown nurse tray rug artwork media glow defy position mutual embrace, address: 0x81697ca0f8146e44f69a927eb994a25e0393aef745bebe8d5141c55f6664a940
  "0xd5b1864147c68d343719b0ef31e9af967fa2582e271ebf20df0923396532734c", // mnemoic: genre special time rally lawn acquire nuclear void explain tackle trophy coach, address: 0x69ec92c8f16505aad4b1896573ada9f50d3d2d9087dc227c576831eb93bd5f6e
  "0x8085ab7d18472a2327b3a8298c5d90f1a0d6b1b3dfd8b47bef552c9bfc98e925", // mnemoic: drift satoshi isolate believe lake foster couch hip upgrade embody food city, address: 0x5fd3e3cffd3d28cf3507578586a5326ebb8ff93094c0627713859b70c247331f
  "0x6a9988547cf07cdf94ef1939957843236f8e4b577ded45ffd75c76d59ffa4db3", // mnemoic: page grab property wisdom job search fan swear mail trouble secret beach, address: 0xdc1ded9704924348e77dc777b5c3659dd2648658df8b3f22a5c7196f20272e0e
  "0x1b9bc2f544eedebfbfd4fdd87a323498d687eb9ce90ba2900745dc1efaf212a6", // mnemoic: pattern kingdom hip actual play crater hawk milk similar example matrix brisk, address: 0x32b1745f4afe5eaaa9afcc88c84e39918a12079480f253d465df0cfd7e7b4c67
  "0x59b2c078d27537d85b1628e2d1c06232104d785d439dc455b869eac9c74d5cfa", // mnemoic: blanket property sweet current typical nature circle aerobic fruit inmate fury auto, address: 0x400df6437d905d31f669cf977717b851d1eaea7730e737be04947f0b21cc24a9
  "0x59854354fe770b713fb39aba5cc4a308c2998893a90b8f8304aeb2f77fcbe58b", // mnemoic: fabric census truly reopen awkward helmet split virtual square elegant toy bone, address: 0xf504f6cbf241b1057d651c200b4ad6e2e99e7a9b4f2d612dddf46a904ed61e9f
  "0xb2fb3ea53ee833a82aee320caeaf111db0c02eee26a356a7f53f49c38de99b76", // mnemoic: axis bench bunker please wave sword clog poverty trust cable fall music, address: 0x1aa084afaaf60c265ad5771815e2a72ba213db962034d26b3dd975351d05a41c
  "0xc3e93b39ee053ab6657da76abf850d341147c3bfea40b9f6c80a57d38bfde130", // mnemoic: detail kingdom cancel river cash once hello cabbage stay attack spoon cream, address: 0xe63b71ed258117e392db9321a43c4fe976b2d34359e3875ce42627e4632c0b5c
];

interface Trader {
  ready: boolean;
  account: AptosAccount;
}

async function setupTraders(
  n: number,
  alreadyDone: boolean
): Promise<Trader[]> {
  const vault = new Vault(auxClient);

  let trader: Trader[] = [];
  for (const privateKeyHex of privateKeyHexs.slice(0, n)) {
    trader.push(await setupTrader(vault, privateKeyHex, alreadyDone));
  }

  vault.transfer(
    trader[0]!.account,
    trader[1]!.account.address().toString(),
    auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
    DU(3_000)
  );
  return trader;
}

async function setupTrader(
  vault: Vault,
  privateKeyHex?: string,
  alreadyDone?: boolean
): Promise<Trader> {
  const trader = privateKeyHex
    ? AptosAccount.fromAptosAccountObject({ privateKeyHex })
    : new AptosAccount();
  if (alreadyDone) {
    return { ready: true, account: trader };
  }
  auxClient.sender = trader;
  await auxClient.faucetClient!.fundAccount(trader.address(), 1_000_000_000);
  await vault.createAuxAccount();

  console.log(`setting up ${trader.address().toString()}`);
  for (const coin of [
    FakeCoin.ETH,
    FakeCoin.USDC,
    FakeCoin.BTC,
    FakeCoin.SOL,
    FakeCoin.AUX,
    FakeCoin.USDT,
  ]) {
    const coinType = auxClient.getWrappedFakeCoinType(coin);
    await auxClient.registerAndMintFakeCoin(
      coin,
      DU(4_000_000_000), // 4 billion
    );
    await vault.deposit(trader, coinType, DU(2_000_000_000));
    await vault.withdraw(trader, coinType, DU(1_000_000_000));
  }
  console.log(`done setting up ${trader.address().toString()}`);
  return { ready: true, account: trader };
}

async function printTraderBalance(traders: Trader[]) {
  for (const trader of traders) {
    let balance = (
      await auxClient.getCoinBalance({
        account: trader.account.address(),
        coinType: APTOS_COIN_TYPE,
      })
    ).toString();
    console.log(
      `trader: ${trader.account.address().toString()} balance: ${balance}`
    );
  }
}
async function replay(
  traders: Trader[],
  replayFile: string,
  totalCount: number,
  baseCoinType: string
) {
  console.log(`START SIMULATION`);
  const market = await Market.read(auxClient, {
    baseCoinType,
    quoteCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
  });

  const rl = readline.createInterface({
    input: fs.createReadStream(replayFile),
    crlfDelay: Infinity,
  });
  let n = 0;
  let total = 0;
  await printTraderBalance(traders);
  for await (const line of rl) {
    if (total >= totalCount) {
      break;
    }
    total = total + 1;
    if (total % 100 == 0) {
      await printTraderBalance(traders);
      console.log(`processed ${total} lines at ${new Date().toISOString()}`);
    }

    const data = JSON.parse(line) as any;
    const trader = traders[n]!;
    n = n + 1;
    n = n % traders.length;
    if (data.type === "received") {
      trader.ready = false;
      const order = {
        sender: trader.account,
        isBid: data.side === "buy",
        limitPrice: DU(Number(data.price).toFixed(2)),
        quantity: DU(Number(data.size).toFixed(2)),
        auxToBurn: AU(0),
        orderType: OrderType.LIMIT_ORDER,
      };
      const txResult = await market.placeOrder(order, {
        sender: trader.account,
        maxGasAmount: AU(100_000),
      });
      trader.ready = true;

      if (!txResult.transaction.success || total == 859) {
        console.log(
          `${trader.account.address().hex()}: placed order: ${
            txResult.transaction.hash
          }, based on line: ${line} at total lines ${total}, vm_status: ${
            txResult.transaction.vm_status
          }`
        );
        fs.mkdirSync(`scripts/sim/txes`, { recursive: true });
        fs.writeFileSync(
          `scripts/sim/txes/${txResult.transaction.hash}.json`,
          JSON.stringify(txResult, undefined, "  ")
        );
      }
    }
  }

  await printTraderBalance(traders);
}

async function main() {
  let traders = await setupTraders(5, false);
  await replay(
    traders,
    "scripts/sim/replay.json",
    200,
    auxClient.getWrappedFakeCoinType(FakeCoin.ETH)
  );
  await replay(
    traders,
    "scripts/sim/replay-btc.json",
    200,
    auxClient.getWrappedFakeCoinType(FakeCoin.BTC)
  );
  await replay(
    traders,
    "scripts/sim/replay-sol.json",
    200,
    auxClient.getWrappedFakeCoinType(FakeCoin.SOL)
  );
}

main().then(() => {});
