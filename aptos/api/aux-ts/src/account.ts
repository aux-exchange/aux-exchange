import type { Types } from "aptos";
import * as amm from "./amm";
import type { PoolInput, Position } from "./amm/core/query";
import type { AuxClient } from "./client";
import type { OrderFillEvent, OrderPlacedEvent } from "./clob/core/events";
import type { Order } from "./clob/core/query";
import Market, { MarketInput } from "./clob/dsl/market";
import * as vault from "./vault";
import type {
  Balances,
  DepositEvent,
  TransferEvent,
  WithdrawEvent,
} from "./vault/core/query";

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

  async openOrders(marketInput: MarketInput): Promise<Order[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.openOrders(this.owner);
  }

  async orderHistory(marketInput: MarketInput): Promise<OrderPlacedEvent[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.orderHistory(this.owner);
  }

  async tradeHistory(marketInput: MarketInput): Promise<OrderFillEvent[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.tradeHistory(this.owner);
  }
}
