import type { Types } from "aptos";
import * as amm from "./amm";
import type { PoolInput, Position } from "./amm/core/query";
import type { AuxClient } from "./client";
import type { OrderFillEvent, OrderPlacedEvent } from "./clob/core/events";
import type { Order } from "./clob/core/query";
import Market from "./clob/dsl/market";
import * as vault from "./vault";
import type { Balances, DepositEvent, TransferEvent, WithdrawEvent } from "./vault/core/query";

export interface MarketData<T> {
  market: Market;
  data: T;
}

type MarketType = Types.MoveStructTag;

/**
 * Represents an account in the AUX exchange.
 */
export default class AuxAccount {
  auxClient: AuxClient;
  owner: Types.Address;

  constructor(auxClient: AuxClient, owner: Types.Address) {
    this.auxClient = auxClient;
    this.owner = owner;
  }

  async balances(): Promise<Balances> {
    return vault.core.query.balances(this.auxClient, this.owner);
  }

  async deposits(): Promise<DepositEvent[]> {
    return vault.core.query.depositEvents(this.auxClient, this.owner);
  }

  async withdrawals(): Promise<WithdrawEvent[]> {
    return vault.core.query.withdrawEvents(this.auxClient, this.owner);
  }

  async transfers(): Promise<TransferEvent[]> {
    return vault.core.query.transferEvents(this.auxClient, this.owner);
  }

  // TODO: Support multiple positions in the pool.
  async poolPosition(poolInput: PoolInput): Promise<Position | undefined> {
    return amm.core.query.position(this.auxClient, this.owner, poolInput);
  }

  async poolPositions(): Promise<Position[]> {
    return amm.core.query.positions(this.auxClient, this.owner);
  }

  // overloads for single market vs. across all markets
  async openOrders(marketPair: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<Order[]>;

  async openOrders(
    marketPair?: undefined
  ): Promise<Record<MarketType, MarketData<Order[]>>>;

  async openOrders(marketPair?: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<Order[] | Record<MarketType, MarketData<Order[]>>> {
    return this.dao(
      async (market, owner) => market.openOrders(owner),
      marketPair
    );
  }

  async orderHistory(marketPair: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<OrderPlacedEvent[]>;

  async orderHistory(
    marketPair: undefined
  ): Promise<Record<MarketType, MarketData<OrderPlacedEvent[]>>>;

  async orderHistory(marketPair?: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<
    OrderPlacedEvent[] | Record<MarketType, MarketData<OrderPlacedEvent[]>>
  > {
    return this.dao(
      async (market, owner) => market.orderHistory(owner),
      marketPair
    );
  }

  async tradeHistory(marketPair: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<OrderFillEvent[]>;

  async tradeHistory(
    marketPair: undefined
  ): Promise<Record<MarketType, MarketData<OrderFillEvent[]>>>;

  async tradeHistory(marketPair?: {
    baseCoinType: Types.MoveStructTag;
    quoteCoinType: Types.MoveStructTag;
  }): Promise<
    OrderFillEvent[] | Record<MarketType, MarketData<OrderFillEvent[]>>
  > {
    return this.dao(
      async (market, owner) => market.tradeHistory(owner),
      marketPair
    );
  }

  private async dao<Type>(
    f: (market: Market, owner: Types.Address) => Promise<Type>,
    marketPair?: {
      baseCoinType: Types.MoveStructTag;
      quoteCoinType: Types.MoveStructTag;
    }
  ): Promise<Type | Record<MarketType, MarketData<Type>>> {
    if (marketPair !== undefined) {
      const market = (await Market.read(this.auxClient, marketPair))!;
      if (market === undefined) {
        throw new Error(`Error querying ${marketPair}. Market not found.`);
      }
      return f(market, this.owner);
    }
    const resources = await this.auxClient.aptosClient.getAccountResources(
      this.auxClient.moduleAddress
    );

    // TODO: This can be more robust.
    const poolResources: Types.MoveResource[] = resources.filter(
      (resource: Types.MoveResource) => resource.type.includes("Market<")
    );
    const promises = [];
    for (const poolResource of poolResources) {
      const coinType = poolResource.type.split("Market<", 2)[1]!; // ! because of above `.includes`
      const [x, y] = coinType.replace(">", "").split(", ", 2);
      const [coinTypeX, coinTypeY] = [x!, y!];
      const market = (await Market.read(this.auxClient, {
        baseCoinType: coinTypeX,
        quoteCoinType: coinTypeY,
      }))!;
      promises.push(
        f(market, this.owner).then((data) => [market.type, { market, data }])
      );
    }
    return Object.fromEntries(await Promise.all(promises));
  }
}
