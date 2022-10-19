import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
};

export type Account = {
  __typename?: 'Account';
  address: Scalars['Address'];
  balances: Array<Balance>;
  deposits: Array<Deposit>;
  isCoinRegistered: Scalars['Boolean'];
  openOrders: Array<Order>;
  orderHistory: Array<Order>;
  poolPositions: Array<Position>;
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
  time: Scalars['String'];
};

export type AddLiquidityInput = {
  amountX: Scalars['Float'];
  amountY: Scalars['Float'];
  poolInput: PoolInput;
};

export type Balance = {
  __typename?: 'Balance';
  availableBalance: Scalars['Float'];
  balance: Scalars['Float'];
  coinInfo: CoinInfo;
};

export type Bar = {
  __typename?: 'Bar';
  ohlcv?: Maybe<Ohlcv>;
  time: Scalars['String'];
};

export type CancelOrderInput = {
  marketInput: MarketInput;
  orderId: Scalars['ID'];
  sender: Scalars['Address'];
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
  feePercent: Scalars['Float'];
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

export type Level = {
  __typename?: 'Level';
  price: Scalars['Float'];
  quantity: Scalars['Float'];
};

export type Market = {
  __typename?: 'Market';
  bars: Array<Bar>;
  barsForRange: Array<Bar>;
  baseCoinInfo: CoinInfo;
  high24h?: Maybe<Scalars['Float']>;
  isRoundLot: Scalars['Boolean'];
  isRoundTick: Scalars['Boolean'];
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
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  resolution: Resolution;
};


export type MarketBarsForRangeArgs = {
  countBack: Scalars['String'];
  firstDataRequest: Scalars['Boolean'];
  fromEpochMillisInclusive: Scalars['String'];
  resolution: Resolution;
  toEpochMillisExclusive: Scalars['String'];
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
  cancelOrder: Scalars['EntryFunctionPayload'];
  createAuxAccount: Scalars['EntryFunctionPayload'];
  createMarket: Scalars['EntryFunctionPayload'];
  createPool: Scalars['EntryFunctionPayload'];
  deposit: Scalars['EntryFunctionPayload'];
  placeOrder: Scalars['EntryFunctionPayload'];
  registerCoin: Scalars['EntryFunctionPayload'];
  removeLiquidity: Scalars['EntryFunctionPayload'];
  swap: Scalars['EntryFunctionPayload'];
  transfer: Scalars['EntryFunctionPayload'];
  withdraw: Scalars['EntryFunctionPayload'];
};


export type MutationAddLiquidityArgs = {
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


export type MutationSwapArgs = {
  swapInput: SwapInput;
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
  time: Scalars['String'];
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
  bids: Array<Level>;
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
  feePercent: Scalars['Float'];
  position?: Maybe<Position>;
  priceIn?: Maybe<Scalars['Float']>;
  priceOut?: Maybe<Scalars['Float']>;
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


export type PoolPriceInArgs = {
  amount: Scalars['Float'];
  coinTypeIn: Scalars['String'];
};


export type PoolPriceOutArgs = {
  amount: Scalars['Float'];
  coinTypeOut: Scalars['String'];
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
  color: PythRatingColor;
  price: Scalars['Float'];
};

export enum PythRatingColor {
  Green = 'GREEN',
  Red = 'RED',
  Yellow = 'YELLOW'
}

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  address: Scalars['Address'];
  market?: Maybe<Market>;
  marketCoins: Array<CoinInfo>;
  markets: Array<Market>;
  pool?: Maybe<Pool>;
  poolCoins: Array<CoinInfo>;
  pools: Array<Pool>;
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

export type RegisterCoinInput = {
  coinType: Scalars['String'];
};

export type RemoveLiquidity = {
  __typename?: 'RemoveLiquidity';
  amountBurnedLP: Scalars['Float'];
  amountRemovedX: Scalars['Float'];
  amountRemovedY: Scalars['Float'];
  time: Scalars['String'];
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
  addLiquidity?: Maybe<AddLiquidity>;
  lastTradePrice: Scalars['Float'];
  orderbook?: Maybe<Orderbook>;
  removeLiquidity?: Maybe<RemoveLiquidity>;
  swap?: Maybe<Swap>;
  trade?: Maybe<Trade>;
};


export type SubscriptionAddLiquidityArgs = {
  poolInputs?: InputMaybe<Array<PoolInput>>;
};


export type SubscriptionLastTradePriceArgs = {
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

export type Swap = {
  __typename?: 'Swap';
  amountIn: Scalars['Float'];
  amountOut: Scalars['Float'];
  coinInfoIn: CoinInfo;
  coinInfoOut: CoinInfo;
  time: Scalars['String'];
};

export type SwapInput = {
  amountIn: Scalars['Float'];
  coinTypeIn: Scalars['String'];
  coinTypeOut: Scalars['String'];
  minAmountOut: Scalars['Float'];
  poolInput: PoolInput;
};

export type Trade = {
  __typename?: 'Trade';
  auxBurned: Scalars['Float'];
  baseCoinType: Scalars['String'];
  orderId: Scalars['ID'];
  owner: Scalars['Address'];
  price: Scalars['Float'];
  quantity: Scalars['Float'];
  quoteCoinType: Scalars['String'];
  side: Side;
  time: Scalars['String'];
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
  ClobSubscription: ResolverTypeWrapper<ClobSubscription>;
  CoinInfo: ResolverTypeWrapper<CoinInfo>;
  CreateMarketInput: CreateMarketInput;
  CreatePoolInput: CreatePoolInput;
  Deposit: ResolverTypeWrapper<Deposit>;
  DepositInput: DepositInput;
  EntryFunctionPayload: ResolverTypeWrapper<Scalars['EntryFunctionPayload']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Level: ResolverTypeWrapper<Level>;
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
  PythRatingColor: PythRatingColor;
  Query: ResolverTypeWrapper<{}>;
  RegisterCoinInput: RegisterCoinInput;
  RemoveLiquidity: ResolverTypeWrapper<RemoveLiquidity>;
  RemoveLiquidityInput: RemoveLiquidityInput;
  Resolution: Resolution;
  STPActionType: StpActionType;
  Side: Side;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Swap: ResolverTypeWrapper<Swap>;
  SwapInput: SwapInput;
  Trade: ResolverTypeWrapper<Trade>;
  Transfer: ResolverTypeWrapper<Transfer>;
  TransferInput: TransferInput;
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
  ClobSubscription: ClobSubscription;
  CoinInfo: CoinInfo;
  CreateMarketInput: CreateMarketInput;
  CreatePoolInput: CreatePoolInput;
  Deposit: Deposit;
  DepositInput: DepositInput;
  EntryFunctionPayload: Scalars['EntryFunctionPayload'];
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Level: Level;
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
  RegisterCoinInput: RegisterCoinInput;
  RemoveLiquidity: RemoveLiquidity;
  RemoveLiquidityInput: RemoveLiquidityInput;
  String: Scalars['String'];
  Subscription: {};
  Swap: Swap;
  SwapInput: SwapInput;
  Trade: Trade;
  Transfer: Transfer;
  TransferInput: TransferInput;
  Wallet: Wallet;
  WithdrawInput: WithdrawInput;
  Withdrawal: Withdrawal;
};

export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = {
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  balances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType>;
  deposits?: Resolver<Array<ResolversTypes['Deposit']>, ParentType, ContextType>;
  isCoinRegistered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<AccountIsCoinRegisteredArgs, 'coinType'>>;
  openOrders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<AccountOpenOrdersArgs>>;
  orderHistory?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType, Partial<AccountOrderHistoryArgs>>;
  poolPositions?: Resolver<Array<ResolversTypes['Position']>, ParentType, ContextType, Partial<AccountPoolPositionsArgs>>;
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
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface AddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Address'], any> {
  name: 'Address';
}

export type BalanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = {
  availableBalance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BarResolvers<ContextType = any, ParentType extends ResolversParentTypes['Bar'] = ResolversParentTypes['Bar']> = {
  ohlcv?: Resolver<Maybe<ResolversTypes['Ohlcv']>, ParentType, ContextType>;
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClobSubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClobSubscription'] = ResolversParentTypes['ClobSubscription']> = {
  orderbook?: Resolver<ResolversTypes['Orderbook'], ParentType, ContextType, RequireFields<ClobSubscriptionOrderbookArgs, 'marketInput'>>;
  trades?: Resolver<ResolversTypes['Trade'], ParentType, ContextType, RequireFields<ClobSubscriptionTradesArgs, 'marketInput'>>;
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

export type LevelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Level'] = ResolversParentTypes['Level']> = {
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MarketResolvers<ContextType = any, ParentType extends ResolversParentTypes['Market'] = ResolversParentTypes['Market']> = {
  bars?: Resolver<Array<ResolversTypes['Bar']>, ParentType, ContextType, RequireFields<MarketBarsArgs, 'resolution'>>;
  barsForRange?: Resolver<Array<ResolversTypes['Bar']>, ParentType, ContextType, RequireFields<MarketBarsForRangeArgs, 'countBack' | 'firstDataRequest' | 'fromEpochMillisInclusive' | 'resolution' | 'toEpochMillisExclusive'>>;
  baseCoinInfo?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  high24h?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  isRoundLot?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MarketIsRoundLotArgs, 'quantity'>>;
  isRoundTick?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MarketIsRoundTickArgs, 'quantity'>>;
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
  cancelOrder?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCancelOrderArgs, 'cancelOrderInput'>>;
  createAuxAccount?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType>;
  createMarket?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCreateMarketArgs, 'createMarketInput'>>;
  createPool?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationCreatePoolArgs, 'createPoolInput'>>;
  deposit?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationDepositArgs, 'depositInput'>>;
  placeOrder?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationPlaceOrderArgs, 'placeOrderInput'>>;
  registerCoin?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationRegisterCoinArgs, 'registerCoinInput'>>;
  removeLiquidity?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationRemoveLiquidityArgs, 'removeLiquidityInput'>>;
  swap?: Resolver<ResolversTypes['EntryFunctionPayload'], ParentType, ContextType, RequireFields<MutationSwapArgs, 'swapInput'>>;
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
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderbookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Orderbook'] = ResolversParentTypes['Orderbook']> = {
  asks?: Resolver<Array<ResolversTypes['Level']>, ParentType, ContextType>;
  bids?: Resolver<Array<ResolversTypes['Level']>, ParentType, ContextType>;
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
  feePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Position']>, ParentType, ContextType, RequireFields<PoolPositionArgs, 'owner'>>;
  priceIn?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType, RequireFields<PoolPriceInArgs, 'amount' | 'coinTypeIn'>>;
  priceOut?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType, RequireFields<PoolPriceOutArgs, 'amount' | 'coinTypeOut'>>;
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
  color?: Resolver<ResolversTypes['PythRatingColor'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryAccountArgs, 'owner'>>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  market?: Resolver<Maybe<ResolversTypes['Market']>, ParentType, ContextType, RequireFields<QueryMarketArgs, 'marketInput'>>;
  marketCoins?: Resolver<Array<ResolversTypes['CoinInfo']>, ParentType, ContextType>;
  markets?: Resolver<Array<ResolversTypes['Market']>, ParentType, ContextType, Partial<QueryMarketsArgs>>;
  pool?: Resolver<Maybe<ResolversTypes['Pool']>, ParentType, ContextType, RequireFields<QueryPoolArgs, 'poolInput'>>;
  poolCoins?: Resolver<Array<ResolversTypes['CoinInfo']>, ParentType, ContextType>;
  pools?: Resolver<Array<ResolversTypes['Pool']>, ParentType, ContextType, Partial<QueryPoolsArgs>>;
};

export type RemoveLiquidityResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveLiquidity'] = ResolversParentTypes['RemoveLiquidity']> = {
  amountBurnedLP?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountRemovedX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountRemovedY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  addLiquidity?: SubscriptionResolver<Maybe<ResolversTypes['AddLiquidity']>, "addLiquidity", ParentType, ContextType, Partial<SubscriptionAddLiquidityArgs>>;
  lastTradePrice?: SubscriptionResolver<ResolversTypes['Float'], "lastTradePrice", ParentType, ContextType, Partial<SubscriptionLastTradePriceArgs>>;
  orderbook?: SubscriptionResolver<Maybe<ResolversTypes['Orderbook']>, "orderbook", ParentType, ContextType, Partial<SubscriptionOrderbookArgs>>;
  removeLiquidity?: SubscriptionResolver<Maybe<ResolversTypes['RemoveLiquidity']>, "removeLiquidity", ParentType, ContextType, Partial<SubscriptionRemoveLiquidityArgs>>;
  swap?: SubscriptionResolver<Maybe<ResolversTypes['Swap']>, "swap", ParentType, ContextType, Partial<SubscriptionSwapArgs>>;
  trade?: SubscriptionResolver<Maybe<ResolversTypes['Trade']>, "trade", ParentType, ContextType, Partial<SubscriptionTradeArgs>>;
};

export type SwapResolvers<ContextType = any, ParentType extends ResolversParentTypes['Swap'] = ResolversParentTypes['Swap']> = {
  amountIn?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  amountOut?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  coinInfoIn?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  coinInfoOut?: Resolver<ResolversTypes['CoinInfo'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Trade'] = ResolversParentTypes['Trade']> = {
  auxBurned?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  baseCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quoteCoinType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  side?: Resolver<ResolversTypes['Side'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  ClobSubscription?: ClobSubscriptionResolvers<ContextType>;
  CoinInfo?: CoinInfoResolvers<ContextType>;
  Deposit?: DepositResolvers<ContextType>;
  EntryFunctionPayload?: GraphQLScalarType;
  Level?: LevelResolvers<ContextType>;
  Market?: MarketResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Ohlcv?: OhlcvResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  Orderbook?: OrderbookResolvers<ContextType>;
  Pool?: PoolResolvers<ContextType>;
  Position?: PositionResolvers<ContextType>;
  PythRating?: PythRatingResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RemoveLiquidity?: RemoveLiquidityResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Swap?: SwapResolvers<ContextType>;
  Trade?: TradeResolvers<ContextType>;
  Transfer?: TransferResolvers<ContextType>;
  Wallet?: WalletResolvers<ContextType>;
  Withdrawal?: WithdrawalResolvers<ContextType>;
};

