import type { Types } from "aptos";
import _ from "lodash";
import { ConstantProductClient } from "./pool/constant-product/client";
import type { ConstantProductInput, Position } from "./pool/constant-product/schema";
import { AuxClient, notUndefined } from "./client";
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
  poolPosition(poolInput: ConstantProductInput): Promise<Position | undefined> {
    return new ConstantProductClient(this.auxClient, poolInput).position(this.owner);
  }

  async poolPositions(): Promise<Position[]> {
    const resources = await this.auxClient.aptosClient.getAccountResources(
      this.owner
    );
    const positions = await Promise.all(
      resources
        .filter(
          (resource) =>
            resource.type.includes("amm::LP") &&
            resource.type.includes("0x1::coin::CoinStore")
        )
        .map((resource) => resource.data as any)
        .map(async (positionResource) => {
          const [coinTypeX, coinTypeY] = positionResource.type;
          const poolClient = new ConstantProductClient(this.auxClient, {
            coinTypeX: coinTypeX!,
            coinTypeY: coinTypeY!,
          });
          return poolClient.position(this.owner);
        })
    );
    return positions.filter(notUndefined);
  }

  async openOrders(marketInput: MarketInput): Promise<Order[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.openOrders(this.owner);
  }

  async orderHistory(marketInput: MarketInput): Promise<{ order: OrderPlacedEvent; status: "open" | "canceled" | "filled" }[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.orderHistory(this.owner);
  }

  async tradeHistory(marketInput: MarketInput): Promise<OrderFillEvent[]> {
    const market = await Market.read(this.auxClient, marketInput);
    return market.fillHistory(this.owner);
  }
}
