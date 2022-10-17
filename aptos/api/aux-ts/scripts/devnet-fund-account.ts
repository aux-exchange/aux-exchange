import { AptosAccount } from "aptos";
import fs from "fs";
import * as readline from "node:readline";
import { Market, Pool, Vault } from "../../src";
import { AuxClient, FakeCoin, NATIVE_APTOS_COIN, Network } from "../../src/client";
import { OrderType } from "../../src/clob/core/mutation";
import { AU, DU } from "../../src/units";

const auxClient = AuxClient.create({network: Network.Devnet});
const moduleAuthority = new AptosAccount();

async function fundAccount(
  privateKeyHex?: string
): Promise<void> {
  const trader = privateKeyHex
    ? AptosAccount.fromAptosAccountObject({ privateKeyHex })
    : new AptosAccount();
  await auxClient.faucetClient!.fundAccount(trader.address(), 1_000_000_000);
  Vault.
  await vault.createAuxAccount(trader);
  await auxClient.registerAuxCoin(moduleAuthority);

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
    await auxClient.registerAndMintFakeCoin({
      sender: trader,
      coin,
      amount: DU(4_000_000_000), // 4 billion
    });
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
        coinType: NATIVE_APTOS_COIN,
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
        maxGasAmount: AU(100_000),
      });
      trader.ready = true;

      if (!txResult.tx.success || total == 859) {
        console.log(
          `${trader.account.address().hex()}: placed order: ${
            txResult.tx.hash
          }, based on line: ${line} at total lines ${total}, vm_status: ${
            txResult.tx.vm_status
          }`
        );
        fs.mkdirSync(`scripts/sim/txes`, { recursive: true });
        fs.writeFileSync(
          `scripts/sim/txes/${txResult.tx.hash}.json`,
          JSON.stringify(txResult, undefined, "  ")
        );
      }
    }
  }

  await printTraderBalance(traders);
}

async function main() {
  const auxClient = AuxClient.create({
    network: Network.Devnet,
  });
  const account = AptosAccount.fromAptosAccountObject({
    privateKeyHex: "PETRAPRIVATEKEY"
  })
  auxClient.faucetClient?.fundAccount(account.address());

  await auxClient.registerAndMintFakeCoin({
    sender: account,
    coin: FakeCoin.BTC,
    amount: DU(1000),
  });

  await auxClient.registerAndMintFakeCoin({
    sender: account,
    coin: FakeCoin.USDC,
    amount: DU(1_000_000),
  });




  setupTraders;
  replay;

  const pool = await Pool.read(auxClient, {
    coinTypeX: auxClient.getWrappedFakeCoinType(FakeCoin.ETH),
    coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
  });
  await pool!.addExactLiquidity({
    sender: AptosAccount.fromAptosAccountObject({
      privateKeyHex:
        "0xd03cd0257d8ef83bebc3942267f09a5d634314c52d4bad9bda77d6df5444e3b1",
    }),
    amountX: DU(10),
    amountY: DU(13000),
  });
  // let traders = await setupTraders(5);
  // await replay(
  //   traders,
  //   "scripts/sim/replay.json",
  //   200,
  //   auxClient.getWrappedFakeCoinType(FakeCoin.ETH)
  // );
  // await replay(
  //   traders,
  //   "scripts/sim/replay-btc.json",
  //   200,
  //   auxClient.getWrappedFakeCoinType(FakeCoin.BTC)
  // );
  // await replay(
  //   traders,
  //   "scripts/sim/replay-sol.json",
  //   200,
  //   auxClient.getWrappedFakeCoinType(FakeCoin.SOL)
  // );
}

main().then(() => {});
