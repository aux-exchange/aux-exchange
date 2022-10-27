import {
  AptosAccount,
  AptosClient,
  FaucetClient,
  HexString,
  MaybeHexString,
  Types,
  WaitForTransactionError,
  TxnBuilderTypes,
} from "aptos";
import type BN from "bn.js";
import * as fs from "fs";
import * as SHA3 from "js-sha3";
import { TextEncoder } from "util";

import os from "os";
import YAML from "yaml";
import { AnyUnits, AtomicUnits, AU, DecimalUnits } from "./units";
import Router from "./router/dsl/router";
import _ from "lodash";

/**
 * If APTOS_LOCAL is set, AuxClient.createFromEnv() creates a local client.
 * Otherwise, it creates a client from the default profile. If APTOS_PROFILE is
 * set, this is ignored.
 */
const ENV_APTOS_LOCAL = "APTOS_LOCAL";

/**
 * If APTOS_PROFILE is set, AuxClient.createFromEnv() creates a client pointing
 * to the given profile. This variable overrides APTOS_LOCAL.
 */
const ENV_APTOS_PROFILE = "APTOS_PROFILE";

export enum Network {
  Testnet = "testnet",
  Devnet = "devnet",
  Localnet = "localnet",
  Mainnet = "mainnet",
}

const DEFAULT_NETWORK: Network = Network.Localnet;

interface NetworkConfig {
  moduleAddress?: string;
  fullnode: string;
  faucet?: string;
  simulatorAddress?: Types.Address;
  simulatorPublicKey?: TxnBuilderTypes.Ed25519PublicKey;
}

function mustEd25519PublicKey(
  hexString: string
): TxnBuilderTypes.Ed25519PublicKey {
  return new TxnBuilderTypes.Ed25519PublicKey(
    new HexString(hexString).toUint8Array()
  );
}

const networkConfigs: Record<Network, NetworkConfig> = {
  localnet: {
    fullnode: "http://127.0.0.1:8080",
    faucet: "http://127.0.0.1:8081",
  },
  testnet: {
    fullnode: "https://fullnode.testnet.aptoslabs.com/v1",
    moduleAddress:
      "0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53",
    simulatorPublicKey: mustEd25519PublicKey(
      "0x5252282e6fd74873a1a777e707496919cb118fb65ba46e5271ebd4c2af716a28"
    ),
    simulatorAddress:
      "0x490d9592c7f246ecd5eef80e0e5592fef813d0adb43b26dbedc0d045282c36b8",
  },
  devnet: {
    fullnode: "https://fullnode.devnet.aptoslabs.com/v1",
    faucet: "https://faucet.devnet.aptoslabs.com",
    moduleAddress:
      "0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a",
    simulatorPublicKey: mustEd25519PublicKey(
      "0x2a27ecf198ff20db2634c43177e0d492df63105fa7106706b91a22dc42797d88"
    ),
    simulatorAddress:
      "0x84f372536c73df84327d2af63992f4443e2bd1aec8695fa85693e256fc1f904f",
  },
  mainnet: {
    fullnode: "https://fullnode.mainnet.aptoslabs.com/v1",
    moduleAddress:
      "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    simulatorAddress:
      "0x73daac91bd205cec351524974cfae156985f947e07d55f2acfcb38981fdb8898",
    simulatorPublicKey: mustEd25519PublicKey(
      "0xa257c3a9f8c0316326681fc525c038886e39b3495c99bb28e1bca01ff6216634"
    ),
  },
};

/**
 * For localnet deployments, this returns the Aux module address deployed by
 * the given sender.
 */
export function deriveModuleAddress(sender: AptosAccount): Types.Address {
  return deriveResourceAccountAddress(sender.address().toString(), "aux");
}

export const NATIVE_APTOS_COIN = "0x1::aptos_coin::AptosCoin";

/**
 * Supported fake coin types. These coins have no monetary value but can be used
 * for local and devnet testing of markets with multiple decimals, tick sizes,
 * and so on.
 */
export enum FakeCoin {
  USDC = "USDC",
  USDT = "USDT",
  BTC = "BTC",
  ETH = "ETH",
  SOL = "SOL",
  AUX = "AUX",
}

/**
 * a list of all fake coins
 */
export const ALL_FAKE_STABLES: FakeCoin[] = [FakeCoin.USDC, FakeCoin.USDT];

export const ALL_FAKE_VOLATILES: FakeCoin[] = [
  FakeCoin.BTC,
  FakeCoin.ETH,
  FakeCoin.SOL,
  FakeCoin.AUX,
];

export const ALL_FAKE_COINS: FakeCoin[] =
  ALL_FAKE_STABLES.concat(ALL_FAKE_VOLATILES);

export class AuxClientError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, AuxClientError.prototype);
  }
}

export class AuxClient {
  // Supplied by the user.

  aptosClient: AptosClient;
  faucetClient: FaucetClient | undefined;
  moduleAddress: Types.Address;
  transactionOptions: TransactionOptions | undefined;
  forceSimulate: boolean;

  simulatorAddress: Types.Address | undefined;
  simulatorPublicKey: TxnBuilderTypes.Ed25519PublicKey | undefined;

  // Internal state.

  coinInfo: Map<Types.MoveStructTag, CoinInfo>;
  vaults: Map<Types.Address, HexString>;

  constructor({
    aptosClient,
    faucetClient,
    moduleAddress,
    forceSimulate,
    transactionOptions,
    simulatorAddress,
    simulatorPublicKey,
  }: {
    aptosClient: AptosClient;
    faucetClient?: FaucetClient | undefined;
    moduleAddress: Types.Address;
    forceSimulate: boolean;
    transactionOptions?: TransactionOptions | undefined;
    simulatorAddress?: Types.Address | undefined;
    simulatorPublicKey?: TxnBuilderTypes.Ed25519PublicKey | undefined;
  }) {
    this.aptosClient = aptosClient;
    this.faucetClient = faucetClient;
    this.moduleAddress = moduleAddress;
    this.forceSimulate = forceSimulate;
    this.transactionOptions = transactionOptions;
    this.simulatorAddress = simulatorAddress;
    this.simulatorPublicKey = simulatorPublicKey;

    this.coinInfo = new Map();
    this.vaults = new Map();
  }

  static create({
    network,
    validatorAddress,
    faucetAddress,
    moduleAddress,
    forceSimulate,
    transactionOptions,
    simulatorAddress,
    simulatorPublicKey,
  }: {
    network: Network;
    validatorAddress?: string | undefined;
    faucetAddress?: string | undefined;
    moduleAddress?: string | undefined;
    forceSimulate?: boolean | undefined;
    transactionOptions?: TransactionOptions | undefined;
    simulatorAddress?: Types.Address | undefined;
    simulatorPublicKey?: TxnBuilderTypes.Ed25519PublicKey | undefined;
  }): AuxClient {
    let defaultConfig = networkConfigs[network];
    validatorAddress = validatorAddress ?? defaultConfig.fullnode;
    faucetAddress = faucetAddress ?? defaultConfig.faucet;
    simulatorAddress = simulatorAddress ?? defaultConfig.simulatorAddress;
    console.log("simulatorAddress:", simulatorAddress);
    console.log(`connecting to: ${validatorAddress}`);
    return new AuxClient({
      aptosClient: new AptosClient(validatorAddress),
      faucetClient:
        faucetAddress !== undefined
          ? new FaucetClient(validatorAddress, faucetAddress)
          : undefined,
      moduleAddress: moduleAddress ?? defaultConfig.moduleAddress!,
      forceSimulate: forceSimulate === undefined ? false : forceSimulate,
      simulatorAddress,
      simulatorPublicKey:
        simulatorPublicKey ?? defaultConfig.simulatorPublicKey,
      transactionOptions,
    });
  }

  /**
   * Create client from environment variables.
   * See getAptosProfileNameFromEnvironment for more details on which profile will be used.
   */
  static createFromEnv({
    validatorAddress,
    faucetAddress,
    moduleAddress,
    forceSimulate,
    transactionOptions,
  }: {
    validatorAddress?: string;
    faucetAddress?: string;
    moduleAddress?: string;
    forceSimulate?: boolean;
    transactionOptions?: TransactionOptions | undefined;
  }): AuxClient {
    let profileName = getAptosProfileNameFromEnvironment();
    if (!Object.values(Network).includes(profileName as Network)) {
      profileName = DEFAULT_NETWORK;
    }
    const profile = getAptosProfile(profileName);
    if (_.isUndefined(profile)) {
      throw new Error(`Could not find ${profile} in aptos config.yaml.`);
    }
    const validator = validatorAddress ?? trimTrailingSlash(profile.rest_url);
    const faucet = faucetAddress ?? profile.faucet_url;
    const simulatorAddress =
      profileName === Network.Localnet ? profile.account : undefined;
    const simulatorPublicKey =
      profileName === Network.Localnet
        ? mustEd25519PublicKey(profile.public_key!)
        : undefined;

    return this.create({
      network: profileName as Network,
      validatorAddress: validator,
      faucetAddress: faucet,
      moduleAddress,
      forceSimulate,
      transactionOptions,
      simulatorAddress,
      simulatorPublicKey,
    });
  }

  /**
   * Same as createFromEnv, but reads the private key from the specified profile
   * to use as the module address. Returns the client along with the module authority.
   */
  static createFromEnvForTesting(transactionOptions?: {
    transactionOptions?: TransactionOptions;
  }): [AuxClient, AptosAccount] {
    const [moduleAuthority, moduleAddress] =
      getAuxAuthorityAndAddressFromEnvironment();
    return [
      AuxClient.createFromEnv({
        moduleAddress,
        transactionOptions: transactionOptions?.transactionOptions,
      }),
      moduleAuthority,
    ];
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
      transactionOptions === undefined
        ? this.transactionOptions
        : transactionOptions;

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
      transactionOptions === undefined
        ? this.transactionOptions
        : transactionOptions;

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
      this.forceSimulate || transactionOptions?.simulate === true;
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
    const coinResource = await this.aptosClient.getAccountResource(
      account,
      `0x1::coin::CoinStore<${coinType}>`
    );
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
    const coinResource = await this.aptosClient.getAccountResource(
      account,
      `0x1::coin::CoinStore<${coinType}>`
    );
    const coinBalance = (coinResource.data as any).coin.value;
    return AU(coinBalance).toDecimalUnits(
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
   * Airdrops the atomic units of native token to the target address. Returns
   * the transaction hashes on success.
   */
  async airdropNativeCoin({
    account,
    quantity,
  }: {
    account: HexString;
    quantity: AnyUnits;
  }): Promise<string[]> {
    if (this.faucetClient === undefined) {
      throw new AuxClientError("not configured with faucet");
    }
    const au = await this.toAtomicUnits(NATIVE_APTOS_COIN, quantity);
    return this.faucetClient.fundAccount(account, au.toNumber());
  }

  /**
   * Airdrops the specified units of native token to the target address if the
   * quantity falls below the desired balance. Defaults to replenishing the
   * minimum. Returns the transaction hashes, or an empty array if no
   * transactions were sent because the balance is sufficient. Also returns the
   * balance prior to replenishment.
   */
  async ensureMinimumNativeCoinBalance({
    account,
    minQuantity,
    replenishQuantity,
  }: {
    account: HexString;
    minQuantity: AnyUnits;
    replenishQuantity?: AnyUnits;
  }): Promise<[string[], AtomicUnits]> {
    const balance = await this.getCoinBalance({
      account,
      coinType: NATIVE_APTOS_COIN,
    });
    const minAu = await this.toAtomicUnits(NATIVE_APTOS_COIN, minQuantity);
    if (balance.amount.lt(minAu.amount)) {
      return [
        await this.airdropNativeCoin({
          account,
          quantity:
            replenishQuantity === undefined ? minQuantity : replenishQuantity,
        }),
        balance,
      ];
    }
    return [[], balance];
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
}>;

export function getAuxAuthorityAndAddressFromEnvironment(): [
  AptosAccount,
  Types.Address
] {
  let profileName = getAptosProfileNameFromEnvironment();
  if (profileName == "localnet") {
    const privateKeyHex = getAptosProfile(profileName)?.private_key!;
    const moduleAuthority = AptosAccount.fromAptosAccountObject({
      privateKeyHex,
    });
    const moduleAddress = deriveModuleAddress(moduleAuthority);
    return [moduleAuthority, moduleAddress];
  } else {
    let config = networkConfigs[profileName as Network];
    if (config === undefined) {
      throw `cannot find configuration for ${profileName}`;
    } else {
      return [new AptosAccount(), config.moduleAddress!];
    }
  }
}

/**
 *
 * Check if APTOS_LOCAL is set non-empty string.
 * Note, this will return true even if APTOS_LOCAL=false
 */
export function isAptosLocalFromEnvironment(): boolean {
  const value = process.env[ENV_APTOS_LOCAL];
  return value !== undefined && value !== "";
}

/**
 * returns the desired profile name for aptos based on environment variables.
 * First, the environment variable APTOS_PROFILE is checked, and if it is set to non empty value, that profile will be read.
 * Then, if will check if APTOS_LOCAL is set, and if it is set, use localnet profile.
 * Lastly, use default.
 * @returns profile name
 */
export function getAptosProfileNameFromEnvironment(): string {
  const value = process.env[ENV_APTOS_PROFILE];
  if (value !== undefined && value !== "") {
    return value;
  }
  if (isAptosLocalFromEnvironment()) {
    return "localnet";
  }
  return "default";
}

function trimTrailingSlash(str: string): string {
  if (str.endsWith("/")) {
    return str.substring(0, str.length - 1);
  }
  return str;
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
 * Returns a local Aptos profile.
 * @param profileName
 * @param configPath
 * @returns
 */
export function getAptosProfile(
  profileName: string,
  configPath: string = `${os.homedir()}/.aptos/config.yaml`
): AptosProfile | undefined {
  let x: AptosYamlProfiles = YAML.parse(
    fs.readFileSync(configPath, { encoding: "utf-8" })
  );

  return x.profiles[profileName];
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
  return typeName
    .substring(typeName.indexOf("<") + 1, typeName.lastIndexOf(">"))
    .split(", ");
}
