import { AptosAccount, HexString } from "aptos";
import { Market, Pool, Vault } from "../src";
import { ALL_FAKE_VOLATILES, AuxClient, FakeCoin } from "../src/client";
import { AU, DU } from "../src";
import { OrderType } from "../src/clob/core/mutation";

const [auxClient, moduleAuthority] = AuxClient.createFromEnvForTesting({});

interface Trader {
  ready: boolean;
  account: AptosAccount;
}

async function setupTraders(n: number): Promise<Trader[]> {
  await auxClient.airdropNativeCoin({
    account: moduleAuthority.address(),
    quantity: AU(1_000_000_000_000_000),
  });

  const vault = new Vault(auxClient);

  return Promise.all([...Array(n).keys()].map((_) => setupTrader(vault)));
}

async function setupTrader(vault: Vault): Promise<Trader> {
  const trader = new AptosAccount();
  await auxClient.faucetClient!.fundAccount(
    trader.address(),
    1_000_000_000_000_000
  );
  await vault.createAuxAccount(trader);
  await auxClient.registerAuxCoin(moduleAuthority);

  const pools = await Promise.all(
    ALL_FAKE_VOLATILES.map((fakeCoin) =>
      Pool.read(auxClient, {
        coinTypeX: auxClient.getWrappedFakeCoinType(fakeCoin),
        coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
      })
    )
  );
  const coinToPool = Object.fromEntries(
    pools.map((pool) => [pool!.coinInfoX.coinType, pool!])
  );

  const markets = await Promise.all(
    ALL_FAKE_VOLATILES.map((fakeCoin) =>
      Market.read(auxClient, {
        baseCoinType: auxClient.getWrappedFakeCoinType(fakeCoin),
        quoteCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
      })
    )
  );
  const coinToMarket = Object.fromEntries(
    markets.map((market) => [market!.baseCoinInfo.coinType, market!])
  );

  const prices: Record<FakeCoin, number> = {
    [FakeCoin.BTC]: 20065.65,
    [FakeCoin.ETH]: 1362.49,
    [FakeCoin.SOL]: 33.87,
    [FakeCoin.AUX]: 0.79,
    [FakeCoin.USDT]: 1,
    [FakeCoin.USDC]: 1,
  };

  for (const coin of ALL_FAKE_VOLATILES) {
    const coinType = auxClient.getWrappedFakeCoinType(coin);
    let tx = await auxClient.registerAndMintFakeCoin({
      sender: trader,
      coin,
      amount: DU(4_000_000_000), // 4 billion
    });
    console.log("mint tx", coin, tx.hash, tx.success);
    tx = await vault.deposit(trader, coinType, DU(1_000_000_000));
    console.log("vault tx", coin, tx.hash, tx.success);

    const addLiquidityTx = await coinToPool[coin]!.addExactLiquidity({
      sender: trader,
      amountX: DU(1_000_000_000),
      amountY: DU(1_000_000_000),
    });
    console.log(
      "addExactLiquidity tx",
      coin,
      addLiquidityTx.tx.hash,
      addLiquidityTx.tx.success
    );

    const order = {
      sender: trader,
      isBid: true,
      limitPrice: DU(prices[coin]),
      quantity: DU(1),
      auxToBurn: AU(0),
      orderType: OrderType.LIMIT_ORDER,
    };
    const placeOrderTx = await coinToMarket[coin]!.placeOrder(order);
    console.log(
      "placeOrder tx",
      coin,
      placeOrderTx.tx.hash,
      placeOrderTx.tx.success
    );
  }
  return { ready: true, account: trader };
}

async function main() {
  const traders = await setupTraders(5);
  const output = traders.map((trader) => {
    const address = trader.account.address().hex();
    const privateKeyHex = HexString.fromUint8Array(
      trader.account.signingKey.secretKey
    ).hex();
    return {
      address,
      privateKeyHex,
    };
  });
  console.log(output);
}

main();
