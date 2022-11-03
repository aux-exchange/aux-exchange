import _ from "lodash";
import * as aux from "../../";
import { AU } from "../../";
import AuxAccount from "../../account";
import { parseTypeArgs } from "../../client";
import { auxClient } from "../connection";
import { orderEventToOrder, orderToOrder } from "../conversion";
import type {
  Account,
  AccountIsCoinRegisteredArgs,
  AccountOpenOrdersArgs,
  AccountOrderHistoryArgs,
  AccountPoolPositionsArgs,
  AccountTradeHistoryArgs,
  Balance,
  Deposit,
  Order,
  Position,
  RegisteredCoinInfo,
  Transfer,
  Withdrawal,
} from "../generated/types";
import { query } from "./query";

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
  async registeredCoins(parent: Account): Promise<RegisteredCoinInfo[]> {
    const resources = await auxClient.aptosClient.getAccountResources(
      parent.address
    );
    const coinStores = resources.filter(
      (resource) =>
        resource.type.includes("CoinStore<") && !resource.type.includes("LP")
    );
    const coinTypes = new Set(
      coinStores.map((coinStore) => parseTypeArgs(coinStore.type)[0])
    );
    const coins = await query.coins(undefined);
    return coins.map((coin) => ({
      coinInfo: coin,
      registered: coinTypes.has(coin.coinType),
    }));
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
        const coinInfo = await auxClient.getCoinInfo(coinType);
        // @ts-ignore
        const balance = AU(coinStore.data.coin.value)
          .toDecimalUnits(coinInfo.decimals)
          .toString();
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
            .toString(),
          balance: e.value.balance.toDecimalUnits(coinInfo.decimals).toString(),
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
    const marketInputs =
      args.marketInputs ?? (await aux.Market.index(auxClient));
    const account = new aux.Account(auxClient, parent.address);
    const orderss = await Promise.all(
      marketInputs.map(async (marketInput) => {
        const [baseCoinType, quoteCoinType] = [
          marketInput.baseCoinType,
          marketInput.quoteCoinType,
        ];
        const [baseCoinInfo, quoteCoinInfo] = await Promise.all([
          auxClient.getCoinInfo(marketInput.baseCoinType),
          auxClient.getCoinInfo(marketInput.quoteCoinType),
        ]);
        const orders = await account.openOrders({
          baseCoinType,
          quoteCoinType,
        });
        return orders.map((order) =>
          orderToOrder(order, baseCoinInfo, quoteCoinInfo)
        );
      })
    );
    return orderss.flat();
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
        return orders.map((order) =>
          orderEventToOrder(order, market.baseCoinInfo, market.quoteCoinInfo)
        );
      })
    );
    return orderss.flat();
  },
  async tradeHistory(
    parent: Account,
    args: AccountTradeHistoryArgs
  ): Promise<Order[]> {
    const marketInputs =
      args.marketInputs ?? (await aux.Market.index(auxClient));
    const account = new aux.Account(auxClient, parent.address);
    const fillss = await Promise.all(
      marketInputs.map(async (marketInput) => {
        const market = await aux.Market.read(auxClient, marketInput);
        const fills = await account.tradeHistory(marketInput);
        return fills.map((fill) =>
          orderEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
        );
      })
    );
    return fillss.flat();
  },
};
