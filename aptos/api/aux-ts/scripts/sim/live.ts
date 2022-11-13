import WebSocket from "ws";

import { AptosAccount, HexString, Types } from "aptos";
import assert from "assert";
import _ from "lodash";
import { Market, Vault } from "../../src";
import { ConstantProductClient } from "../../src/pool/constant-product/client";
import type { SwapExactInInput } from "../../src/pool/constant-product/schema";
import { AuxClient } from "../../src/client";
import { OrderType } from "../../src/clob/core/mutation";
import { ALL_FAKE_COINS, ALL_FAKE_VOLATILES, FakeCoin } from "../../src/coin";
import { AuxEnv } from "../../src/env";
import { AU, DU } from "../../src/units";

const auxEnv = new AuxEnv();
if (auxEnv.faucetClient === undefined) {
  throw new Error("Cannot sim:live without a faucet.");
}
const auxClient = new AuxClient(
  auxEnv.aptosNetwork,
  auxEnv.aptosClient,
  auxEnv.faucetClient
);
const moduleAuthority = auxClient.moduleAuthority!;

interface Trader {
  ready: boolean;
  account: AptosAccount;
}

async function setupTraders(
  privateKeyHexs?: Types.HexEncodedBytes[],
  n?: number
): Promise<Trader[]> {
  await auxClient.fundAccount({
    account: moduleAuthority.address(),
    quantity: AU(1_000_000_000_000),
  });

  const vault = new Vault(auxClient);

  n = n ?? 20;
  const accounts =
    _.take(privateKeyHexs, n).map((privateKeyHex) =>
      AptosAccount.fromAptosAccountObject({ privateKeyHex })
    ) ?? _.range(n).map((_) => new AptosAccount());
  return Promise.all(accounts.map((account) => setupTrader(vault, account)));
}

async function setupTrader(
  vault: Vault,
  account: AptosAccount
): Promise<Trader> {
  auxClient.sender = account;
  await auxClient.faucetClient!.fundAccount(
    account.address(),
    1_000_000_000_000_000
  );
  await vault.createAuxAccount();
  await auxClient.registerAuxCoin();

  for (const coin of ALL_FAKE_COINS) {
    const coinType = auxClient.getWrappedFakeCoinType(coin);
    await auxClient.registerAndMintFakeCoin(
      coin,
      DU(4_000_000) // 4 million
    );
    await vault.deposit(account, coinType, DU(1_000_000));
    await vault.withdraw(account, coinType, DU(100_000));
  }
  return { ready: true, account };
}

async function mirrorCoinbase(
  traders: Trader[],
  pools: Record<string, ConstantProductClient>,
  markets: Record<string, Market>
) {
  await Promise.all(
    Object.values(pools).map((poolClient, i) =>
      poolClient.addExactLiquidity(
        {
          amountX: DU(1_000_000),
          amountY: DU(1_000_000),
        },
        { sender: traders[i]!.account }
      )
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
          maxGasAmount: AU(1_000_000),
        }).then(
          (txResult) => {
            trader.ready = true;
            if (!txResult.transaction.success) {
              console.log(
                `[${data.product_id}] ${trader.account
                  .address()
                  .hex()}: placed order: ${
                  txResult.transaction.hash
                }: vm_status: ${txResult.transaction.vm_status}`
              );
            }
          },
          (failure) => console.error(failure)
        );
      } else if (data.type === "match") {
        const [x, y] = data.product_id.split("-");
        trader.ready = false;
        const poolClient = pools[data.product_id]!;
        if (data.side === "buy") {
          const swap: SwapExactInInput = {
            coinTypeIn: poolClient.coinTypeX,
            exactAmountIn: DU(data.size),
            parameters: {
              minAmountOut: DU(0),
            },
          };
          poolClient.swap(swap, { sender: trader.account }).then(
            (txResult) => {
              trader.ready = true;
              if (!txResult.transaction.success) {
                console.log(
                  `[${data.product_id}] ${trader.account
                    .address()
                    .hex()}: swapped ${x} for ${y}: ${
                    txResult.transaction.hash
                  }: vm_status: ${txResult.transaction.vm_status}`
                );
              }
            },
            (failure) => console.error(failure)
          );
        } else {
          const swap: SwapExactInInput = {
            coinTypeIn: poolClient.coinTypeY,
            exactAmountIn: DU(data.price * data.size),
            parameters: { minAmountOut: DU(0) },
          };
          poolClient.swap(swap, { sender: trader.account }).then(
            (txResult) => {
              trader.ready = true;
              if (!txResult.transaction.success) {
                console.log(
                  `[${data.product_id}] ${trader.account
                    .address()
                    .hex()}: swapped ${y} for ${x}: ${
                    txResult.transaction.hash
                  }: vm_status: ${txResult.transaction.vm_status}`
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

async function logPool(productId: string, poolClient: ConstantProductClient) {
  const pool = await poolClient.query();
  console.log({
    productId,
    amountX: pool.amountX.toNumber(),
    amountY: pool.amountY.toNumber(),
    amountLP: pool.amountLP.toNumber(),
  });
  setTimeout(() => logPool(productId, poolClient), 10000);
}

async function logMarket(productId: string, market: Market) {
  const m: Market = await Market.read(auxClient, {
    baseCoinType: market.baseCoinInfo.coinType,
    quoteCoinType: market.quoteCoinInfo.coinType,
  });
  const l2 = {
    bids: m.l2.bids
      .map((l2) => [l2.price.toNumber(), l2.quantity.toNumber()])
      // .reverse()
      // .filter(([price, _]) => price! > 1300 && price! < 1400)
      .slice(0, 5),
    asks: m.l2.asks
      .map((l2) => [l2.price.toNumber(), l2.quantity.toNumber()])
      // .reverse()
      // .filter(([price, _]) => price! > 1300 && price! < 1400)
      .slice(0, 5),
  };
  console.log({
    productId,
    numBids: m.l2.bids.length,
    numAsks: m.l2.asks.length,
    bids: l2.bids,
    asks: l2.asks,
  });
  setTimeout(() => logMarket(productId, m), 10000);
}

async function main() {
  assert(process.env["APTOS_NETWORK"] !== "mainnet");
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

  const traders = await setupTraders(privateKeyHexs, 10);
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
    // "BTC-USD": FakeCoin.BTC,
    "ETH-USD": FakeCoin.ETH,
    // "SOL-USD": FakeCoin.SOL,
    // "APT-USD": FakeCoin.AUX,
  };

  const pools: Record<string, ConstantProductClient> = Object.fromEntries(
    Object.entries(convert).map(([productId, fakeCoin]) => {
      const coinTypeX = auxClient.getWrappedFakeCoinType(fakeCoin);
      const coinTypeY = auxClient.getWrappedFakeCoinType(FakeCoin.USDC);
      const poolClient = new ConstantProductClient(auxClient, { coinTypeX, coinTypeY });
      return [productId, poolClient];
    })
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
