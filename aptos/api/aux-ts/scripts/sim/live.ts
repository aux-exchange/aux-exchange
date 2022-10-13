import WebSocket from "ws";

import { AptosAccount, HexString } from "aptos";
import { Market, Pool, Vault } from "../../src";
import {
  ALL_FAKE_COINS,
  ALL_FAKE_VOLATILES,
  AuxClient,
  FakeCoin,
} from "../../src/client";
import { OrderType } from "../../src/clob/core/mutation";
import { AU, DU } from "../../src/units";
import _ from "lodash";

const [auxClient, moduleAuthority] = AuxClient.createFromEnvForTesting({});

interface Trader {
  ready: boolean;
  account: AptosAccount;
}

async function setupTraders(n: number): Promise<Trader[]> {
  await auxClient.airdropNativeCoin({
    account: moduleAuthority.address(),
    quantity: AU(1_000_000_000_000),
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

  for (const coin of ALL_FAKE_COINS) {
    const coinType = auxClient.getWrappedFakeCoinType(coin);
    await auxClient.registerAndMintFakeCoin({
      sender: trader,
      coin,
      amount: DU(4_000_000), // 4 million
    });
    await vault.deposit(trader, coinType, DU(1_000_000));
    await vault.withdraw(trader, coinType, DU(100_000));
  }
  return { ready: true, account: trader };
}

async function mirrorCoinbase(
  traders: Trader[],
  pools: Record<string, Pool>,
  markets: Record<string, Market>
) {
  await Promise.all(
    Object.values(pools).map((pool, i) =>
      pool.addExactLiquidity({
        sender: traders[i]!.account,
        amountX: DU(1_000_000),
        amountY: DU(1_000_000),
      })
    )
  );

  const feed = new WebSocket("wss://ws-feed.exchange.coinbase.com");
  feed.onopen = (_event) => {
    feed.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: Object.keys(markets),
        channels: ["full", "matches", "heartbeat"],
      })
    );
  };

  feed.onmessage = (event) => {
    const data = JSON.parse(event.data as string) as any;
    const trader = traders.find((trader) => trader.ready);
    if (trader !== undefined) {
      if (data.type === "received") {
        trader.ready = false;
        const order = {
          sender: trader.account,
          isBid: Math.random() >= 0.5,
          limitPrice: DU(Number(data.price).toFixed(2)),
          quantity: DU(Number(data.size).toFixed(2)),
          auxToBurn: AU(0),
          orderType: OrderType.LIMIT_ORDER,
        };
        markets[data.product_id]!.placeOrder(order, {
          maxGasAmount: AU(100_000),
        }).then(
          (txResult) => {
            trader.ready = true;
            if (!txResult.tx.success) {
              console.log(
                `[${data.product_id}] ${trader.account
                  .address()
                  .hex()}: placed order: ${txResult.tx.hash}: vm_status: ${
                  txResult.tx.vm_status
                }`
              );
            }
          },
          (failure) => console.error(failure)
        );
      } else if (data.type === "match") {
        const [x, y] = data.product_id.split("-");
        trader.ready = false;
        if (data.side === "buy") {
          const swap = {
            sender: trader.account,
            exactAmountIn: DU(data.size),
            minAmountOut: DU(0),
          };
          pools[data.product_id]!.swapXForY(swap).then(
            (txResult) => {
              trader.ready = true;
              if (!txResult.tx.success) {
                console.log(
                  `[${data.product_id}] ${trader.account
                    .address()
                    .hex()}: swapped ${x} for ${y}: ${
                    txResult.tx.hash
                  }: vm_status: ${txResult.tx.vm_status}`
                );
              }
            },
            (failure) => console.error(failure)
          );
        } else {
          const swap = {
            sender: trader.account,
            exactAmountIn: DU(data.price * data.size),
            minAmountOut: DU(0),
          };
          pools[data.product_id]!.swapYForX(swap).then(
            (txResult) => {
              trader.ready = true;
              if (!txResult.tx.success) {
                console.log(
                  `[${data.product_id}] ${trader.account
                    .address()
                    .hex()}: swapped ${y} for ${x}: ${
                    txResult.tx.hash
                  }: vm_status: ${txResult.tx.vm_status}`
                );
              }
            },
            (failure) => console.error(failure)
          );
        }
      } else if (data.reason === "canceled") {
        // commenting out querying open orders to cancel seems to put too much load on the web server
        // trader.ready = false;
        // market.openOrders(trader.account.address().toString()).then((orders) => {
        //   const orderId = orders[0]?.id?.toString();
        //   if (orderId !== undefined) {
        //     market.cancelOrder({ sender: trader.account, orderId }).then(
        //       (txResult) => {
        //         console.log("Canceled order", orderId);
        //         console.log("Tx success?", txResult.success);
        //       },
        //       (failure) => console.error(failure)
        //     );
        //   }
        // });
      }
    }
  };
}

async function simulateTransfers(traders: Trader[]): Promise<void> {
  await Promise.all(
    traders.map(async (trader) => {
      const from = trader.account;
      const to = _.sample(
        traders.filter((trader) => trader.account != from)
      )!.account;
      const coin = _.sample(ALL_FAKE_VOLATILES)!;
      const vault = new Vault(auxClient);
      const amount = _.sample(_.range(100))!;
      let tx = await vault.deposit(
        from,
        auxClient.getWrappedFakeCoinType(coin),
        DU(amount)
      );
      console.log(`Deposit ${tx.success} ${tx.hash}`);
      tx = await vault.withdraw(
        from,
        auxClient.getWrappedFakeCoinType(coin),
        DU(amount)
      );
      console.log(`Withdraw ${tx.success} ${tx.hash}`);
      tx = await vault.transfer(
        from,
        to.address().toString(),
        auxClient.getWrappedFakeCoinType(coin),
        DU(amount)
      );
      console.log(`Transfer ${tx.success} ${tx.hash}`);
      console.log("Finished simulating transfers");
    })
  );
}

function logTraders(traders: { address: string; privateKeyHex: string }[]) {
  console.log(traders);
  setTimeout(() => logTraders(traders), 10000);
}

async function logPool(productId: string, pool: Pool) {
  pool.update();
  console.log({
    productId,
    amountX: pool.amountX.toNumber(),
    amountY: pool.amountAuY.toNumber(),
    amountLP: pool.amountLP.toNumber(),
  });
  setTimeout(() => logPool(productId, pool), 10000);
}

async function logMarket(productId: string, market: Market) {
  const m = await Market.read(auxClient, {
    baseCoinType: market.baseCoinInfo.coinType,
    quoteCoinType: market.quoteCoinInfo.coinType,
  });
  const l2 = {
    bids: m.level2.bids
      .map((l2) => [l2.price.toNumber(), l2.quantity.toNumber()])
      // .reverse()
      // .filter(([price, _]) => price! > 1300 && price! < 1400)
      .slice(0, 5),
    asks: m.level2.asks
      .map((l2) => [l2.price.toNumber(), l2.quantity.toNumber()])
      // .reverse()
      // .filter(([price, _]) => price! > 1300 && price! < 1400)
      .slice(0, 5),
  };
  console.log({
    productId,
    numBids: m.level2.bids.length,
    numAsks: m.level2.asks.length,
    bids: l2.bids,
    asks: l2.asks,
  });
  setTimeout(() => logMarket(productId, m), 10000);
}

async function main() {
  const traders = await setupTraders(10);
  await simulateTransfers(traders);

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
  console.log("=== Traders ===");
  console.log(output);

  const convert = {
    "BTC-USD": FakeCoin.BTC,
    "ETH-USD": FakeCoin.ETH,
    // "SOL-USD": FakeCoin.SOL,
  };

  const pools: Record<string, Pool> = Object.fromEntries(
    await Promise.all(
      Object.entries(convert).map(([productId, fakeCoin]) =>
        Pool.read(auxClient, {
          coinTypeX: auxClient.getWrappedFakeCoinType(fakeCoin),
          coinTypeY: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
        }).then((pool) => [productId, pool])
      )
    )
  );
  const markets: Record<string, Market> = Object.fromEntries(
    await Promise.all(
      Object.entries(convert).map(([productId, fakeCoin]) =>
        Market.read(auxClient, {
          baseCoinType: auxClient.getWrappedFakeCoinType(fakeCoin),
          quoteCoinType: auxClient.getWrappedFakeCoinType(FakeCoin.USDC),
        }).then((market) => [productId, market])
      )
    )
  );

  mirrorCoinbase(traders, pools, markets);

  logTraders(output);
  Object.entries(pools).map(([productId, pool]) => logPool(productId, pool));
  Object.entries(markets).map(([productId, market]) =>
    logMarket(productId, market)
  );
}

main().then(() => {});
