import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Address: any;
  EntryFunctionPayload: any;
  Timestamp: any;
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['Address'];
  balances: Array<Balance>;
  deposits: Array<Deposit>;
  hasAuxAccount: Scalars['Boolean'];
  isCoinRegistered: Scalars['Boolean'];
  openOrders: Array<Order>;
  orderHistory: Array<Order>;
  poolPositions: Array<Position>;
  registeredCoins: Array<RegisteredCoinInfo>;
  tradeHistory: Array<Trade>;
  transfers: Array<Transfer>;
  walletBalances: Array<Balance>;
  withdrawals: Array<Withdrawal>;
};


export type AccountIsCoinRegisteredArgs = {
  coinType: Scalars['String'];
};


export type AccountOpenOrdersArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type AccountOrderHistoryArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type AccountPoolPositionsArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type AccountTradeHistoryArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};

export type AddLiquidity = {
  __typename?: 'AddLiquidity';
  amountAddedX: Scalars['Float'];
  amountAddedY: Scalars['Float'];
  amountMintedLP: Scalars['Float'];
  time: Scalars['Timestamp'];
};

export type AddLiquidityInput = {
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  poolInput: PoolInput;
};

export type Balance = {
  __typename?: 'Balance';
  availableBalance: Scalars['String'];
  balance: Scalars['String'];
  coinInfo: CoinInfo;
};

export type Bar = {
  __typename?: 'Bar';
  baseCoinType: Scalars['String'];
  ohlcv?: Maybe<Ohlcv>;
  quoteCoinType: Scalars['String'];
  time: Scalars['Timestamp'];
};

export type CancelOrderInput = {
  marketInput: MarketInput;
  orderId: Scalars['ID'];
  sender: Scalars['Address'];
};

export type CoinInfo = {
  __typename?: 'CoinInfo';
  coinType: Scalars['String'];
  decimals: Scalars['Float'];
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type CreateMarketInput = {
  baseLotSize: Scalars['Int'];
  marketInput: MarketInput;
  quoteLotSize: Scalars['Int'];
};

export type CreatePoolInput = {
  feeBasisPoints: Scalars['String'];
  poolInput: PoolInput;
};

export type Deposit = {
  __typename?: 'Deposit';
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
};

export type DepositInput = {
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
};

export enum FeaturedStatus {
  Hot = 'HOT',
  None = 'NONE',
  Promoted = 'PROMOTED'
}

export type High24h = {
  __typename?: 'High24h';
  baseCoinType: Scalars['String'];
  high: Scalars['Float'];
  quoteCoinType: Scalars['String'];
};

export type LastTradePrice = {
  __typename?: 'LastTradePrice';
  baseCoinType: Scalars['String'];
  price: Scalars['Float'];
  quoteCoinType: Scalars['String'];
};

export type Level = {
  __typename?: 'Level';
  price: Scalars['Float'];
  quantity: Scalars['Float'];
};

export type Low24h = {
  __typename?: 'Low24h';
  baseCoinType: Scalars['String'];
  low: Scalars['Float'];
  quoteCoinType: Scalars['String'];
};

export type Market = {
  __typename?: 'Market';
  bars: Array<Bar>;
  baseCoinInfo: CoinInfo;
  high24h?: Maybe<Scalars['Float']>;
  isRoundLot: Scalars['Boolean'];
  isRoundTick: Scalars['Boolean'];
  lastTradePrice?: Maybe<Scalars['Float']>;
  lotSize: Scalars['Float'];
  lotSizeDecimals: Scalars['String'];
  lotSizeString: Scalars['String'];
  low24h?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  openOrders: Array<Order>;
  orderHistory: Array<Order>;
  orderbook: Orderbook;
  pythRating?: Maybe<PythRating>;
  quoteCoinInfo: CoinInfo;
  tickSize: Scalars['Float'];
  tickSizeDecimals: Scalars['String'];
  tickSizeString: Scalars['String'];
  tradeHistory: Array<Trade>;
  volume24h?: Maybe<Scalars['Float']>;
};


export type MarketBarsArgs = {
  countBack?: InputMaybe<Scalars['Int']>;
  firstDataRequest?: InputMaybe<Scalars['Boolean']>;
  from?: InputMaybe<Scalars['Int']>;
  resolution: Resolution;
  to?: InputMaybe<Scalars['Int']>;
};


export type MarketIsRoundLotArgs = {
  quantity: Scalars['String'];
};


export type MarketIsRoundTickArgs = {
  quantity: Scalars['String'];
};


export type MarketOpenOrdersArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};


export type MarketOrderHistoryArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};


export type MarketPythRatingArgs = {
  price: Scalars['Float'];
  side: Side;
};


export type MarketTradeHistoryArgs = {
  owner?: InputMaybe<Scalars['Address']>;
};

export type MarketInput = {
  baseCoinType: Scalars['String'];
  quoteCoinType: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addLiquidity: Scalars['EntryFunctionPayload'];
  addLiquidityWithAccount: Scalars['EntryFunctionPayload'];
  cancelOrder: Scalars['EntryFunctionPayload'];
  createAuxAccount: Scalars['EntryFunctionPayload'];
  createMarket: Scalars['EntryFunctionPayload'];
  createPool: Scalars['EntryFunctionPayload'];
  deposit: Scalars['EntryFunctionPayload'];
  placeOrder: Scalars['EntryFunctionPayload'];
  registerCoin: Scalars['EntryFunctionPayload'];
  removeLiquidity: Scalars['EntryFunctionPayload'];
  removeLiquidityWithAccount: Scalars['EntryFunctionPayload'];
  swapExactIn: Scalars['EntryFunctionPayload'];
  swapExactOut: Scalars['EntryFunctionPayload'];
  transfer: Scalars['EntryFunctionPayload'];
  withdraw: Scalars['EntryFunctionPayload'];
};


export type MutationAddLiquidityArgs = {
  addLiquidityInput: AddLiquidityInput;
};


export type MutationAddLiquidityWithAccountArgs = {
  addLiquidityInput: AddLiquidityInput;
};


export type MutationCancelOrderArgs = {
  cancelOrderInput: CancelOrderInput;
};


export type MutationCreateMarketArgs = {
  createMarketInput: CreateMarketInput;
};


export type MutationCreatePoolArgs = {
  createPoolInput: CreatePoolInput;
};


export type MutationDepositArgs = {
  depositInput: DepositInput;
};


export type MutationPlaceOrderArgs = {
  placeOrderInput: PlaceOrderInput;
};


export type MutationRegisterCoinArgs = {
  registerCoinInput: RegisterCoinInput;
};


export type MutationRemoveLiquidityArgs = {
  removeLiquidityInput: RemoveLiquidityInput;
};


export type MutationRemoveLiquidityWithAccountArgs = {
  removeLiquidityInput: RemoveLiquidityInput;
};


export type MutationSwapExactInArgs = {
  swapExactInInput: SwapExactInInput;
};


export type MutationSwapExactOutArgs = {
  swapExactOutInput: SwapExactOutInput;
};


export type MutationTransferArgs = {
  transferInput: TransferInput;
};


export type MutationWithdrawArgs = {
  withdrawInput: WithdrawInput;
};

export type Ohlcv = {
  __typename?: 'Ohlcv';
  close: Scalars['Float'];
  high: Scalars['Float'];
  low: Scalars['Float'];
  open: Scalars['Float'];
  volume: Scalars['Float'];
};

export type Order = {
  __typename?: 'Order';
  auxBurned: Scalars['Float'];
  baseCoinType: Scalars['String'];
  orderId: Scalars['ID'];
  orderStatus: OrderStatus;
  orderType: OrderType;
  owner: Scalars['Address'];
  price: Scalars['Float'];
  quantity: Scalars['Float'];
  quoteCoinType: Scalars['String'];
  side: Side;
  time: Scalars['Timestamp'];
  value: Scalars['Float'];
};

export enum OrderStatus {
  Canceled = 'CANCELED',
  Filled = 'FILLED',
  Open = 'OPEN'
}

export enum OrderType {
  FillOrKill = 'FILL_OR_KILL',
  ImmediateOrCancel = 'IMMEDIATE_OR_CANCEL',
  Limit = 'LIMIT',
  PassiveJoin = 'PASSIVE_JOIN',
  PostOnly = 'POST_ONLY'
}

export type Orderbook = {
  __typename?: 'Orderbook';
  asks: Array<Level>;
  baseCoinType: Scalars['String'];
  bids: Array<Level>;
  quoteCoinType: Scalars['String'];
};

export type PlaceOrderInput = {
  auxToBurn: Scalars['Float'];
  clientOrderId: Scalars['Int'];
  limitPrice: Scalars['String'];
  marketInput: MarketInput;
  orderType: OrderType;
  quantity: Scalars['String'];
  sender: Scalars['Address'];
  side: Side;
};

export type Pool = {
  __typename?: 'Pool';
  adds: Array<AddLiquidity>;
  amountLP: Scalars['Float'];
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  coinInfoLP: CoinInfo;
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  featuredStatus: FeaturedStatus;
  feePercent: Scalars['Float'];
  position?: Maybe<Position>;
  priceX: Scalars['Float'];
  priceY: Scalars['Float'];
  quoteExactIn: QuoteExactIn;
  quoteExactOut: QuoteExactOut;
  removes: Array<RemoveLiquidity>;
  swaps: Array<Swap>;
};


export type PoolAddsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  owner?: InputMaybe<Scalars['Address']>;
};


export type PoolPositionArgs = {
  owner: Scalars['Address'];
};


export type PoolQuoteExactInArgs = {
  amountIn: Scalars['Float'];
  coinTypeIn: Scalars['String'];
  slippagePct?: InputMaybe<Scalars['Float']>;
};


export type PoolQuoteExactOutArgs = {
  amountOut: Scalars['Float'];
  coinTypeOut: Scalars['String'];
  slippagePct?: InputMaybe<Scalars['Float']>;
};


export type PoolRemovesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  owner?: InputMaybe<Scalars['Address']>;
};


export type PoolSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  owner?: InputMaybe<Scalars['Address']>;
};

export type PoolInput = {
  coinTypeX: Scalars['String'];
  coinTypeY: Scalars['String'];
};

export type Position = {
  __typename?: 'Position';
  amountLP: Scalars['Float'];
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  coinInfoLP: CoinInfo;
  coinInfoX: CoinInfo;
  coinInfoY: CoinInfo;
  share: Scalars['Float'];
};

export type PythRating = {
  __typename?: 'PythRating';
  color: RatingColor;
  message: Scalars['String'];
  price: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  address: Scalars['Address'];
  coins: Array<CoinInfo>;
  market?: Maybe<Market>;
  markets: Array<Market>;
  pool?: Maybe<Pool>;
  pools: Array<Pool>;
  summaryMetrics: SummaryMetrics;
};


export type QueryAccountArgs = {
  owner: Scalars['Address'];
};


export type QueryMarketArgs = {
  marketInput: MarketInput;
};


export type QueryMarketsArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type QueryPoolArgs = {
  poolInput: PoolInput;
};


export type QueryPoolsArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};

export type QuoteExactIn = {
  __typename?: 'QuoteExactIn';
  expectedAmountOut: Scalars['Float'];
  feeAmount: Scalars['Float'];
  feeAmountDollars?: Maybe<Scalars['Float']>;
  feeCurrency: CoinInfo;
  minAmountOut: Scalars['Float'];
  priceImpactPct: Scalars['Float'];
  priceImpactRating: RatingColor;
  priceIn: Scalars['Float'];
  priceOut: Scalars['Float'];
  pythRating?: Maybe<PythRating>;
};

export type QuoteExactOut = {
  __typename?: 'QuoteExactOut';
  expectedAmountIn: Scalars['Float'];
  feeCurrency: CoinInfo;
  maxAmountIn: Scalars['Float'];
  maxFeeAmount: Scalars['Float'];
  maxFeeAmountDollars?: Maybe<Scalars['Float']>;
  priceImpactPct: Scalars['Float'];
  priceImpactRating: RatingColor;
  priceIn: Scalars['Float'];
  priceOut: Scalars['Float'];
  pythRating?: Maybe<PythRating>;
};

export enum RatingColor {
  Green = 'GREEN',
  Red = 'RED',
  Yellow = 'YELLOW'
}

export type RegisterCoinInput = {
  coinType: Scalars['String'];
};

export type RegisteredCoinInfo = {
  __typename?: 'RegisteredCoinInfo';
  coinInfo: CoinInfo;
  registered: Scalars['Boolean'];
};

export type RemoveLiquidity = {
  __typename?: 'RemoveLiquidity';
  amountBurnedLP: Scalars['Float'];
  amountRemovedX: Scalars['Float'];
  amountRemovedY: Scalars['Float'];
  time: Scalars['Timestamp'];
};

export type RemoveLiquidityInput = {
  amountLP: Scalars['Float'];
  poolInput: PoolInput;
};

export enum Resolution {
  Days_1 = 'DAYS_1',
  Hours_1 = 'HOURS_1',
  Hours_4 = 'HOURS_4',
  Minutes_1 = 'MINUTES_1',
  Minutes_5 = 'MINUTES_5',
  Minutes_15 = 'MINUTES_15',
  Seconds_15 = 'SECONDS_15',
  Weeks_1 = 'WEEKS_1'
}

export enum StpActionType {
  CancelAggressive = 'CANCEL_AGGRESSIVE',
  CancelBoth = 'CANCEL_BOTH',
  CancelPassive = 'CANCEL_PASSIVE'
}

export enum Side {
  Buy = 'BUY',
  Sell = 'SELL'
}

export type Subscription = {
  __typename?: 'Subscription';
  addLiquidity: AddLiquidity;
  bar: Bar;
  high24h: High24h;
  lastTradePrice: LastTradePrice;
  low24h: Low24h;
  orderbook: Orderbook;
  removeLiquidity: RemoveLiquidity;
  swap: Swap;
  trade: Trade;
  volume24h: Volume24h;
};


export type SubscriptionAddLiquidityArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionBarArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
  resolution: Resolution;
};


export type SubscriptionHigh24hArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionLastTradePriceArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionLow24hArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionOrderbookArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionRemoveLiquidityArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionSwapArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionTradeArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};


export type SubscriptionVolume24hArgs = {
  marketInputs?: InputMaybe<Array<MarketInput>>;
};

export type SummaryMetrics = {
  __typename?: 'SummaryMetrics';
  dollarTVL: Scalars['Float'];
  dollarVolume7D: Scalars['Float'];
  dollarVolume24H: Scalars['Float'];
  transactions7D: Scalars['Int'];
  transactions24H: Scalars['Int'];
  users7D: Scalars['Int'];
  users24H: Scalars['Int'];
};

export type Swap = {
  __typename?: 'Swap';
  amountIn: Scalars['Float'];
  amountOut: Scalars['Float'];
  coinInfoIn: CoinInfo;
  coinInfoOut: CoinInfo;
  time: Scalars['Timestamp'];
};

export type SwapExactInInput = {
  amountIn: Scalars['Float'];
  coinTypeIn: Scalars['String'];
  poolInput: PoolInput;
  quoteAmountOut: Scalars['Float'];
  slippagePct?: InputMaybe<Scalars['Float']>;
};

export type SwapExactOutInput = {
  amountOut: Scalars['Float'];
  coinTypeOut: Scalars['String'];
  poolInput: PoolInput;
  quoteAmountIn: Scalars['Float'];
  slippagePct?: InputMaybe<Scalars['Float']>;
};

export type Trade = {
  __typename?: 'Trade';
  baseCoinType: Scalars['String'];
  price: Scalars['Float'];
  quantity: Scalars['Float'];
  quoteCoinType: Scalars['String'];
  side: Side;
  time: Scalars['Timestamp'];
  value: Scalars['Float'];
};

export type Transfer = {
  __typename?: 'Transfer';
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
};

export type TransferInput = {
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
  to: Scalars['Address'];
};

export type Volume24h = {
  __typename?: 'Volume24h';
  baseCoinType: Scalars['String'];
  quoteCoinType: Scalars['String'];
  volume: Scalars['Float'];
};

export type Wallet = {
  __typename?: 'Wallet';
  balances: Array<Balance>;
};

export type WithdrawInput = {
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
};

export type Withdrawal = {
  __typename?: 'Withdrawal';
  amount: Scalars['Float'];
  coinType: Scalars['String'];
  from: Scalars['Address'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Account: ResolverTypeWrapper<Account>;
  AddLiquidity: ResolverTypeWrapper<AddLiquidity>;
  AddLiquidityInput: AddLiquidityInput;
  Address: ResolverTypeWrapper<Scalars['Address']>;
  Balance: ResolverTypeWrapper<Balance>;
  Bar: ResolverTypeWrapper<Bar>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CancelOrderInput: CancelOrderInput;
  CoinInfo: ResolverTypeWrapper<CoinInfo>;
  CreateMarketInput: CreateMarketInput;
  CreatePoolInput: CreatePoolInput;
  Deposit: ResolverTypeWrapper<Deposit>;
  DepositInput: DepositInput;
  EntryFunctionPayload: ResolverTypeWrapper<Scalars['EntryFunctionPayload']>;
  FeaturedStatus: FeaturedStatus;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  High24h: ResolverTypeWrapper<High24h>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LastTradePrice: ResolverTypeWrapper<LastTradePrice>;
  Level: ResolverTypeWrapper<Level>;
  Low24h: ResolverTypeWrapper<Low24h>;
  Market: ResolverTypeWrapper<Market>;
  MarketInput: MarketInput;
  Mutation: ResolverTypeWrapper<{}>;
  Ohlcv: ResolverTypeWrapper<Ohlcv>;
  Order: ResolverTypeWrapper<Order>;
  OrderStatus: OrderStatus;
  OrderType: OrderType;
  Orderbook: ResolverTypeWrapper<Orderbook>;
  PlaceOrderInput: PlaceOrderInput;
  Pool: ResolverTypeWrapper<Pool>;
  PoolInput: PoolInput;
  Position: ResolverTypeWrapper<Position>;
  PythRating: ResolverTypeWrapper<PythRating>;
  Query: ResolverTypeWrapper<{}>;
  QuoteExactIn: ResolverTypeWrapper<QuoteExactIn>;
  QuoteExactOut: ResolverTypeWrapper<QuoteExactOut>;
  RatingColor: RatingColor;
  RegisterCoinInput: RegisterCoinInput;
  RegisteredCoinInfo: ResolverTypeWrapper<RegisteredCoinInfo>;
  RemoveLiquidity: ResolverTypeWrapper<RemoveLiquidity>;
  RemoveLiquidityInput: RemoveLiquidityInput;
  Resolution: Resolution;
  STPActionType: StpActionType;
  Side: Side;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  SummaryMetrics: ResolverTypeWrapper<SummaryMetrics>;
  Swap: ResolverTypeWrapper<Swap>;
  SwapExactInInput: SwapExactInInput;
  SwapExactOutInput: SwapExactOutInput;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']>;
  Trade: ResolverTypeWrapper<Trade>;
  Transfer: ResolverTypeWrapper<Transfer>;
  TransferInput: TransferInput;
  Volume24h: ResolverTypeWrapper<Volume24h>;
  Wallet: ResolverTypeWrapper<Wallet>;
  WithdrawInput: WithdrawInput;
  Withdrawal: ResolverTypeWrapper<Withdrawal>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Account: Account;
  AddLiquidity: AddLiquidity;
  AddLiquidityInput: AddLiquidityInput;
  Address: Scalars['Address'];
  Balance: Balance;
  Bar: Bar;
  Boolean: Scalars['Boolean'];
  CancelOrderInput: CancelOrderInput;
  CoinInfo: CoinInfo;
  CreateMarketInput: CreateMarketInput;
  CreatePoolInput: CreatePoolInput;
  Deposit: Deposit;
  DepositInput: DepositInput;
  EntryFunctionPayload: Scalars['EntryFunctionPayload'];
  Float: Scalars['Float'];
  High24h: High24h;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LastTradePrice: LastTradePrice;
  Level: Level;
  Low24h: Low24h;
  Market: Market;
  MarketInput: MarketInput;
  Mutation: {};
  Ohlcv: Ohlcv;
  Order: Order;
  Orderbook: Orderbook;
  PlaceOrderInput: PlaceOrderInput;
  Pool: Pool;
  PoolInput: PoolInput;
  Position: Position;
  PythRating: PythRating;
  Query: {};
  QuoteExactIn: QuoteExactIn;
  QuoteExactOut: QuoteExactOut;
  RegisterCoinInput: RegisterCoinInput;
  RegisteredCoinInfo: RegisteredCoinInfo;
  RemoveLiquidity: RemoveLiquidity;
  RemoveLiquidityInput: RemoveLiquidityInput;
  String: Scalars['String'];
  Subscription: {};
  SummaryMetrics: SummaryMetrics;
  Swap: Swap;
  SwapExactInInput: SwapExactInInput;
  SwapExactOutInput: SwapExactOutInput;
  Timestamp: Scalars['Timestamp'];
  Trade: Trade;
  Transfer: Transfer;
  TransferInput: TransferInput;
  Volume24h: Volume24h;
  Wallet: Wallet;
  WithdrawInput: WithdrawInput;
  Withdrawal: Withdrawal;
};

export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = {
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  balances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType>;
  deposits?: Resolver<Array<ResolversTypes['Deposit']>, ParentType, ContextType>;
  hasAuxAccount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isCoinRegistered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<AccountIsCoinRegisteredArgs, 'coinType'>>;
  openOrders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<AccountOpenOrdersArgs>>;
  orderHistory?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<AccountOrderHistoryArgs>>;
  poolPositions?: Resolver<Array<ResolversTypes['Position']>, ParentType, ContextType, Partial<AccountPoolPositionsArgs>>;
  registeredCoins?: Resolver<Array<ResolversTypes['RegisteredCoinInfo']>, ParentType, ContextType>;
  tradeHistory?: Resolver<Array<ResolversTypes['Trade']>, ParentType, ContextType, Partial<AccountTradeHistoryArgs>>;
  transfers?: Resolver<Array<ResolversTypes['Transfer']>, ParentType, ContextType>;
  walletBalances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType>;
  withdrawals?: Resolver<Array<ResolversTypes['Withdrawal']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddLiquidityResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddLiquidity'] = ResolversParentTypes['AddLiquidity']> = {
  amountAddedX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountAddedY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountMintedLP?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface AddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Address'], any> {
  name: 'Address';
}

export type BalanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = {
  availableBalance?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BarResolvers<ContextType = any, ParentType extends ResolversParentTypes['Bar'] = ResolversParentTypes['Bar']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ohlcv?: Resolver<Maybe<ResolversTypes['Ohlcv']>, ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoinInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['CoinInfo'] = ResolversParentTypes['CoinInfo']> = {
  coinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DepositResolvers<ContextType = any, ParentType extends ResolversParentTypes['Deposit'] = ResolversParentTypes['Deposit']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EntryFunctionPayloadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EntryFunctionPayload'], any> {
  name: 'EntryFunctionPayload';
}

export type High24hResolvers<ContextType = any, ParentType extends ResolversParentTypes['High24h'] = ResolversParentTypes['High24h']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  high?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LastTradePriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['LastTradePrice'] = ResolversParentTypes['LastTradePrice']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LevelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Level'] = ResolversParentTypes['Level']> = {
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Low24hResolvers<ContextType = any, ParentType extends ResolversParentTypes['Low24h'] = ResolversParentTypes['Low24h']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  low?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MarketResolvers<ContextType = any, ParentType extends ResolversParentTypes['Market'] = ResolversParentTypes['Market']> = {
  bars?: Resolver<Array<ResolversTypes['Bar']>, ParentType, ContextType, RequireFields<MarketBarsArgs, 'resolution'>>;
  baseCoinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  high24h?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  isRoundLot?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MarketIsRoundLotArgs, 'quantity'>>;
  isRoundTick?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MarketIsRoundTickArgs, 'quantity'>>;
  lastTradePrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lotSize?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lotSizeDecimals?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lotSizeString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  low24h?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  openOrders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<MarketOpenOrdersArgs>>;
  orderHistory?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<MarketOrderHistoryArgs>>;
  orderbook?: Resolver<ResolversTypes['Orderbook'], ParentType, ContextType>;
  pythRating?: Resolver<Maybe<ResolversTypes['PythRating']>, ParentType, ContextType, RequireFields<MarketPythRatingArgs, 'price' | 'side'>>;
  quoteCoinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  tickSize?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  tickSizeDecimals?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tickSizeString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tradeHistory?: Resolver<Array<ResolversTypes['Trade']>, ParentType, ContextType, Partial<MarketTradeHistoryArgs>>;
  volume24h?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addLiquidity?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationAddLiquidityArgs, 'addLiquidityInput'>>;
  addLiquidityWithAccount?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationAddLiquidityWithAccountArgs, 'addLiquidityInput'>>;
  cancelOrder?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCancelOrderArgs, 'cancelOrderInput'>>;
  createAuxAccount?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType>;
  createMarket?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCreateMarketArgs, 'createMarketInput'>>;
  createPool?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCreatePoolArgs, 'createPoolInput'>>;
  deposit?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationDepositArgs, 'depositInput'>>;
  placeOrder?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationPlaceOrderArgs, 'placeOrderInput'>>;
  registerCoin?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationRegisterCoinArgs, 'registerCoinInput'>>;
  removeLiquidity?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationRemoveLiquidityArgs, 'removeLiquidityInput'>>;
  removeLiquidityWithAccount?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationRemoveLiquidityWithAccountArgs, 'removeLiquidityInput'>>;
  swapExactIn?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationSwapExactInArgs, 'swapExactInInput'>>;
  swapExactOut?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationSwapExactOutArgs, 'swapExactOutInput'>>;
  transfer?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationTransferArgs, 'transferInput'>>;
  withdraw?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationWithdrawArgs, 'withdrawInput'>>;
};

export type OhlcvResolvers<ContextType = any, ParentType extends ResolversParentTypes['Ohlcv'] = ResolversParentTypes['Ohlcv']> = {
  close?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  high?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  low?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  open?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']> = {
  auxBurned?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderStatus?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  orderType?: Resolver<ResolversTypes['OrderType'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  side?: Resolver<ResolversTypes['Side'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderbookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Orderbook'] = ResolversParentTypes['Orderbook']> = {
  asks?: Resolver<Array<ResolversTypes['Level']>, ParentType, ContextType>;
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bids?: Resolver<Array<ResolversTypes['Level']>, ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PoolResolvers<ContextType = any, ParentType extends ResolversParentTypes['Pool'] = ResolversParentTypes['Pool']> = {
  adds?: Resolver<Array<ResolversTypes['AddLiquidity']>, ParentType, ContextType, Partial<PoolAddsArgs>>;
  amountLP?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinInfoLP?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoX?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoY?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  featuredStatus?: Resolver<ResolversTypes['FeaturedStatus'], ParentType, ContextType>;
  feePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Position']>, ParentType, ContextType, RequireFields<PoolPositionArgs, 'owner'>>;
  priceX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteExactIn?: Resolver<ResolversTypes['QuoteExactIn'], ParentType, ContextType, RequireFields<PoolQuoteExactInArgs, 'amountIn' | 'coinTypeIn'>>;
  quoteExactOut?: Resolver<ResolversTypes['QuoteExactOut'], ParentType, ContextType, RequireFields<PoolQuoteExactOutArgs, 'amountOut' | 'coinTypeOut'>>;
  removes?: Resolver<Array<ResolversTypes['RemoveLiquidity']>, ParentType, ContextType, Partial<PoolRemovesArgs>>;
  swaps?: Resolver<Array<ResolversTypes['Swap']>, ParentType, ContextType, Partial<PoolSwapsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PositionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Position'] = ResolversParentTypes['Position']> = {
  amountLP?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinInfoLP?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoX?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoY?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  share?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PythRatingResolvers<ContextType = any, ParentType extends ResolversParentTypes['PythRating'] = ResolversParentTypes['PythRating']> = {
  color?: Resolver<ResolversTypes['RatingColor'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryAccountArgs, 'owner'>>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  coins?: Resolver<Array<ResolversTypes['CoinInfo']>, ParentType, ContextType>;
  market?: Resolver<Maybe<ResolversTypes['Market']>, ParentType, ContextType, RequireFields<QueryMarketArgs, 'marketInput'>>;
  markets?: Resolver<Array<ResolversTypes['Market']>, ParentType, ContextType, Partial<QueryMarketsArgs>>;
  pool?: Resolver<Maybe<ResolversTypes['Pool']>, ParentType, ContextType, RequireFields<QueryPoolArgs, 'poolInput'>>;
  pools?: Resolver<Array<ResolversTypes['Pool']>, ParentType, ContextType, Partial<QueryPoolsArgs>>;
  summaryMetrics?: Resolver<ResolversTypes['SummaryMetrics'], ParentType, ContextType>;
};

export type QuoteExactInResolvers<ContextType = any, ParentType extends ResolversParentTypes['QuoteExactIn'] = ResolversParentTypes['QuoteExactIn']> = {
  expectedAmountOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  feeAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  feeAmountDollars?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  feeCurrency?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  minAmountOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceImpactPct?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceImpactRating?: Resolver<ResolversTypes['RatingColor'], ParentType, ContextType>;
  priceIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  pythRating?: Resolver<Maybe<ResolversTypes['PythRating']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuoteExactOutResolvers<ContextType = any, ParentType extends ResolversParentTypes['QuoteExactOut'] = ResolversParentTypes['QuoteExactOut']> = {
  expectedAmountIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  feeCurrency?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  maxAmountIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  maxFeeAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  maxFeeAmountDollars?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  priceImpactPct?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceImpactRating?: Resolver<ResolversTypes['RatingColor'], ParentType, ContextType>;
  priceIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  pythRating?: Resolver<Maybe<ResolversTypes['PythRating']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RegisteredCoinInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['RegisteredCoinInfo'] = ResolversParentTypes['RegisteredCoinInfo']> = {
  coinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  registered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemoveLiquidityResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveLiquidity'] = ResolversParentTypes['RemoveLiquidity']> = {
  amountBurnedLP?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountRemovedX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountRemovedY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  addLiquidity?: SubscriptionResolver<ResolversTypes['AddLiquidity'], "addLiquidity", ParentType, ContextType, Partial<SubscriptionAddLiquidityArgs>>;
  bar?: SubscriptionResolver<ResolversTypes['Bar'], "bar", ParentType, ContextType, RequireFields<SubscriptionBarArgs, 'resolution'>>;
  high24h?: SubscriptionResolver<ResolversTypes['High24h'], "high24h", ParentType, ContextType, Partial<SubscriptionHigh24hArgs>>;
  lastTradePrice?: SubscriptionResolver<ResolversTypes['LastTradePrice'], "lastTradePrice", ParentType, ContextType, Partial<SubscriptionLastTradePriceArgs>>;
  low24h?: SubscriptionResolver<ResolversTypes['Low24h'], "low24h", ParentType, ContextType, Partial<SubscriptionLow24hArgs>>;
  orderbook?: SubscriptionResolver<ResolversTypes['Orderbook'], "orderbook", ParentType, ContextType, Partial<SubscriptionOrderbookArgs>>;
  removeLiquidity?: SubscriptionResolver<ResolversTypes['RemoveLiquidity'], "removeLiquidity", ParentType, ContextType, Partial<SubscriptionRemoveLiquidityArgs>>;
  swap?: SubscriptionResolver<ResolversTypes['Swap'], "swap", ParentType, ContextType, Partial<SubscriptionSwapArgs>>;
  trade?: SubscriptionResolver<ResolversTypes['Trade'], "trade", ParentType, ContextType, Partial<SubscriptionTradeArgs>>;
  volume24h?: SubscriptionResolver<ResolversTypes['Volume24h'], "volume24h", ParentType, ContextType, Partial<SubscriptionVolume24hArgs>>;
};

export type SummaryMetricsResolvers<ContextType = any, ParentType extends ResolversParentTypes['SummaryMetrics'] = ResolversParentTypes['SummaryMetrics']> = {
  dollarTVL?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dollarVolume7D?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dollarVolume24H?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  transactions7D?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactions24H?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  users7D?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  users24H?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SwapResolvers<ContextType = any, ParentType extends ResolversParentTypes['Swap'] = ResolversParentTypes['Swap']> = {
  amountIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinInfoIn?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoOut?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Trade'] = ResolversParentTypes['Trade']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  side?: Resolver<ResolversTypes['Side'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransferResolvers<ContextType = any, ParentType extends ResolversParentTypes['Transfer'] = ResolversParentTypes['Transfer']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Volume24hResolvers<ContextType = any, ParentType extends ResolversParentTypes['Volume24h'] = ResolversParentTypes['Volume24h']> = {
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WalletResolvers<ContextType = any, ParentType extends ResolversParentTypes['Wallet'] = ResolversParentTypes['Wallet']> = {
  balances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WithdrawalResolvers<ContextType = any, ParentType extends ResolversParentTypes['Withdrawal'] = ResolversParentTypes['Withdrawal']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>;
  AddLiquidity?: AddLiquidityResolvers<ContextType>;
  Address?: GraphQLScalarType;
  Balance?: BalanceResolvers<ContextType>;
  Bar?: BarResolvers<ContextType>;
  CoinInfo?: CoinInfoResolvers<ContextType>;
  Deposit?: DepositResolvers<ContextType>;
  EntryFunctionPayload?: GraphQLScalarType;
  High24h?: High24hResolvers<ContextType>;
  LastTradePrice?: LastTradePriceResolvers<ContextType>;
  Level?: LevelResolvers<ContextType>;
  Low24h?: Low24hResolvers<ContextType>;
  Market?: MarketResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Ohlcv?: OhlcvResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  Orderbook?: OrderbookResolvers<ContextType>;
  Pool?: PoolResolvers<ContextType>;
  Position?: PositionResolvers<ContextType>;
  PythRating?: PythRatingResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QuoteExactIn?: QuoteExactInResolvers<ContextType>;
  QuoteExactOut?: QuoteExactOutResolvers<ContextType>;
  RegisteredCoinInfo?: RegisteredCoinInfoResolvers<ContextType>;
  RemoveLiquidity?: RemoveLiquidityResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SummaryMetrics?: SummaryMetricsResolvers<ContextType>;
  Swap?: SwapResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  Trade?: TradeResolvers<ContextType>;
  Transfer?: TransferResolvers<ContextType>;
  Volume24h?: Volume24hResolvers<ContextType>;
  Wallet?: WalletResolvers<ContextType>;
  Withdrawal?: WithdrawalResolvers<ContextType>;
};
