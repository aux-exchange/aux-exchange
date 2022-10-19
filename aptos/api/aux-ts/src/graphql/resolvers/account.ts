import * as aux from "../../";
import { AU } from "../../";
import AuxAccount from "../../account";
import { parseTypeArgs } from "../../client";
import { auxClient } from "../connection";
import {
  Account,
  AccountIsCoinRegisteredArgs,
  AccountOpenOrdersArgs,
  AccountOrderHistoryArgs,
  AccountPoolPositionsArgs,
  AccountTradeHistoryArgs,
  Balance,
  Deposit,
  Order,
  OrderStatus,
  OrderType,
  Position,
  Side,
  Trade,
  Transfer,
  Withdrawal,
} from "../generated/types";

export const account = {
  async isCoinRegistered(
    parent: Account,
    { coinType }: AccountIsCoinRegisteredArgs
  ): Promise<boolean> {
    const coinStore = await auxClient.getAccountResourceOptional(
      parent.address,
      `0x1::coin::CoinStore<${coinType}>`
    );
    return coinStore !== undefined;
  },

  async walletBalances(parent: Account): Promise<Balance[]> {
    const resources = await auxClient.aptosClient.getAccountResources(
      parent.address
    );
    const coinStores = resources.filter(
      (resource) =>
        resource.type.includes("CoinStore<") && !resource.type.includes("LP")
    );
    return Promise.all(
      coinStores.map(async (coinStore) => {
        const coinType = parseTypeArgs(coinStore.type)[0]!;
        console.log(coinType);
        const coinInfo = await auxClient.getCoinInfo(coinType);
        // @ts-ignore
        const balance = AU(coinStore.data.coin.value)
          .toDecimalUnits(coinInfo.decimals)
          .toNumber();
        return {
          balance,
          availableBalance: balance,
          coinInfo,
        };
      })
    );
  },
  async balances(parent: Account): Promise<Balance[]> {
    const account = new AuxAccount(auxClient, parent.address);
    const balances = await account.balances();

    return await Promise.all(
      balances.balances.map(async (e) => {
        const [coinType] = parseTypeArgs(e.key.name);
        const coinInfo = await auxClient.getCoinInfo(coinType!);
        return {
          coinInfo,
          availableBalance: e.value.available_balance
            .toDecimalUnits(coinInfo.decimals)
            .toNumber(),
          balance: e.value.balance.toDecimalUnits(coinInfo.decimals).toNumber(),
        };
      })
    );
  },
  async deposits(parent: Account): Promise<Deposit[]> {
    const account = new AuxAccount(auxClient, parent.address);
    const deposits = await account.deposits();
    return deposits.map((deposit) => ({
      // @ts-ignore
      coinType: deposit.data.coinType,
      // @ts-ignore
      from: deposit.data.depositor,
      // @ts-ignore
      to: deposit.data.to,
      // @ts-ignore
      amount: deposit.data.amount.toNumber(),
    }));
  },
  async withdrawals(parent: Account): Promise<Withdrawal[]> {
    const account = new AuxAccount(auxClient, parent.address);
    const withdrawals = await account.withdrawals();
    // @ts-ignore
    return withdrawals.map((withdrawal) => ({
      // @ts-ignore
      coinType: withdrawal.data.coinType,
      // @ts-ignore
      from: withdrawal.data.owner,
      // @ts-ignore
      amount: withdrawal.data.amount.toNumber(),
    }));
  },
  async transfers(parent: Account): Promise<Transfer[]> {
    const account = new AuxAccount(auxClient, parent.address);
    const transfers = await account.transfers();
    return transfers.map((transfer) => ({
      // @ts-ignore
      coinType: transfer.data.coinType,
      // @ts-ignore
      from: transfer.data.from,
      // @ts-ignore
      to: transfer.data.to,
      // @ts-ignore
      amount: transfer.data.amount.toNumber(),
    }));
  },
  async poolPositions(
    parent: Account,
    args: AccountPoolPositionsArgs
  ): Promise<Position[]> {
    const poolInputs = args.poolInputs ?? (await aux.Pool.index(auxClient));
    const auxPositions = await Promise.all(
      poolInputs.map((poolInput) =>
        aux.amm.core.query.position(auxClient, parent.address, poolInput)
      )
    );
    return auxPositions
      .filter((auxPosition) => auxPosition !== undefined)
      .map((auxPosition) => {
        const pos = auxPosition!;
        return {
          ...pos,
          amountX: pos.amountX.toNumber(),
          amountY: pos.amountY.toNumber(),
          amountLP: pos.amountLP.toNumber(),
        };
      });
  },
  async openOrders(
    parent: Account,
    args: AccountOpenOrdersArgs
  ): Promise<Order[]> {
    AU;
    return this.orderHistory(parent, {
      marketInputs: args.marketInputs ?? null,
    });
    // const marketInputs =
    //   args.marketInputs ?? (await aux.Market.index(auxClient));
    // const account = new aux.Account(auxClient, parent.address);
    // const orders = this.orderHistory(parent, {})
    // const orderss = await Promise.all(
    //   marketInputs.map(async (marketInput) => {
    //     const market = await aux.Market.read(auxClient, marketInput);
    //     const orders = await account.openOrders(marketInput);
    //     return orders.map((order) => {
    //       return {
    //         baseCoinType: market.baseCoinInfo.coinType,
    //         quoteCoinType: market.quoteCoinInfo.coinType,
    //         orderId: order.id.toString(),
    //         owner: order.ownerId.toString(),
    //         orderType: OrderType.Limit,
    //         orderStatus: OrderStatus.Open,
    //         side: order.side === "bid" ? Side.Buy : Side.Sell,
    //         auxBurned: order.auxBurned
    //           .toDecimalUnits(6) // FIXME
    //           .toNumber(),
    //         time: order.time.toString(),
    //         price: AU(order.price)
    //           .toDecimalUnits(market.quoteCoinInfo.decimals)
    //           .toNumber(),
    //         quantity: AU(order.quantity)
    //           .toDecimalUnits(market.baseCoinInfo.decimals)
    //           .toNumber(),
    //       };
    //     });
    //   })
    // );
    // return orderss.flat();
  },
  async orderHistory(
    parent: Account,
    args: AccountOrderHistoryArgs
  ): Promise<Order[]> {
    const marketInputs =
      args.marketInputs ?? (await aux.Market.index(auxClient));
    const account = new aux.Account(auxClient, parent.address);
    const orderss = await Promise.all(
      marketInputs.map(async (marketInput) => {
        const market = await aux.Market.read(auxClient, marketInput);
        const orders = await account.orderHistory(marketInput);
        return orders.map((order) => {
          return {
            baseCoinType: market.baseCoinInfo.coinType,
            quoteCoinType: market.quoteCoinInfo.coinType,
            orderId: order.orderId.toString(),
            owner: order.owner.toString(),
            orderType: OrderType.Limit,
            orderStatus: OrderStatus.Open,
            side: order.isBid ? Side.Buy : Side.Sell,
            // FIXME
            auxBurned: 0,
            // FIXME
            time: "0",
            price: order.price
              .toDecimalUnits(market.quoteCoinInfo.decimals)
              .toNumber(),
            quantity: order.quantity
              .toDecimalUnits(market.baseCoinInfo.decimals)
              .toNumber(),
          };
        });
      })
    );
    return orderss.flat();
  },
  async tradeHistory(
    parent: Account,
    args: AccountTradeHistoryArgs
  ): Promise<Trade[]> {
    const marketInputs =
      args.marketInputs ?? (await aux.Market.index(auxClient));
    const account = new aux.Account(auxClient, parent.address);
    const tradess = await Promise.all(
      marketInputs.map(async (marketInput) => {
        const market = await aux.Market.read(auxClient, marketInput);
        const fills = await account.tradeHistory(marketInput);
        return fills.map((fill) => {
          const price = fill.price
            .toDecimalUnits(market.quoteCoinInfo.decimals)
            .toNumber();
          const quantity = fill.baseQuantity
            .toDecimalUnits(market.baseCoinInfo.decimals)
            .toNumber();
          return {
            baseCoinType: market.baseCoinInfo.coinType,
            quoteCoinType: market.quoteCoinInfo.coinType,
            orderId: fill.orderId.toString(),
            owner: fill.owner.toString(),
            market: `${market.baseCoinInfo.symbol}-${market.quoteCoinInfo.symbol}`,
            side: fill.isBid ? Side.Buy : Side.Sell,
            quantity,
            price,
            value: price * quantity,
            // FIXME
            auxBurned: 0,
            // FIXME
            time: "0",
          };
        });
      })
    );
    return tradess.flat();
  },

  // async account(owner: string) {
  //   const account = new aux.Account(auxClient, owner);
  //   const orders = (await account.orderHistory(undefined))["data"]!
  //     .data as aux.clob.core.query.OrderPlacedEvent[];

  //   const openOrders = orders.map((order) => {
  //     return {
  //       orderId: order.orderId.toString(),
  //       owner: order,
  //       // market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
  //       market: "NOT IMPLEMENTED",
  //       orderType: OrderType.Limit,
  //       orderStatus: OrderStatus.Open,
  //       side: order.isBid ? Side.Buy : Side.Sell,
  //       // FIXME
  //       auxBurned: 0,
  //       // FIXME
  //       time: "0",
  //       price: order.price
  //         .toDecimalUnits(parent.quoteCoinInfo.decimals)
  //         .toNumber(),
  //       quantity: order.quantity
  //         .toDecimalUnits(parent.baseCoinInfo.decimals)
  //         .toNumber(),
  //     };
  //   });
  //   return {
  //     async orderHistory(): Promise<Order[]> {},

  //     async tradeHistory(
  //       account: aux.Account,
  //       parent: Market
  //     ): Promise<Trade[]> {
  //       const fills = (await account.tradeHistory(undefined))["data"]!
  //         .data as aux.clob.core.query.OrderFillEvent[];

  //       return fills.map((fill) => {
  //         const price = fill.price
  //           .toDecimalUnits(parent.quoteCoinInfo.decimals)
  //           .toNumber();
  //         const quantity = fill.baseQuantity
  //           .toDecimalUnits(parent.baseCoinInfo.decimals)
  //           .toNumber();
  //         return {
  //           orderId: fill.orderId.toString(),
  //           owner: fill.owner,
  //           market: `${parent.baseCoinInfo.symbol}-${parent.quoteCoinInfo.symbol}`,
  //           side: fill.isBid ? Side.Buy : Side.Sell,
  //           quantity,
  //           price,
  //           value: price * quantity,
  //           // FIXME
  //           auxBurned: 0,
  //           // FIXME
  //           time: "0",
  //         };
  //       });
  //     },
  //   };
  // }
};
