import {
  AptosAccount,
  AptosClient,
  FaucetClient,
  HexString,
  MaybeHexString,
  TxnBuilderTypes,
  Types,
  WaitForTransactionError
} from "aptos";
import BN from "bn.js";
import * as fs from "fs";
import * as SHA3 from "js-sha3";

import _ from "lodash";
import os from "os";
import YAML from "yaml";
import { APTOS_COIN_TYPE, FakeCoin } from "./coin";
import { env } from "./env";
import Router from "./router/dsl/router";
import { AnyUnits, AtomicUnits, AU, DecimalUnits } from "./units";

export type AptosNetwork = "mainnet" | "testnet" | "devnet" | "localnet";
export const APTOS_NETWORKS = ["mainnet", "testnet", "devnet", "localnet"];

/**
 * AuxClient
 *
 * A fully-featured Typescript client for interacting with AUX exchange.
 *
 * const auxClient = new AuxClient("mainnet", new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1"))
 * const auxClient = new AuxClient("devnet", new AptosClient("https://fullnode.devnet.aptoslabs.com/v1"))
 *
 * // use your own Full Node
 * const auxClient = new AuxClient("mainnet", new AptosClient("http://localhost:8080"))
 *
 * This will also look in your `~/.aptos/config.yaml` file for Full Node REST urls.
 *
 * For example:
 *
 * mainnet:
 *     rest_url: http://localhost:8080
 *
 * `new AuxClient("mainnet")` will use "http://localhost:8080"
 */
export class AuxClient {
  aptosNetwork: AptosNetwork;
  aptosClient: AptosClient;
  faucetClient: FaucetClient | undefined;

  readonly moduleAddress: Types.Address;
  readonly moduleAuthority: AptosAccount | undefined;

  options: TransactionOptions | undefined;
  simulatorAddress: Types.Address | undefined;
  simulatorPublicKey: TxnBuilderTypes.Ed25519PublicKey | undefined;

  // Internal state.
  coinInfo: Map<Types.MoveStructTag, CoinInfo>;
  vaults: Map<Types.Address, HexString>;

  constructor(
    aptosNetwork: AptosNetwork,
    aptosClient: AptosClient,
    faucetClient?: FaucetClient,
    options?: TransactionOptions
  ) {
    this.aptosNetwork = aptosNetwork;
    this.aptosClient = aptosClient;
    this.faucetClient = faucetClient;
    switch (aptosNetwork) {
      case "mainnet":
        this.moduleAddress =
          "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541";
        this.simulatorPublicKey = mustEd25519PublicKey(
          "0x5252282e6fd74873a1a777e707496919cb118fb65ba46e5271ebd4c2af716a28"
        );
        this.simulatorAddress =
          "0x490d9592c7f246ecd5eef80e0e5592fef813d0adb43b26dbedc0d045282c36b8";
        break;
      case "testnet":
        this.moduleAddress =
          "0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53";
        this.simulatorPublicKey = mustEd25519PublicKey(
          "0x5252282e6fd74873a1a777e707496919cb118fb65ba46e5271ebd4c2af716a28"
        );
        this.simulatorAddress =
          "0x490d9592c7f246ecd5eef80e0e5592fef813d0adb43b26dbedc0d045282c36b8";
        break;
      case "devnet":
        this.moduleAddress =
          "0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a";
        this.simulatorPublicKey = mustEd25519PublicKey(
          "0x2a27ecf198ff20db2634c43177e0d492df63105fa7106706b91a22dc42797d88"
        );
        this.simulatorAddress =
          "0x84f372536c73df84327d2af63992f4443e2bd1aec8695fa85693e256fc1f904f";
        break;
      case "localnet":
        const profile = getAptosProfile("localnet");
        if (_.isUndefined(profile)) {
          throw new Error(
            "Failure to create localnet AuxClient: " +
              "Could not find required profile `localnet` in ~/.aptos/config.yaml"
          );
        }
        this.moduleAuthority = AptosAccount.fromAptosAccountObject({
          privateKeyHex: profile.private_key,
        });
        this.moduleAddress = deriveModuleAddress(this.moduleAuthority);
        this.simulatorPublicKey = mustEd25519PublicKey(profile.public_key);
        this.simulatorAddress = profile.account;
        break;
      default:
        const exhaustiveCheck: never = aptosNetwork;
        throw new Error(exhaustiveCheck);
    }
    this.options = options;
    this.coinInfo = new Map();
    this.vaults = new Map();
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
   * Sends the payload as the sender and returns the transaction result.
   */
  async dataSimulate({
    payload,
    simulatorAccount,
    transactionOptions,
  }: {
    payload: Types.EntryFunctionPayload;
    simulatorAccount?: AptosAccount | undefined;
    transactionOptions?: TransactionOptions | undefined;
  }): Promise<Types.UserTransaction> {
    transactionOptions =
      transactionOptions === undefined ? this.options : transactionOptions;

    const options = Object.fromEntries(
      Object.entries({
        sequence_number: transactionOptions?.sequenceNumber?.toString(),
        max_gas_amount: transactionOptions?.maxGasAmount?.toString(),
        gas_unit_price: transactionOptions?.gasUnitPrice?.toString(),
        expiration_timestamp_secs:
          transactionOptions?.expirationTimestampSecs?.toString(),
        timeoutSecs: transactionOptions?.timeoutSecs?.toNumber(),
        checkSuccess: transactionOptions?.checkSuccess,
      }).filter(([_, v]) => v !== undefined)
    );

    const rawTxn = await this.aptosClient.generateTransaction(
      simulatorAccount?.address.toString() || this.simulatorAddress!,
      payload,
      options
    );

    const simTxn = await this.aptosClient.simulateTransaction(
      !!simulatorAccount
        ? mustEd25519PublicKey(simulatorAccount.pubKey.toString())
        : this.simulatorPublicKey!,
      rawTxn,
      {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: true,
      }
    );
    if (simTxn.length != 1) {
      throw new AuxClientError("simulated transaction length > 1");
    }
    return simTxn[0]!;
  }
  /**
   * Sends the payload as the sender and returns the transaction result.
   */
  async generateSignSubmitWaitForTransaction({
    sender,
    payload,
    transactionOptions,
  }: {
    sender: AptosAccount;
    payload: Types.EntryFunctionPayload;
    transactionOptions?: TransactionOptions | undefined;
  }): Promise<Types.UserTransaction> {
    transactionOptions =
      transactionOptions === undefined ? this.options : transactionOptions;

    const options = Object.fromEntries(
      Object.entries({
        sequence_number: transactionOptions?.sequenceNumber?.toString(),
        max_gas_amount: transactionOptions?.maxGasAmount?.toString(),
        gas_unit_price: transactionOptions?.gasUnitPrice?.toString(),
        expiration_timestamp_secs:
          transactionOptions?.expirationTimestampSecs?.toString(),
        timeoutSecs: transactionOptions?.timeoutSecs?.toNumber(),
        checkSuccess: transactionOptions?.checkSuccess,
      }).filter(([_, v]) => v !== undefined)
    );

    const rawTxn = await this.aptosClient.generateTransaction(
      sender.address(),
      payload,
      options
    );

    const simulate =
      this.options?.simulate ?? transactionOptions?.simulate ?? false;
    if (simulate) {
      const simTxn = await this.aptosClient.simulateTransaction(
        sender,
        rawTxn,
        {
          estimateGasUnitPrice: true,
          estimateMaxGasAmount: true,
          estimatePrioritizedGasUnitPrice: true,
        }
      );
      if (simTxn.length != 1) {
        throw new AuxClientError("simulated transaction length > 1");
      }
      return simTxn[0]!;
    }

    const signedTxn = await this.aptosClient.signTransaction(sender, rawTxn);
    const pendingTxn = await this.aptosClient.submitTransaction(signedTxn);
    const userTxn = await this.aptosClient.waitForTransactionWithResult(
      pendingTxn.hash,
      options
    );
    if (userTxn.type !== "user_transaction") {
      throw new WaitForTransactionError(
        `Expected user_transaction but got ${userTxn.type}`,
        userTxn
      );
    }
    return userTxn as Types.UserTransaction;
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
    if (this.faucetClient === undefined) {
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
      await this.registerAndMintFakeCoin({ sender, coin, amount });
    }
    return balance;
  }

  /**
   * Burns all of the user's fake coin of the given type. Returns the burn
   * transaction. If nothing was burned return undefined.
   */
  async burnAllFakeCoin(
    sender: AptosAccount,
    coin: FakeCoin
  ): Promise<Types.UserTransaction | undefined> {
    let balance = await this.getFakeCoinBalance(sender.address(), coin);
    if (balance.amount.gtn(0)) {
      return this.burnFakeCoin(sender, coin, balance);
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
  async registerAndMintFakeCoin({
    sender,
    coin,
    amount,
    transactionOptions,
  }: {
    sender: AptosAccount;
    coin: FakeCoin;
    amount: AnyUnits;
    transactionOptions?: TransactionOptions | undefined;
  }): Promise<Types.UserTransaction> {
    const coinType = this.getWrappedFakeCoinType(coin);
    return this.generateSignSubmitWaitForTransaction({
      sender,
      payload: {
        function: `${this.moduleAddress}::fake_coin::register_and_mint`,
        type_arguments: [this.getUnwrappedFakeCoinType(coin)],
        arguments: [(await this.toAtomicUnits(coinType, amount)).toU64()],
      },
      transactionOptions,
    });
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
    owner: AptosAccount,
    coin: FakeCoin,
    amount: AnyUnits,
    transactionOptions?: TransactionOptions
  ): Promise<Types.UserTransaction> {
    const coinType = this.getUnwrappedFakeCoinType(coin);
    return await this.generateSignSubmitWaitForTransaction({
      sender: owner,
      payload: {
        function: `${this.moduleAddress}::fake_coin::burn`,
        type_arguments: [coinType],
        arguments: [(await this.toAtomicUnits(coinType, amount)).toU64()],
      },
      transactionOptions,
    });
  }

  /**
   * Mints AUX token. This can only be called by the module authority.
   */
  async mintAux(
    sender: AptosAccount,
    recipient: Types.Address,
    amount: AnyUnits,
    transactionOptions?: TransactionOptions
  ): Promise<Types.UserTransaction> {
    const au = this.toAtomicUnits(this.getAuxCoin(), amount);
    return this.generateSignSubmitWaitForTransaction({
      sender,
      payload: {
        function: `${this.moduleAddress}::aux_coin::mint`,
        type_arguments: [],
        arguments: [recipient, (await au).toU64()],
      },
      transactionOptions,
    });
  }

  /**
   * Registers the AUX token for the given user.
   */
  async registerAuxCoin(
    sender: AptosAccount,
    transactionOptions?: TransactionOptions
  ): Promise<Types.UserTransaction> {
    return this.generateSignSubmitWaitForTransaction({
      sender,
      payload: {
        function: `${this.moduleAddress}::aux_coin::register_account`,
        type_arguments: [],
        arguments: [],
      },
      transactionOptions,
    });
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
}

export class AuxClientError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, AuxClientError.prototype);
  }
}

export interface AuxClientOptions {
  nodeUrl: string;
  faucetUrl: string;
  moduleAddress: string;
  simulate: boolean;
  transactionOptions: TransactionOptions;
  simulatorAddress: Types.Address;
  simulatorPublicKey: TxnBuilderTypes.Ed25519PublicKey;
}

export type TransactionOptions = Partial<{
  // The sequence number for an account indicates the number of transactions that have been
  // submitted and committed on chain from that account. It is incremented every time a
  // transaction sent from that account is executed or aborted and stored in the blockchain.
  sequenceNumber: BN;
  maxGasAmount: AtomicUnits;
  gasUnitPrice: AtomicUnits;
  // Unix timestamp in seconds
  expirationTimestampSecs: BN;
  // If transaction is not processed within the specified timeout, throws WaitForTransactionError.
  timeoutSecs: BN;
  // If `checkSuccess` is false (the default), this function returns
  // the transaction response just like in case 1, in which the `success` field
  // will be false. If `checkSuccess` is true, it will instead throw FailedTransactionError.
  checkSuccess: boolean;
  simulate: boolean;
  simulatorAddress?: Types.Address | undefined;
  simulatorPublicKey?: TxnBuilderTypes.Ed25519PublicKey | undefined;
}>;

/**
 * returns the desired profile name for aptos based on environment variables.
 * First, the environment variable APTOS_PROFILE is checked, and if it is set to non empty value, that profile will be read.
 * Then, if will check if APTOS_LOCAL is set, and if it is set, use localnet profile.
 * Lastly, use default.
 * @returns profile name
 */
export function getAptosProfileNameFromEnvironment(): AptosNetwork {
  return env().aptosNetwork;
}

export interface AptosProfile {
  private_key: string;
  public_key: string;
  account: string;
  rest_url: string;
  faucet_url: string;
}

export interface AptosYamlProfiles {
  profiles: {
    [key: string]: AptosProfile;
  };
}

/**
 * Returns a local Aptos profile by reading from `$HOME/.aptos/config.yaml`.
 * 
 * Note this assumes you have ran `aptos set-global-config`.
 * 
 * @param profileName
 * @param configPath
 * @returns
 */
export function getAptosProfile(
  network: string,
  configPath: string = `${os.homedir()}/.aptos/config.yaml`
): AptosProfile {
  let profiles: AptosYamlProfiles = YAML.parse(
    fs.readFileSync(configPath, { encoding: "utf-8" })
  );

  const profile = profiles.profiles[network];
  if (_.isUndefined(profile)) {
    throw new Error(
      `Could not find profile for ${network} in ~/.aptos/config.yaml`
    );
  }
  return profile;
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

function mustEd25519PublicKey(
  hexString: string
): TxnBuilderTypes.Ed25519PublicKey {
  return new TxnBuilderTypes.Ed25519PublicKey(
    new HexString(hexString).toUint8Array()
  );
}
