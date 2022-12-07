import {
  AptosAccount,
  AptosClient,
  FaucetClient,
  HexString,
  MaybeHexString,
  TxnBuilderTypes,
  Types,
  WaitForTransactionError,
} from "aptos";
import BN from "bn.js";
import * as SHA3 from "js-sha3";

import _ from "lodash";
import { APTOS_COIN_TYPE, FakeCoin } from "./coin";
import { AptosNetwork, AuxEnv } from "./env";
import { ConstantProductClient } from "./pool/constant-product/client";
import type { ConstantProductInput } from "./pool/constant-product/schema";
import Router from "./router/dsl/router";
import { AnyUnits, AtomicUnits, AU, DecimalUnits } from "./units";

/**
 * AuxClient
 *
 * A fully-featured Typescript client for interacting with AUX exchange.
 *
 * const auxClient = new AuxClient("mainnet", new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1"))
 *
 * // make sure to set a sender
 * auxClient.sender = AptosAccount.fromAptosAccountObject({ privateKeyHex: "0xAUX" })
 *
 * const auxClient = new AuxClient("devnet", new AptosClient("https://fullnode.devnet.aptoslabs.com/v1"))
 * auxClient.sender = AptosAccount.fromAptosAccountObject({ privateKeyHex: "0xAUXDEVNET" })
 *
 * // use your own Full Node
 * const auxClient = new AuxClient("mainnet", new AptosClient("http://localhost:8080"))
 *
 * See the `AuxEnv` class in `env.ts` for a way to create `AuxClient` from environment variables.
 * This might be useful, if you want to pull in your keys from your environment.
 *
 */
export class AuxClient {
  moduleAddress: Types.Address;
  moduleAuthority: AptosAccount | undefined;
  simulator: Simulator;

  // Options to apply on every tx. Can be overwritten when making individual calls.
  options: Partial<AuxClientOptions>;

  // Internal state.
  coinInfo: Map<Types.MoveStructTag, CoinInfo>;
  vaults: Map<Types.Address, HexString>;

  constructor(
    readonly aptosNetwork: AptosNetwork,
    readonly aptosClient: AptosClient,
    readonly faucetClient?: FaucetClient
  ) {
    this.options = {};
    this.coinInfo = new Map();
    this.vaults = new Map();

    switch (aptosNetwork) {
      case "mainnet":
        this.moduleAddress =
          "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541";
        this.simulator = {
          address:
            "0x73daac91bd205cec351524974cfae156985f947e07d55f2acfcb38981fdb8898",
          publicKey: toEd25519PublicKey(
            "0xa257c3a9f8c0316326681fc525c038886e39b3495c99bb28e1bca01ff6216634"
          ),
        };
        break;
      case "testnet":
        this.moduleAddress =
          "0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53";
        this.simulator = {
          address:
            "0x490d9592c7f246ecd5eef80e0e5592fef813d0adb43b26dbedc0d045282c36b8",
          publicKey: toEd25519PublicKey(
            "0x5252282e6fd74873a1a777e707496919cb118fb65ba46e5271ebd4c2af716a28"
          ),
        };
        break;
      case "devnet":
        this.moduleAddress =
          "0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a";
        this.simulator = {
          address:
            "0x84f372536c73df84327d2af63992f4443e2bd1aec8695fa85693e256fc1f904f",
          publicKey: toEd25519PublicKey(
            "0x2a27ecf198ff20db2634c43177e0d492df63105fa7106706b91a22dc42797d88"
          ),
        };
        break;
      case "local":
      case "custom":
        const profile = new AuxEnv().aptosProfile;
        if (_.isUndefined(profile)) {
          throw new Error(
            "Failed to create localnet AuxClient: " +
              `Could not find required profile ${profile} in ~/.aptos/config.yaml`
          );
        }
        for (const [key, value] of Object.entries(profile)) {
          if (_.isUndefined(value)) {
            throw new Error(
              "Failed to create localnet AuxClient: " +
                `Missing required key ${key} on profile ${profile} in ~/.aptos/config.yaml`
            );
          }
        }
        const moduleAuthority = AptosAccount.fromAptosAccountObject({
          privateKeyHex: profile.private_key!,
        });
        this.moduleAddress = deriveModuleAddress(moduleAuthority);
        this.moduleAuthority = moduleAuthority;
        this.simulator = {
          address: profile.account!,
          publicKey: toEd25519PublicKey(profile.public_key!),
        };
        break;
      default:
        const exhaustiveCheck: never = aptosNetwork;
        throw new Error(exhaustiveCheck);
    }
  }

  get sender(): AptosAccount | undefined {
    return this.options.sender;
  }

  set sender(newSender: AptosAccount | undefined) {
    if (_.isUndefined(newSender)) {
      delete this.options["sender"];
    } else {
      this.options.sender = newSender;
    }
  }

  get simulate(): boolean | undefined {
    return this.options.simulate;
  }

  set simulate(newSimulate: boolean | undefined) {
    if (_.isUndefined(newSimulate)) {
      delete this.options["simulate"];
    } else {
      this.options.simulate = newSimulate;
    }
  }

  constantProduct(poolInput: ConstantProductInput): ConstantProductClient {
    return new ConstantProductClient(this, poolInput);
  }

  async pools(): Promise<ConstantProductInput[]> {
    const resources = await this.aptosClient.getAccountResources(
      this.moduleAddress
    );
    return resources
      .filter((resource) =>
        resource.type.startsWith(`${this.moduleAddress}::amm::Pool`)
      )
      .map((resource) => resource.type)
      .map(parsePoolType);
  }

  async stakePools(): Promise<ConstantProductInput[]> {
    const resources = await this.aptosClient.getAccountResources(
      this.moduleAddress
    );
    return resources
      .filter((resource) =>
        resource.type.startsWith(`${this.moduleAddress}::stake::Pool`)
      )
      .map((resource) => resource.type)
      .map(parsePoolType);
  }

  /**
   * Queries for the account resource. Returns undefined if it doesn't exist.
   */
  async getAccountResourceOptional(
    accountAddress: MaybeHexString,
    resourceType: Types.MoveStructTag,
    query?: { ledgerVersion?: bigint | number }
  ): Promise<Types.MoveResource | undefined> {
    try {
      return await this.aptosClient.getAccountResource(
        accountAddress,
        resourceType,
        query
      );
    } catch (err: any) {
      if (err?.status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  /**
   * Returns all events since a given sequence range. The arguments are
   * otherwise the same as aptosClient.getEventsByEventHandle.
   */
  async getEventsByEventHandleRange(
    address: MaybeHexString,
    eventHandleStruct: Types.MoveStructTag,
    fieldName: string,
    firstSequenceNumber: BN,
    lastSequenceNumber: BN
  ): Promise<Types.Event[]> {
    const allEvents = [];
    for (
      let s = firstSequenceNumber;
      s.lt(lastSequenceNumber);
      s = s.addn(100)
    ) {
      const distance = lastSequenceNumber.sub(s);
      const limit = distance.ltn(100) ? distance.toNumber() : 100;
      const events = await this.aptosClient.getEventsByEventHandle(
        address,
        eventHandleStruct,
        fieldName,
        {
          start: BigInt(s.toString()),
          limit,
        }
      );
      allEvents.push(...events);
    }
    return allEvents;
  }

  /**
   * Returns all events since a given sequence number. Defaults to returning all
   * events since the beginning of time, which may be expensive. The arguments
   * are otherwise the same as aptosClient.getEventsByEventHandle.
   */
  async getEventsByEventHandleSince(
    address: MaybeHexString,
    eventHandleStruct: Types.MoveStructTag,
    fieldName: string,
    firstSequenceNumber?: BN
  ): Promise<Types.Event[]> {
    firstSequenceNumber = firstSequenceNumber ?? new BN(0);
    const allEvents = [];

    const tailEvents = (
      await this.aptosClient.getEventsByEventHandle(
        address,
        eventHandleStruct,
        fieldName,
        {
          limit: 100,
        }
      )
    ).filter((ev) => new BN(ev.sequence_number).gte(firstSequenceNumber!));

    if (tailEvents.length > 0) {
      const firstEventSequenceNumber = new BN(tailEvents[0]!.sequence_number);

      allEvents.push(
        ...(await this.getEventsByEventHandleRange(
          address,
          eventHandleStruct,
          fieldName,
          firstSequenceNumber,
          firstEventSequenceNumber
        ))
      );
    }

    allEvents.push(...tailEvents);
    return allEvents;
  }

  /**
   * Returns all recent events with a lookback defaulting to one RPC call.
   */
  async getEventsByEventHandleWithLookback(
    address: MaybeHexString,
    eventHandleStruct: Types.MoveStructTag,
    fieldName: string,
    maxLookback?: BN
  ): Promise<Types.Event[]> {
    maxLookback = maxLookback ?? new BN(100);
    const allEvents = [];

    const tailEvents = await this.aptosClient.getEventsByEventHandle(
      address,
      eventHandleStruct,
      fieldName,
      {
        limit: maxLookback.gtn(100) ? 100 : maxLookback.toNumber(),
      }
    );

    if (tailEvents.length > 0) {
      const firstEventSequenceNumber = new BN(tailEvents[0]!.sequence_number);
      let remainderToQuery = maxLookback.subn(tailEvents.length);

      // If we got 2 and have 1 more to go, query starting at 1.
      // If we got 2 and have 2 more to go, query starting at 0.
      // If we got 2 and have 3 more to go, query starting at 0.
      const firstSequenceNumberToQuery = firstEventSequenceNumber.gt(
        remainderToQuery
      )
        ? firstEventSequenceNumber.sub(remainderToQuery)
        : new BN(0);

      allEvents.push(
        ...(await this.getEventsByEventHandleRange(
          address,
          eventHandleStruct,
          fieldName,
          firstSequenceNumberToQuery,
          firstEventSequenceNumber
        ))
      );
    }
    allEvents.push(...tailEvents);
    return allEvents;
  }

  /**
   * Returns the vault address for the given account, or undefined if the vault
   * hasn't been created yet.
   */
  async getVaultAddress(account: HexString): Promise<HexString | undefined> {
    const got = this.vaults.get(account.toShortString());
    if (got !== undefined) {
      return got;
    }
    const type = `${this.moduleAddress}::onchain_signer::OnchainSigner`;
    const signer = await this.getAccountResourceOptional(account, type);
    if (signer === undefined) {
      return undefined;
    }
    const signerHex = new HexString((signer.data as any).account_address);
    this.vaults.set(account.toShortString(), signerHex);
    return signerHex;
  }

  /**
   * @returns full type of AuxCoin, the protocol token
   */
  getAuxCoin(): Types.MoveStructTag {
    return `${this.moduleAddress}::aux_coin::AuxCoin`;
  }

  /**
   * @returns balance of given coin type in atomic units
   */
  async getCoinBalance({
    account,
    coinType,
  }: {
    account: HexString;
    coinType: Types.MoveStructTag;
  }): Promise<AtomicUnits> {
    const coinResource = await this.getAccountResourceOptional(
      account,
      `0x1::coin::CoinStore<${coinType}>`
    );
    if (coinResource === undefined) {
      return AU(0);
    }
    const coinBalance = (coinResource.data as any).coin.value;
    return AU(coinBalance);
  }

  /**
   * @returns balance of given coin type in decimal units
   */
  async getCoinBalanceDecimals({
    account,
    coinType,
  }: {
    account: HexString;
    coinType: Types.MoveStructTag;
  }): Promise<DecimalUnits> {
    const auBalance = await this.getCoinBalance({ account, coinType });
    return auBalance.toDecimalUnits(
      (await this.getCoinInfo(coinType)).decimals
    );
  }

  /**
   * @returns information about the given coin type. In particular, this
   * includes decimals and supply.
   */
  async getCoinInfo(
    coinType: Types.MoveStructTag,
    refresh?: boolean
  ): Promise<CoinInfo> {
    const got = this.coinInfo.get(coinType);
    if ((refresh === undefined || !refresh) && got !== undefined) {
      return got;
    }

    const coinTypeModuleAddress = coinType.split("::")[0]!;
    const coinInfo = (await this.aptosClient.getAccountResource(
      coinTypeModuleAddress,
      `0x1::coin::CoinInfo<${coinType}>`
    )) as any as RawCoinInfo;
    const parsed = {
      coinType: coinType,
      decimals: coinInfo.data.decimals,
      name: coinInfo.data.name,
      supply: coinInfo.data.supply.vec,
      symbol: coinInfo.data.symbol,
    };
    this.coinInfo.set(coinType, parsed);
    return parsed;
  }

  /**
   * Calls the faucet client to fund atomic or decimal units of native token to the target address.
   * Returns the transaction hash on success.
   */
  async fundAccount({
    account,
    quantity,
  }: {
    account: MaybeHexString;
    quantity: AnyUnits;
  }): Promise<string[]> {
    if (_.isUndefined(this.faucetClient)) {
      throw new AuxClientError("not configured with faucet");
    }
    const au = await this.toAtomicUnits(APTOS_COIN_TYPE, quantity);
    return this.faucetClient.fundAccount(account, au.toNumber());
  }

  /**
   * Airdrops the specified units of fake token to the target address if the
   * quantity falls below the desired balance. Defaults to replenishing the
   * minimum. Returns the transaction hashes, or an empty array if no
   * transactions were sent because the balance is sufficient. Returns the
   * original balance before the airdrop.
   */
  async ensureMinimumFakeCoinBalance({
    sender,
    coin,
    minQuantity,
    replenishQuantity,
  }: {
    sender: AptosAccount;
    coin: FakeCoin;
    minQuantity: AnyUnits;
    replenishQuantity?: AnyUnits;
  }): Promise<AtomicUnits> {
    const coinType = this.getWrappedFakeCoinType(coin);
    const balance = await this.getCoinBalance({
      account: sender.address(),
      coinType,
    });
    const minAu = await this.toAtomicUnits(coinType, minQuantity);
    if (balance.amount.lt(minAu.amount)) {
      const amount =
        replenishQuantity === undefined ? minQuantity : replenishQuantity;
      await this.registerAndMintFakeCoin(coin, amount);
    }
    return balance;
  }

  /**
   * Burns all of the user's fake coin of the given type. Returns the burn
   * transaction. If nothing was burned return undefined.
   */
  async burnAllFakeCoin(
    coin: FakeCoin,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction | undefined> {
    const sender = options.sender ?? this.sender;
    if (_.isUndefined(sender)) {
      throw new Error(`Error sending tx. Sender is undefined but required.`);
    }
    let balance = await this.getFakeCoinBalance(sender.address(), coin);
    if (balance.amount.gtn(0)) {
      return this.burnFakeCoin(coin, balance, { sender });
    }
    return undefined;
  }

  /**
   * Returns an underlying fake coin type used for fake coin type parameters.
   */
  getUnwrappedFakeCoinType(coin: FakeCoin): Types.MoveStructTag {
    return `${this.moduleAddress}::fake_coin::${coin}`;
  }

  /**
   * Returns the full wrapped fake coin type used for non-fake-coin type
   * parameters. For example, the raw coin info is keyed on this full wrapped
   * fake coin type.
   */
  getWrappedFakeCoinType(coin: FakeCoin): Types.MoveStructTag {
    return `${
      this.moduleAddress
    }::fake_coin::FakeCoin<${this.getUnwrappedFakeCoinType(coin)}>`;
  }

  /**
   * Returns CoinInfo for the fake coin type.
   */
  async getFakeCoinInfo(coin: FakeCoin): Promise<CoinInfo> {
    const coinType = this.getWrappedFakeCoinType(coin);
    return this.getCoinInfo(coinType);
  }

  /**
   * Converts any units of the given coin to atomic units.
   */
  async toAtomicUnits(
    coin: Types.MoveStructTag,
    amount: AnyUnits
  ): Promise<AtomicUnits> {
    if (amount instanceof AtomicUnits) {
      return amount;
    }
    const info = await this.getCoinInfo(coin);
    return amount.toAtomicUnits(info.decimals);
  }

  /**
   * Converts any units of the given coin to decimal units.
   */
  async toDecimalUnits(
    coin: Types.MoveStructTag,
    amount: AnyUnits
  ): Promise<DecimalUnits> {
    if (amount instanceof DecimalUnits) {
      return amount;
    }
    const info = await this.getCoinInfo(coin);
    return amount.toDecimalUnits(info.decimals);
  }

  /**
   * Mints fake coin to the user. Any user can call this function. Note that
   * minting the fake coin does not deposit to the vault.
   */
  async registerAndMintFakeCoin(
    coin: FakeCoin,
    amount: AnyUnits,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const coinType = this.getWrappedFakeCoinType(coin);
    return this.sendOrSimulateTransaction(
      {
        function: `${this.moduleAddress}::fake_coin::register_and_mint`,
        type_arguments: [this.getUnwrappedFakeCoinType(coin)],
        arguments: [(await this.toAtomicUnits(coinType, amount)).toU64()],
      },
      options
    );
  }

  /**
   * Returns the fake coin balance for the user.
   */
  async getFakeCoinBalance(
    owner: HexString,
    coin: FakeCoin
  ): Promise<AtomicUnits> {
    const account = await this.getAccountResourceOptional(
      owner,
      `0x1::coin::CoinStore<${this.getWrappedFakeCoinType(coin)}>`
    );
    if (account === undefined) {
      return AU(0);
    }
    return AU((account.data as any).coin.value);
  }

  /**
   * Burns some quantity of the fake coin.
   */
  async burnFakeCoin(
    coin: FakeCoin,
    amount: AnyUnits,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const coinType = this.getUnwrappedFakeCoinType(coin);
    return await this.sendOrSimulateTransaction(
      {
        function: `${this.moduleAddress}::fake_coin::burn`,
        type_arguments: [coinType],
        arguments: [(await this.toAtomicUnits(coinType, amount)).toU64()],
      },
      options
    );
  }

  /**
   * Mints AUX token. This can only be called by the module authority.
   */
  async mintAux(
    recipient: Types.Address,
    amount: AnyUnits,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const au = this.toAtomicUnits(this.getAuxCoin(), amount);
    return this.sendOrSimulateTransaction(
      {
        function: `${this.moduleAddress}::aux_coin::mint`,
        type_arguments: [],
        arguments: [recipient, (await au).toU64()],
      },
      options
    );
  }

  /**
   * Registers the AUX token for the given user.
   */
  async registerAuxCoin(
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    return this.sendOrSimulateTransaction(
      {
        function: `${this.moduleAddress}::aux_coin::register_account`,
        type_arguments: [],
        arguments: [],
      },
      options
    );
  }

  /**
   * Returns a router configured for swapping between the input and output coin
   * types. The router finds the best price between swapping on the AMM and
   * aggressing on the correponding CLOB market.
   */
  getRouter(sender: AptosAccount): Router {
    return new Router({
      client: this,
      sender,
    });
  }

  /**
   * Either send or simulate a tx using AuxClient.
   *
   * If sending, there must be a sender.
   * If simulating, there must be a simulator.
   */
  async sendOrSimulateTransaction(
    payload: Types.EntryFunctionPayload,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    _.defaults(options, this.options);
    const simulate = options?.simulate ?? false;
    const sender = options?.sender ?? this.sender;

    // AUX has a default simulator for every network, so only matters when sending real txs
    if (!simulate && _.isUndefined(sender)) {
      throw new Error(`Error sending tx. Sender is undefined but required.`);
    }

    return simulate
      ? this.simulateTransaction(payload, this.simulator)
      : this.sendTransaction(payload, options);
  }

  /**
   * Simulates sending a tx with payload and returns the transaction result.
   */
  async simulateTransaction(
    payload: Types.EntryFunctionPayload,
    simulator?: Simulator | undefined
  ): Promise<Types.UserTransaction> {
    const simulator_ = simulator ?? this.simulator;
    const rawTransaction = await this.aptosClient.generateTransaction(
      simulator_.address,
      payload
    );
    const userTransaction = await this.aptosClient.simulateTransaction(
      simulator?.publicKey ?? this.simulator.publicKey,
      rawTransaction,
      {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: true,
      }
    );
    if (userTransaction.length !== 1) {
      throw new AuxClientError("simulated transaction length > 1");
    }
    return userTransaction[0]!;
  }
  /**
   * Sends the payload as the sender and returns the transaction result.
   */
  async sendTransaction(
    payload: Types.EntryFunctionPayload,
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    const sender = options.sender ?? this.sender;
    if (_.isUndefined(sender)) {
      throw new Error(`Error sending tx. Sender is undefined but required.`);
    }
    const rawTransaction = await this.aptosClient.generateTransaction(
      sender.address(),
      payload,
      this.toSubmitTransactionRequest(options)
    );
    const signedTxn = await this.aptosClient.signTransaction(
      sender,
      rawTransaction
    );
    const pendingTxn = await this.aptosClient.submitTransaction(signedTxn);
    const userTxn = await this.aptosClient.waitForTransactionWithResult(
      pendingTxn.hash,
      this.toExtraArgs(options)
    );
    if (userTxn.type !== "user_transaction") {
      throw new WaitForTransactionError(
        `Expected user_transaction but got ${userTxn.type}`,
        userTxn
      );
    }
    return userTxn as Types.UserTransaction;
  }

  toSubmitTransactionRequest(
    options: Partial<AuxClientOptions>
  ): Partial<Types.SubmitTransactionRequest> {
    return _.pickBy(
      {
        sender: this.sender?.address().toString(),
        sequence_number: options?.sequenceNumber?.toString(),
        max_gas_amount: options?.maxGasAmount?.toString(),
        gas_unit_price: options?.gasUnitPrice?.toString(),
        expiration_timestamp_secs: options?.expirationTimestampSecs?.toString(),
      },
      _.negate(_.isUndefined)
    );
  }

  toExtraArgs(options: Partial<AuxClientOptions>): Partial<{
    timeoutSecs?: number;
    checkSuccess?: boolean;
  }> {
    return _.pickBy(
      {
        timeoutSecs: options?.timeoutSecs,
        checkSuccess: options?.checkSuccess,
      },
      _.negate(_.isUndefined)
    );
  }
}

export class AuxClientError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, AuxClientError.prototype);
  }
}

/**
 * Options on the AuxClient that can be configured per-transaction. This is usually presented as
 * Partial<AuxClientOptions> so the caller is can configure any subset of options.
 *
 * Note that options that can't be reconfigured per tx (e.g. moduleAddress) are passed directly to
 * the AuxClient constructor.
 *
 * Note these arguments are simply serialized and passed through as:
 * - Types.SubmitTransactionRequest (see Aptos SDK's `generateTransaction`)
 * - ExtraArgs (see Aptos SDK's `waitForTransactionWithResult`)
 */
export interface AuxClientOptions {
  sender: AptosAccount;
  simulate: boolean;
  // The sequence number for an account indicates the number of transactions that have been
  // submitted and committed on chain from that account. It is incremented every time a
  // transaction sent from that account is executed or aborted and stored in the blockchain.
  sequenceNumber: number;
  maxGasAmount: AtomicUnits;
  gasUnitPrice: AtomicUnits;
  // Unix timestamp in seconds
  expirationTimestampSecs: number;
  // If transaction is not processed within the specified timeout, throws WaitForTransactionError.
  timeoutSecs: number;
  // If `checkSuccess` is false (the default), this function returns
  // the transaction response just like in case 1, in which the `success` field
  // will be false. If `checkSuccess` is true, it will instead throw FailedTransactionError.
  checkSuccess: boolean;
}

/**
 * The result of a transaction against the AUX module. This will be either the events emitted or
 * the resource created. If the transaction failed, the result will be undefined.
 *
 * Note only AuxType is a generic representing any event or resource where AUX is "schema-aware"
 * (and therefore can parse it).
 */
export interface AuxTransaction<AuxType> {
  transaction: Types.UserTransaction;
  result: AuxType | undefined;
}

export interface Simulator {
  address: MaybeHexString;
  publicKey: TxnBuilderTypes.Ed25519PublicKey;
}

// TODO: parametrize on key type
export interface Entry<Type> {
  key: { name: string };
  value: Type;
}

export interface CoinInfo {
  coinType: Types.MoveStructTag;
  decimals: number; // u8
  name: string;
  supply: Supply[];
  symbol: string;
}

interface RawCoinInfo {
  type: Types.MoveStructTag;
  data: {
    decimals: number; // u8
    name: string;
    supply: {
      vec: Supply[];
    };
    symbol: string;
  };
}

export interface Supply {
  aggregator: {
    vec: Aggregator[];
  };
  integer: {
    vec: Integer[];
  };
}

export interface Aggregator {
  handle: Types.Address;
  key: Types.Address;
  limit: Types.U128;
}

export interface Integer {
  limit: Types.U128;
  value: Types.U128;
}

/**
 * Floors the input number to the given number of decimals. Note that this
 * function should not be used for exact calculations.
 * @param n
 * @param precision
 * @returns
 */
export function quantize(n: number, precision: number): number {
  return Math.floor(n * Math.pow(10, precision)) / Math.pow(10, precision);
}

/**
 * Increases the input value by the fee quoted in basis points.
 * @param value
 * @param feeBps
 * @returns
 */
export function addFee(value: number, feeBps: number): number {
  return value * (1 + feeBps * Math.pow(10, -4));
}

/**
 * Reduces the input value by the fee quoted in basis points.
 * @param value
 * @param feeBps
 * @returns
 */
export function subtractFee(value: number, feeBps: number): number {
  return value * (1 - feeBps * Math.pow(10, -4));
}

/**
 * Parse out the type arguments from a type name string
 *
 * e.g. "0x1::coin::Coin<0x1::aptos_coin::AptosCoin>" => ["0x1::aptos_coin::AptosCoin"]
 *
 * @param typeName
 * @returns
 */
export function parseTypeArgs(
  typeName: Types.MoveStructTag
): Types.MoveStructTag[] {
  const types = [];
  const inner = typeName.substring(
    typeName.indexOf("<") + 1,
    typeName.lastIndexOf(">")
  );
  let bracketCount = 0;
  let currentType = "";
  for (let i = 0; i < inner.length; i++) {
    const char = inner.at(i);
    switch (char) {
      case "<":
        bracketCount++;
        currentType += char;
        break;
      case ">":
        bracketCount--;
        currentType += char;
        break;
      case ",":
        if (bracketCount == 0) {
          types.push(currentType);
          currentType = "";
        } else {
          currentType += char;
        }
        break;
      case " ":
        if (bracketCount > 0) {
          currentType += char;
        }
        break;
      default:
        currentType += char;
    }
  }
  if (bracketCount != 0) {
    throw new AuxClientError(`Invalid type ${typeName}`);
  }
  types.push(currentType);
  return types;
}

/**
 * For localnet deployments, this returns the Aux module address deployed by
 * the given sender.
 */
export function deriveModuleAddress(sender: AptosAccount): Types.Address {
  return deriveResourceAccountAddress(sender.address().toString(), "aux");
}

/**
 * Computes the derived resource account address.
 * @param originAddress
 * @param seed
 * @returns
 */
export function deriveResourceAccountAddress(
  originAddress: string,
  seed: string
): string {
  const seedBytes = new TextEncoder().encode(seed);
  let addressBytes = new HexString(originAddress).toUint8Array();
  let mergedArray = new Uint8Array(addressBytes.length + seedBytes.length + 1);
  mergedArray.set(addressBytes);
  mergedArray.set(seedBytes, addressBytes.length);
  mergedArray.set([255], addressBytes.length + seedBytes.length);
  return "0x" + SHA3.sha3_256(mergedArray);
}

function toEd25519PublicKey(
  hexString: string
): TxnBuilderTypes.Ed25519PublicKey {
  return new TxnBuilderTypes.Ed25519PublicKey(
    new HexString(hexString).toUint8Array()
  );
}

export function parsePoolType(poolType: Types.MoveStructTag): {
  poolType: string;
  coinTypeX: string;
  coinTypeY: string;
} {
  const [coinTypeX, coinTypeY] = parseTypeArgs(poolType);
  if (coinTypeX === undefined || coinTypeY === undefined) {
    throw new Error(`Failed to parse poolType ${poolType}`);
  }
  return { poolType, coinTypeX, coinTypeY };
}

// https://github.com/microsoft/TypeScript/issues/20707
export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
