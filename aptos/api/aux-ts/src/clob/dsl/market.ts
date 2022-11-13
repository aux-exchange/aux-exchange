import type { AptosAccount, Types } from "aptos";
import type BN from "bn.js";
import type {
  AuxClient,
  CoinInfo,
  AuxClientOptions,
  Simulator,
} from "../../client";
import type { AuxTransaction } from "../../client";
import {
  AnyUnits,
  AtomicUnits,
  DecimalUnits,
  DU,
  toAtomicUnits,
} from "../../units";
import * as core from "../core";
import type {
  OrderCancelEvent,
  OrderFillEvent,
  OrderPlacedEvent,
  PlaceOrderEvent,
} from "../core/events";
import { OrderType, STPActionType } from "../core/mutation";
import type { L2 } from "../core/query";

const MAX_U64 = "18446744073709551615";

export interface CreateParams {
  sender: AptosAccount;
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
  baseLotSize: AtomicUnits;
  quoteLotSize: AtomicUnits;
}

export interface MarketInput {
  baseCoinType: Types.MoveStructTag;
  quoteCoinType: Types.MoveStructTag;
}

export interface PlaceOrderParams {
  sender: AptosAccount;

  // Delegator is, from exchange internal perspective, who actually makes the
  // trade. It will be the actual account that has changes in balance (fee,
  // volume tracker, etc is all associated with delegator, and independent of
  // sender (i.e. delegatee)) Default to sender's address
  delegator?: Types.Address;

  // True to place a buy order, false to place a sell.
  isBid: boolean;

  // The highest buy price or lowest sell price in units of quote per one
  // decimal unit of base.
  limitPrice: AnyUnits;

  // The amount of base to buy or sell.
  quantity: AnyUnits;

  // The amount of AUX token to spend per AU of base currency. Orders in a given
  // level are ordered descending in auxToBurn and ascending in time placed.
  auxToBurn?: AnyUnits;

  // The type of order to place.
  orderType: OrderType;

  // An arbitrary identifier provided by the user. Client order IDs may be
  // recycled, but it may be convenient to use a globally unique value to
  // simplify accounting.
  clientOrderId?: Types.U128;

  // For post only orders, this is the number of ticks to move the price
  // relative to the BBO to avoid becoming aggressive. Zero means the order will
  // be cancelled if the limit price would be aggressive. One means the order
  // will become the minimum tick size less aggressive.
  //
  // For passive join orders, this is the number of ticks to move the order
  // relative to the current best bid or best offer. If directionAggressive is
  // true, then the passive order is placed up to this many ticks more
  // aggressive, while staying passive. If directionAggressive is false, then
  // the passive order is placed this many ticks less aggressive.
  //
  // The parameter is ignored for other order types.
  ticksToSlide?: Types.U64;

  // For passive join orders, this parameter dictates whether ticksToSlide move
  // the order more or less aggressive than the current best bid or best offer.
  // Default to false
  directionAggressive?: boolean;

  // The timestamp (Unix timestamp in unit of microseconds) when the order got timeout and cancelled on-chain, user can derive the approximate timestamp they want based on query on APTOS blockchain wall clock time https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/timestamp.move#L27
  // Default to MAX_U64
  timeoutTimestamp?: Types.U64;

  // Self-trade prevention action type, it determines which side(s) to cancel if
  // there's a self-trade (self-trade is currently checked by same address)
  // Default to cancel_passive
  stpActionType?: STPActionType;
}

export interface CancelOrderParams {
  sender: AptosAccount;

  // Delegator is, from exchange internal perspective, who actually makes the
  // trade. It will be the actual account that has changes in balance (fee,
  // volume tracker, etc is all associated with delegator, and independent of
  // sender (i.e. delegatee)) Default to sender's address
  delegator?: Types.Address;

  // Global order ID to cancel. The global order ID can be mapped to client
  // order ID via the order placement event.
  orderId: Types.U64;
}

export interface Order {
  id: BN;
  owner: Types.Address;
  auxBurned: DecimalUnits;
  time: BN;
  price: DecimalUnits;
  quantity: DecimalUnits;
}

/**
 * Primary interface to a central limit order book market.
 */
export default class Market implements core.query.Market {
  auxClient: AuxClient;
  clobAddress: Types.Address;
  baseDecimals: number;
  quoteDecimals: number;
  lotSize: AtomicUnits;
  tickSize: AtomicUnits;
  nextOrderId: BN;
  type: Types.MoveStructTag;
  baseCoinInfo: CoinInfo;
  quoteCoinInfo: CoinInfo;
  l2: L2;

  static async index(auxClient: AuxClient): Promise<MarketInput[]> {
    return core.query.markets(auxClient);
  }

  /**
   * Creates a market and returns a wrapper object.
   * @param auxClient
   * @param createParams
   * @returns
   */
  static async create(
    auxClient: AuxClient,
    createParams: CreateParams
  ): Promise<Market> {
    await core.mutation.createMarket(auxClient, {
      ...createParams,
      baseLotSize: createParams.baseLotSize.toString(),
      quoteLotSize: createParams.quoteLotSize.toString(),
    });
    return await Market.read(auxClient, createParams);
  }

  /**
   * Constructs a wrapper object from an existing market.
   * @param auxClient
   * @param param1
   * @returns
   */
  static async read(
    auxClient: AuxClient,
    { baseCoinType, quoteCoinType }: MarketInput
  ): Promise<Market> {
    const clobAddress = auxClient.moduleAddress;
    const market = await core.query.market(
      auxClient,
      baseCoinType,
      quoteCoinType
    );
    return new Market({
      auxClient,
      clobAddress,
      ...market,
    });
  }

  private constructor(kwargs: {
    auxClient: AuxClient;
    clobAddress: Types.Address;
    baseDecimals: number;
    quoteDecimals: number;
    lotSize: AtomicUnits;
    tickSize: AtomicUnits;
    nextOrderId: BN;
    type: Types.MoveStructTag;
    baseCoinInfo: CoinInfo;
    quoteCoinInfo: CoinInfo;
    l2: L2;
  }) {
    this.auxClient = kwargs.auxClient;
    this.clobAddress = kwargs.clobAddress;
    this.baseDecimals = kwargs.baseDecimals;
    this.quoteDecimals = kwargs.quoteDecimals;
    this.lotSize = kwargs.lotSize;
    this.tickSize = kwargs.tickSize;
    this.nextOrderId = kwargs.nextOrderId;
    this.type = kwargs.type;
    this.baseCoinInfo = kwargs.baseCoinInfo;
    this.quoteCoinInfo = kwargs.quoteCoinInfo;
    this.l2 = kwargs.l2;
  }

  /**
   * Rounds the quantity to a roundlot quantity.
   */
  makeRoundLot(quantity: AtomicUnits): AtomicUnits {
    return new AtomicUnits(
      quantity.amount.divRound(this.lotSize.amount).mul(this.lotSize.amount)
    );
  }

  /**
   * Rounds the price to a roundtick price.
   */
  makeRoundTick(price: AtomicUnits): AtomicUnits {
    return new AtomicUnits(
      price.amount.divRound(this.tickSize.amount).mul(this.tickSize.amount)
    );
  }

  /**
   * Places an order in the market. See documentation for PlaceOrderParams.
   */
  async placeOrder(
    {
      sender,
      delegator,
      isBid,
      limitPrice,
      quantity,
      auxToBurn,
      clientOrderId,
      orderType,
      ticksToSlide,
      directionAggressive,
      timeoutTimestamp,
      stpActionType,
    }: PlaceOrderParams,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<PlaceOrderEvent[]>> {
    const limitPriceAu: Types.U64 = this.makeRoundTick(
      toAtomicUnits(limitPrice, this.quoteDecimals)
    ).toU64();
    const quantityAu: Types.U64 = this.makeRoundLot(
      toAtomicUnits(quantity, this.baseDecimals)
    ).toU64();
    const auxToBurnAu: Types.U64 = toAtomicUnits(
      auxToBurn,
      6 // TODO: How do we retrieve this?
    ).toU64();
    return core.mutation.placeOrder(
      this.auxClient,
      {
        sender,
        delegator:
          delegator !== undefined ? delegator : sender.address().toString(),
        isBid,
        limitPriceAu,
        quantityAu,
        auxToBurnAu,
        market: this,
        clientOrderId: clientOrderId ? clientOrderId : "0",
        orderType,
        ticksToSlide: ticksToSlide ? ticksToSlide : "0",
        directionAggressive:
          directionAggressive !== undefined ? directionAggressive : false,
        timeoutTimestamp:
          timeoutTimestamp !== undefined ? timeoutTimestamp : MAX_U64,
        stpActionType:
          stpActionType !== undefined
            ? stpActionType
            : STPActionType.CANCEL_PASSIVE,
      },
      options
    );
  }

  /**
   * Cancels an order in the market. Note that the orderId here is the global
   * order id, NOT the client order id! To get the global order id, you should
   * read the events from placeOrder. If any of those events result in liquidity
   * added to the book, you must track the corresponding order id.
   *
   * If the order hasn't been added to the book yet, cancel will enqueue a
   * cancel for when the order is added. In other words, placeOrder and
   * cancelOrder can be processed out of order from any given Full Node's
   * perspective.
   * @param sender
   * @param orderId the global order id to cancel
   * @returns
   */
  async cancelOrder({
    sender,
    delegator,
    orderId,
  }: CancelOrderParams): Promise<Types.UserTransaction> {
    return core.mutation.cancelOrder(this.auxClient, {
      sender,
      delegator:
        delegator !== undefined ? delegator : sender.address().toString(),
      baseCoinType: this.baseCoinInfo.coinType,
      quoteCoinType: this.quoteCoinInfo.coinType,
      orderId,
    });
  }

  /**
   * Cancel all current open orders on the orderbook owned by sender
   * @param sender
   * @returns
   */
  async cancelAll(
    sender: AptosAccount,
    delegator?: Types.Address
  ): Promise<Types.UserTransaction> {
    return core.mutation.cancelAll(this.auxClient, {
      sender,
      delegator:
        delegator !== undefined ? delegator : sender.address().toString(),
      baseCoinType: this.baseCoinInfo.coinType,
      quoteCoinType: this.quoteCoinInfo.coinType,
    });
  }

  /**
   * Updates the public orderbook data.
   */
  async update() {
    const market = await core.query.market(
      this.auxClient,
      this.baseCoinInfo.coinType,
      this.quoteCoinInfo.coinType
    );
    this.lotSize = market.lotSize;
    this.tickSize = market.tickSize;
    this.nextOrderId = market.nextOrderId;
    this.l2 = market.l2;
  }

  /**
   * @returns all fill events
   */
  async fills(
    pagination?: { start: BN } | { limit: BN }
  ): Promise<OrderFillEvent[]> {
    return core.query.orderFillEvents(
      this.auxClient,
      this.clobAddress,
      this,
      pagination
    );
  }

  /**
   * @returns all cancel events
   */
  async cancels(
    pagination?: { start: BN } | { limit: BN }
  ): Promise<OrderCancelEvent[]> {
    return core.query.orderCancelEvents(
      this.auxClient,
      this.clobAddress,
      this,
      pagination
    );
  }

  /**
   * @returns all order placed events
   */
  async orders(
    pagination?: { start: BN } | { limit: BN }
  ): Promise<OrderPlacedEvent[]> {
    return core.query.orderPlacedEvents(
      this.auxClient,
      this.clobAddress,
      this,
      pagination
    );
  }

  /**
   * Returns open orders for the given trader.
   * @param owner
   * @returns
   */
  async openOrders(owner: Types.Address): Promise<core.query.Order[]> {
    return core.query.openOrders(
      this.auxClient,
      owner,
      this.baseCoinInfo.coinType,
      this.quoteCoinInfo.coinType
    );
  }

  /**
   * Returns the full orderbook.
   * @param owner
   * @returns
   */
  async orderbook(
    simulator?: Simulator
  ): Promise<{ bids: core.query.Level[]; asks: core.query.Level[] }> {
    return core.query.orderbook(
      this.auxClient,
      this.baseCoinInfo.coinType,
      this.quoteCoinInfo.coinType,
      simulator ?? this.auxClient.simulator
    );
  }

  /**
   * Returns orders for the given trader.
   * @param owner
   * @returns
   */
  async orderHistory(
    owner: Types.Address,
    pagination?: { start: BN } | { limit: BN }
  ): Promise<
    { order: OrderPlacedEvent; status: "open" | "canceled" | "filled" }[]
  > {
    return core.query.orderHistory(
      this.auxClient,
      this.baseCoinInfo.coinType,
      this.quoteCoinInfo.coinType,
      owner,
      pagination
    );
  }

  /**
   * Returns fills for the given trader.
   * @param owner
   * @returns
   */
  async fillHistory(
    owner?: Types.Address,
    pagination?: { start: BN } | { limit: BN }
  ): Promise<OrderFillEvent[]> {
    return core.query.fillHistory(
      this.auxClient,
      this.baseCoinInfo.coinType,
      this.quoteCoinInfo.coinType,
      owner,
      pagination
    );
  }

  static l2(
    market: core.query.Market,
    levels: core.query.Level[]
  ): { price: DecimalUnits; quantity: DecimalUnits }[] {
    return levels.map((level) => {
      const sum = level.orders
        .map((order) =>
          order.quantity.toDecimalUnits(market.baseCoinInfo.decimals).toNumber()
        )
        // TODO better to do ops in AU (overflow) or DU (precision loss)?
        .reduce((a, b) => a + b, 0);
      const quantity = DU(sum);
      return {
        price: level.price.toDecimalUnits(market.quoteCoinInfo.decimals),
        quantity,
      };
    });
  }
}
