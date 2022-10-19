import { Types } from "aptos";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  EntryFunctionPayload: any;
  Address: any;
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['Address'];
  walletBalances: Array<Balance>;
  balances: Array<Balance>;
  deposits: Array<Deposit>;
  withdrawals: Array<Withdrawal>;
  transfers: Array<Transfer>;
  poolPositions: Array<Position>;
  openOrders: Array<Order>;
  orderHistory: Array<Order>;
  tradeHistory: Array<Trade>;
};


export type AccountPoolPositionsArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type AccountOpenOrdersArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type AccountOrderHistoryArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type AccountTradeHistoryArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};

export type Market = {
  __typename?: 'Market';
  name: Scalars['String'];
  baseCoinInfo: CoinInfo;
  quoteCoinInfo: CoinInfo;
  lotSize: Scalars['Float'];
  tickSize: Scalars['Float'];
  orderbook: Orderbook;
  openOrders: Array<Order>;
  orderHistory: Array<Order>;
  tradeHistory: Array<Trade>;
  high24h?: Maybe<Scalars['Float']>;
  low24h?: Maybe<Scalars['Float']>;
  volume24h?: Maybe<Scalars['Float']>;
  bars: Array<Bar>;
  pythRating?: Maybe<PythRating>;
};


export type MarketOpenOrdersArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};


export type MarketOrderHistoryArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};


export type MarketTradeHistoryArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};


export type MarketBarsArgs = {
  resolution: Resolution;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type MarketPythRatingArgs = {
  price: Scalars['Float'];
  side: Side;
};

export type PythRating = {
  __typename?: 'PythRating';
  price: Scalars['Float'];
  color: PythRatingColor;
};

export enum PythRatingColor {
  Red = 'RED',
  Yellow = 'YELLOW',
  Green = 'GREEN'
}

export type Orderbook = {
  __typename?: 'Orderbook';
  bids: Array<Level>;
  asks: Array<Level>;
};

export type Level = {
  __typename?: 'Level';
  price: Scalars['Float'];
  quantity: Scalars['Float'];
};

export enum Side {
  Buy = 'BUY',
  Sell = 'SELL'
}

export enum OrderType {
  Limit = 'LIMIT',
  FillOrKill = 'FILL_OR_KILL',
  ImmediateOrCancel = 'IMMEDIATE_OR_CANCEL',
  PostOnly = 'POST_ONLY',
  PassiveJoin = 'PASSIVE_JOIN'
}

export enum StpActionType {
  CancelPassive = 'CANCEL_PASSIVE',
  CancelAggressive = 'CANCEL_AGGRESSIVE',
  CancelBoth = 'CANCEL_BOTH'
}

export enum OrderStatus {
  Open = 'OPEN',
  Filled = 'FILLED',
  Canceled = 'CANCELED'
}

export enum Resolution {
  Seconds_15 = 'SECONDS_15',
  Minutes_1 = 'MINUTES_1',
  Minutes_5 = 'MINUTES_5',
  Minutes_15 = 'MINUTES_15',
  Hours_1 = 'HOURS_1',
  Hours_4 = 'HOURS_4',
  Days_1 = 'DAYS_1',
  Weeks_1 = 'WEEKS_1'
}

export type Order = {
  __typename?: 'Order';
  baseCoinType: Scalars['String'];
  quoteCoinType: Scalars['String'];
  orderId: Scalars['ID'];
  owner: Scalars['Address'];
  orderType: OrderType;
  orderStatus: OrderStatus;
  side: Side;
  quantity: Scalars['Float'];
  price: Scalars['Float'];
  auxBurned: Scalars['Float'];
  time: Scalars['String'];
};

export type Trade = {
  __typename?: 'Trade';
  baseCoinType: Scalars['String'];
  quoteCoinType: Scalars['String'];
  orderId: Scalars['ID'];
  owner: Scalars['Address'];
  side: Side;
  quantity: Scalars['Float'];
  price: Scalars['Float'];
  value: Scalars['Float'];
  auxBurned: Scalars['Float'];
  time: Scalars['String'];
};

export type Bar = {
  __typename?: 'Bar';
  time: Scalars['String'];
  ohlcv?: Maybe<Ohlcv>;
};

export type Ohlcv = {
  __typename?: 'Ohlcv';
  open: Scalars['Float'];
  high: Scalars['Float'];
  low: Scalars['Float'];
  close: Scalars['Float'];
  volume: Scalars['Float'];
};

export type ClobSubscription = {
  __typename?: 'ClobSubscription';
  orderbook: Orderbook;
  trades: Trade;
};


export type ClobSubscriptionOrderbookArgs = {
  marketInput: MarketInput;
};


export type ClobSubscriptionTradesArgs = {
  marketInput: MarketInput;
};

export type MarketInput = {
  baseCoinType: Scalars['String'];
  quoteCoinType: Scalars['String'];
};

export type CreateMarketInput = {
  marketInput: MarketInput;
  baseLotSize: Scalars['Int'];
  quoteLotSize: Scalars['Int'];
};

export type PlaceOrderInput = {
  marketInput: MarketInput;
  sender: Scalars['Address'];
  side: Side;
  limitPrice: Scalars['String'];
  quantity: Scalars['String'];
  auxToBurn: Scalars['Float'];
  clientOrderId: Scalars['Int'];
  orderType: OrderType;
};

export type CancelOrderInput = {
  marketInput: MarketInput;
  sender: Scalars['Address'];
  orderId: Scalars['ID'];
};

export type PoolInput = {
  coinTypeX: Scalars['String'];
  coinTypeY: Scalars['String'];
};

export type Pool = {
  __typename?: 'Pool';
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  coinInfoLP: CoinInfo;
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  amountLP: Scalars['Float'];
  feePercent: Scalars['Float'];
  swaps: Array<Swap>;
  adds: Array<AddLiquidity>;
  removes: Array<RemoveLiquidity>;
  position?: Maybe<Position>;
  priceIn?: Maybe<Scalars['Float']>;
  priceOut?: Maybe<Scalars['Float']>;
};


export type PoolSwapsArgs = {
  owner?: InputMaybe<Scalars['Address']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type PoolAddsArgs = {
  owner?: InputMaybe<Scalars['Address']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type PoolRemovesArgs = {
  owner?: InputMaybe<Scalars['Address']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type PoolPositionArgs = {
  owner: Scalars['Address'];
};


export type PoolPriceInArgs = {
  coinTypeIn: Scalars['String'];
  amount: Scalars['Float'];
};


export type PoolPriceOutArgs = {
  coinTypeOut: Scalars['String'];
  amount: Scalars['Float'];
};

export type Position = {
  __typename?: 'Position';
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  coinInfoLP: CoinInfo;
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  amountLP: Scalars['Float'];
  share: Scalars['Float'];
};

export type CreatePoolInput = {
  poolInput: PoolInput;
  feePercent: Scalars['Float'];
};

export type AddLiquidityInput = {
  poolInput: PoolInput;
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
};

export type RemoveLiquidityInput = {
  poolInput: PoolInput;
  amountLP: Scalars['Float'];
};

export type SwapInput = {
  poolInput: PoolInput;
  coinTypeIn: Scalars['String'];
  coinTypeOut: Scalars['String'];
  amountIn: Scalars['Float'];
  minAmountOut: Scalars['Float'];
};

export type Swap = {
  __typename?: 'Swap';
  coinInfoIn: CoinInfo;
  coinInfoOut: CoinInfo;
  amountIn: Scalars['Float'];
  amountOut: Scalars['Float'];
};

export type AddLiquidity = {
  __typename?: 'AddLiquidity';
  amountAddedX: Scalars['Float'];
  amountAddedY: Scalars['Float'];
  amountMintedLP: Scalars['Float'];
};

export type RemoveLiquidity = {
  __typename?: 'RemoveLiquidity';
  amountRemovedX: Scalars['Float'];
  amountRemovedY: Scalars['Float'];
  amountBurnedLP: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  address: Scalars['Address'];
  pool?: Maybe<Pool>;
  pools: Array<Pool>;
  poolCoins: Array<CoinInfo>;
  market?: Maybe<Market>;
  markets: Array<Market>;
  marketCoins: Array<CoinInfo>;
  account?: Maybe<Account>;
};


export type QueryPoolArgs = {
  poolInput: PoolInput;
};


export type QueryPoolsArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type QueryMarketArgs = {
  marketInput: MarketInput;
};


export type QueryMarketsArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type QueryAccountArgs = {
  owner: Scalars['Address'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPool: Scalars['EntryFunctionPayload'];
  swap: Scalars['EntryFunctionPayload'];
  addLiquidity: Scalars['EntryFunctionPayload'];
  removeLiquidity: Scalars['EntryFunctionPayload'];
  createMarket: Scalars['EntryFunctionPayload'];
  placeOrder: Scalars['EntryFunctionPayload'];
  cancelOrder: Scalars['EntryFunctionPayload'];
  deposit: Scalars['EntryFunctionPayload'];
  withdraw: Scalars['EntryFunctionPayload'];
  transfer: Scalars['EntryFunctionPayload'];
};


export type MutationCreatePoolArgs = {
  createPoolInput: CreatePoolInput;
};

export type MutationRegisterCoinArgs = {
  coinType: Types.MoveStructTag;
};

export type MutationSwapArgs = {
  swapInput: SwapInput;
};


export type MutationAddLiquidityArgs = {
  addLiquidityInput: AddLiquidityInput;
};


export type MutationRemoveLiquidityArgs = {
  removeLiquidityInput: RemoveLiquidityInput;
};


export type MutationCreateMarketArgs = {
  createMarketInput: CreateMarketInput;
};


export type MutationPlaceOrderArgs = {
  placeOrderInput: PlaceOrderInput;
};


export type MutationCancelOrderArgs = {
  cancelOrderInput: CancelOrderInput;
};


export type MutationDepositArgs = {
  depositInput: DepositInput;
};


export type MutationWithdrawArgs = {
  withdrawInput: WithdrawInput;
};


export type MutationTransferArgs = {
  transferInput: TransferInput;
};

export type Subscription = {
  __typename?: 'Subscription';
  swap?: Maybe<Swap>;
  addLiquidity?: Maybe<AddLiquidity>;
  removeLiquidity?: Maybe<RemoveLiquidity>;
  orderbook?: Maybe<Orderbook>;
  trade?: Maybe<Trade>;
  lastTradePrice: Scalars['Float'];
};


export type SubscriptionSwapArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionAddLiquidityArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionRemoveLiquidityArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionOrderbookArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionTradeArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionLastTradePriceArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};

export type CoinInfo = {
  __typename?: 'CoinInfo';
  coinType: Scalars['String'];
  decimals: Scalars['Float'];
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type Wallet = {
  __typename?: 'Wallet';
  balances: Array<Balance>;
};

export type Balance = {
  __typename?: 'Balance';
  coinInfo: CoinInfo;
  balance: Scalars['Float'];
  availableBalance: Scalars['Float'];
};

export type Deposit = {
  __typename?: 'Deposit';
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
  amount: Scalars['Float'];
};

export type Withdrawal = {
  __typename?: 'Withdrawal';
  coinType: Scalars['String'];
  from: Scalars['Address'];
  amount: Scalars['Float'];
};

export type Transfer = {
  __typename?: 'Transfer';
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
  amount: Scalars['Float'];
};

export type DepositInput = {
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
  amount: Scalars['Float'];
};

export type WithdrawInput = {
  coinType: Scalars['String'];
  from: Scalars['Address'];
  amount: Scalars['Float'];
};

export type TransferInput = {
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
  amount: Scalars['Float'];
};
