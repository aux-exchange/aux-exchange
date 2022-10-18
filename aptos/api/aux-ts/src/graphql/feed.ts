import * as BN from "bn.js";
import * as aux from "..";
import { auxClient, pubsub } from "./connection";

export async function publishAmmEvents() {
  let swapSeqNum: BN = new BN.BN(0);
  let addLiquiditySeqNum: BN = new BN.BN(0);
  let removeLiquiditySeqNum: BN = new BN.BN(0);

  const poolReadParams = await aux.Pool.index(auxClient);
  const pools = await Promise.all(
    poolReadParams.map((poolReadParam) =>
      aux.Pool.read(auxClient, poolReadParam).then((pool) => pool!)
    )
  );
  while (true) {
    for (const pool of pools) {
      for (const swapEvent of await pool.swapEvents()) {
        if (swapSeqNum === swapEvent.sequenceNumber) {
          break;
        }
        await pubsub.publish("SWAP", {
          ...swapEvent,
          amountIn: swapEvent.in.toNumber(),
          amountOut: swapEvent.out.toNumber(),
        });
        swapSeqNum = swapEvent.sequenceNumber;
      }
      for (const addLiquidityEvent of await pool.addLiquidityEvents()) {
        if (addLiquiditySeqNum === addLiquidityEvent.sequenceNumber) {
          break;
        }
        await pubsub.publish("ADD_LIQUIDITY", {
          ...addLiquidityEvent,
          amountAddedX: addLiquidityEvent.xAdded.toNumber(),
          amountAddedY: addLiquidityEvent.yAdded.toNumber(),
          amountMintedLP: addLiquidityEvent.lpMinted.toNumber(),
        });
        addLiquiditySeqNum = addLiquidityEvent.sequenceNumber;
      }
      for (const removeLiquidityEvent of await pool.removeLiquidityEvents()) {
        if (removeLiquiditySeqNum === removeLiquidityEvent.sequenceNumber) {
          break;
        }
        await pubsub.publish("REMOVE_LIQUIDITY", {
          ...removeLiquidityEvent,
          amountRemovedX: removeLiquidityEvent.xRemoved.toNumber(),
          amountRemovedY: removeLiquidityEvent.yRemoved.toNumber(),
          amountBurnedLP: removeLiquidityEvent.lpBurned.toNumber(),
        });
        removeLiquiditySeqNum = removeLiquidityEvent.sequenceNumber;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export async function publishClobEvents() {
  let tradeSeqNum: BN = new BN.BN(0);

  const marketReadParams = await aux.Market.index(auxClient);
  const markets = await Promise.all(
    marketReadParams.map((marketReadParam) =>
      aux.Market.read(auxClient, marketReadParam).then((market) => market!)
    )
  );

  while (true) {
    for (const market of markets) {
      const baseCoinType = market.baseCoinInfo.coinType;
      const quoteCoinType = market.quoteCoinInfo.coinType;
      if (!baseCoinType.includes("BTC") && !baseCoinType.includes("ETH")) {
        continue;
      }
      if (!quoteCoinType.includes("USDC")) {
        continue;
      }
      const marketName = `${market.baseCoinInfo.symbol}/${market.quoteCoinInfo.symbol}`;

      await market.update();
      pubsub.publish("ORDERBOOK", {
        baseCoinType: market.baseCoinInfo.coinType,
        quoteCoinType: market.quoteCoinInfo.coinType,
        bids: market.l2.bids.map((level) => ({
          price: level.price.toNumber(),
          quantity: level.quantity.toNumber(),
        })),
        asks: market.l2.asks.map((level) => ({
          price: level.price.toNumber(),
          quantity: level.quantity.toNumber(),
        })),
      });

      let lastOrderFillEvent;
      for (const orderFillEvent of await market.fills()) {
        if (tradeSeqNum === orderFillEvent.sequenceNumber) {
          break;
        }
        const quantity = orderFillEvent.baseQuantity
          .toDecimalUnits(market.baseCoinInfo.decimals)
          .toNumber();
        const price = orderFillEvent.price
          .toDecimalUnits(market.quoteCoinInfo.decimals)
          .toNumber();
        const trade = {
          orderId: orderFillEvent.orderId,
          owner: orderFillEvent.owner,
          market: marketName,
          time: Math.floor(orderFillEvent.timestamp.toNumber()),
          quantity,
          price,
          value: quantity * price,
        };
        await pubsub.publish("TRADE", trade);
        tradeSeqNum = orderFillEvent.sequenceNumber;
        lastOrderFillEvent = orderFillEvent;
      }
      if (lastOrderFillEvent !== undefined) {
        await pubsub.publish("LAST_TRADE_PRICE", {
          baseCoinType: market.baseCoinInfo.coinType,
          quoteCoinType: market.quoteCoinInfo.coinType,
          price: lastOrderFillEvent.price
            .toDecimalUnits(market.quoteCoinInfo.decimals)
            .toNumber(),
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
