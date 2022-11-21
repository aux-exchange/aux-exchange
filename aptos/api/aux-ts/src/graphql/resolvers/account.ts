import _ from "lodash";
import * as aux from "../../";
import { AU } from "../../";
import AuxAccount from "../../account";
import { parseTypeArgs } from "../../client";
import { auxClient } from "../client";
import { orderPlacedEventToOrder, orderFillEventToOrder, orderToOrder } from "../conversion";
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
    const balances = await Promise.all(
      coinStores.map(async (coinStore) => {
        const coinType = parseTypeArgs(coinStore.type)[0]!;
        let coinInfo;
        try {
          coinInfo = await auxClient.getCoinInfo(coinType);
        } catch {
          return undefined;
        }
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
    return balances.filter((i) => i !== undefined) as Balance[];
  },

  async balances(parent: Account): Promise<Balance[]> {
    const account = new AuxAccount(auxClient, parent.address);
    const balances = await account.balances();

    const allBalances = await Promise.all(
      balances.balances.map(async (e) => {
        const [coinType] = parseTypeArgs(e.key.name);
        let coinInfo;
        try {
          coinInfo = await auxClient.getCoinInfo(coinType!);
        } catch {
          return undefined;
        }
        return {
          coinInfo,
          availableBalance: e.value.available_balance
            .toDecimalUnits(coinInfo.decimals)
            .toString(),
          balance: e.value.balance.toDecimalUnits(coinInfo.decimals).toString(),
        };
      })
    );
    return allBalances.filter((i) => i !== undefined) as Balance[];
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
    { poolInputs }: AccountPoolPositionsArgs
  ): Promise<Position[]> {
    const positions = await new aux.Account(
      auxClient,
      parent.address
    ).poolPositions();
    return positions
      .filter((auxPosition) =>
        _.some(
          poolInputs,
          (poolInput) =>
            poolInput.coinTypes[0] === auxPosition.coinInfoX.coinType &&
            poolInput.coinTypes[1] === auxPosition.coinInfoY.coinType
        )
      )
      .map((auxPosition) => {
        const pos = auxPosition!;
        return {
          ...pos,
          coinInfos: [pos.coinInfoX, pos.coinInfoY],
          amounts: [pos.amountX.toNumber(), pos.amountY.toNumber()],
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
          orderPlacedEventToOrder(order.order, market.baseCoinInfo, market.quoteCoinInfo)
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
          orderFillEventToOrder(fill, market.baseCoinInfo, market.quoteCoinInfo)
        );
      })
    );
    return fillss.flat();
  },
};
