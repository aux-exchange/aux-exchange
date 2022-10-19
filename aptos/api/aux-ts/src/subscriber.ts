import * as BN from "bn.js";
import type {
  OrderCancelEvent,
  OrderFillEvent,
  OrderPlacedEvent,
} from "./clob/core/events";
import type Market from "./clob/dsl/market";
import type { L2 } from "./clob/core/query";

/**
 * Provides a callback-driven API to subscribe to market information.
 *
 * Usually you will want to follow a pattern like:
 *
 * ```
 * const sub = new MarketSubscriber(market);
 * const listener = sub.onFill(myCallback);
 * // Do stuff in an event loop
 * sub.kill();
 * await listener;
 *
 * ```
 */
export default class MarketSubscriber {
  market: Market;
  fillSeqNum: number;
  cancelSeqNum: number;
  orderSeqNum: number;
  alive: boolean;

  constructor(market: Market) {
    this.market = market;
    this.fillSeqNum = 0;
    this.cancelSeqNum = 0;
    this.orderSeqNum = 0;
    this.alive = true;
  }

  /// TODO perhaps level2 should be its own event on clob_market
  /// right now it has to redundantly load fill/cancel/place, see if there's any change, then
  /// update the entire market
  async onL2(callback: (l2: L2, market: Market) => void) {
    while (true) {
      const [fills, cancels, orders] = await Promise.all([
        this.market.fills(),
        this.market.cancels(),
        this.market.orders(),
      ]);
      if (
        fills[fills.length - 1]?.sequenceNumber?.gt(
          new BN.BN(this.fillSeqNum)
        ) &&
        cancels[cancels.length - 1]?.sequenceNumber?.gt(
          new BN.BN(this.cancelSeqNum)
        ) &&
        orders[orders.length - 1]?.sequenceNumber?.gt(
          new BN.BN(this.orderSeqNum)
        )
      ) {
        this.market.update();
        callback(this.market.l2, this.market);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  /**
   * @param callback function to be called back on any fill
   */
  async onFill(callback: (fill: OrderFillEvent, market: Market) => void) {
    this.onEvent(
      callback,
      (market) => market.fills(),
      () => this.fillSeqNum,
      (seqNum) => {
        this.fillSeqNum = seqNum;
      }
    );
  }

  /**
   * @param callback function to be called back on any cancel
   */
  async onCancel(callback: (cancel: OrderCancelEvent, market: Market) => void) {
    this.onEvent(
      callback,
      (market) => market.cancels(),
      () => this.cancelSeqNum,
      (seqNum) => {
        this.cancelSeqNum = seqNum;
      }
    );
  }

  /**
   * @param callback function to be called back on any order
   */
  async onOrder(callback: (order: OrderPlacedEvent, market: Market) => void) {
    this.onEvent(
      callback,
      (market) => market.orders(),
      () => this.orderSeqNum,
      (seqNum) => {
        this.orderSeqNum = seqNum;
      }
    );
  }

  /**
   * Marks the subscriber for termination. All listeners will eventually stop
   * after kill() is called.
   */
  kill() {
    this.alive = false;
  }

  /**
   * Manages the event loop for a given callback type.
   * @param callback
   * @param getEvents
   * @param getSeqNum
   * @param setSeqNum
   */
  private async onEvent<E>(
    callback: (event: E, market: Market) => void,
    getEvents: (market: Market) => Promise<E[]>,
    getSeqNum: () => number,
    setSeqNum: (seqNum: number) => void
  ) {
    while (this.alive) {
      const events = await getEvents(this.market);
      // process all new events since the last poll
      for (const event of events) {
        const e = event as any;
        if (e.seqNum > getSeqNum()) {
          callback(e, this.market);
          setSeqNum(e.seqNum);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
