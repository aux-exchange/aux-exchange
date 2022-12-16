import _ from "lodash";
import type {
  AuxClient,
  AuxClientOptions,
  AuxTransaction,
} from "../client";
import {
  AnyUnits,
  AU,
} from "../units";
import {
  RelayEvent,
  RedeemVaaEvent,
  WithdrawEscrowEvent,
  RawRelayEvent,
  parseRawRedeemVaaEvent,
  parseRawWithdrawEscrowEvent,
  redeemVaaPayload,
  withdrawEscrowPayload,
  RedeemVaaInput,
  WithdrawEscrowInput,
} from "./schema";
import {
  CHAIN_ID_APTOS,
  CHAIN_ID_ETH,
  getAssetFullyQualifiedType,
  parse,
  CONTRACTS
} from "@certusone/wormhole-sdk";
import type { Types } from "aptos";
const Parser = require("binary-parser").Parser;
import BN from "bn.js";
import { RELAY_WHITELIST } from "../eth/client";

export interface RelayPayload {
  relayerFee: AnyUnits;
  receiverAddress: Types.Address;
  nativeSwapAmount: AnyUnits;
};

export class RelayClient {
  /********************/
  /* Public functions */
  /********************/

  readonly auxClient: AuxClient;
  readonly ethAddress: Types.Address;
  readonly aptosAddress: Types.Address;
  readonly tokenBridgeAddress: Types.Address;

  constructor(
    auxClient: AuxClient,
    ethAddress: Types.Address,
    aptosAddress: Types.Address
  ) {
    this.auxClient = auxClient;
    this.ethAddress = ethAddress;
    this.aptosAddress = aptosAddress;
    this.tokenBridgeAddress = CONTRACTS[auxClient.aptosNetwork === "mainnet" ? "MAINNET" : "TESTNET"]?.aptos?.token_bridge;
  }

  strip0x = (str: string) =>
    str.startsWith("0x") ? str.substring(2) : str;

  payloadParse = new Parser().endianess("big").array("relayerFee", {
    type: "uint8",
    lengthInBytes: 8,
    formatter: (bytes: Uint8Array) => AU(new BN(bytes))
  }).array("receiverAddress", {
    type: "uint8",
    lengthInBytes: 32,
    formatter: (bytes: Uint8Array) => "0x" + Buffer.from(bytes).toString("hex")
  }).array("nativeSwapAmount", {
    type: "uint8",
    lengthInBytes: 8,
    formatter: (bytes: Uint8Array) => AU(new BN(bytes))
  });

  
  /**
   * Derive the Aptos fully qualified type from an Ethereum token address
   * Function is 0x and padding agnostic
   */
  generateWrappedAptosCoinType(
    ethTokenAddress: Types.Address
  ): Types.Address | null {
    return getAssetFullyQualifiedType(this.tokenBridgeAddress, CHAIN_ID_ETH, ethTokenAddress);
  }

  async redeemVaa(
    input: RedeemVaaInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<RedeemVaaEvent> | null> {
    const { vaaBytes } = input;
    const vaa = parse(Buffer.from(vaaBytes));
    if (
      vaa.payload.type === "TransferWithPayload" &&
      vaa.payload.chain === CHAIN_ID_APTOS &&
      vaa.payload.tokenChain === CHAIN_ID_ETH &&
      vaa.payload.fromAddress.slice(-40).toLowerCase() === this.ethAddress.slice(-40).toLowerCase() &&
      RELAY_WHITELIST[this.auxClient.aptosNetwork !== "mainnet" ? "goerli" : "mainnet"].hasOwnProperty("0x" + vaa.payload.tokenAddress.slice(-40).toLowerCase())
    ) {
      const { tokenAddress, payload } = vaa.payload;
      const parsedPayload = this.payloadParse.parse(Buffer.from(this.strip0x(payload), "hex"));
      const coinType = this.generateWrappedAptosCoinType(tokenAddress);
      if (!coinType) {
        throw "Could not generate corresponding coinType on Aptos.";
      }
      const coinStore = `0x1::coin::CoinStore<${coinType}>`;
      const recipentAddress = parsedPayload.receiverAddress;
      let registered = (await this.auxClient.getAccountResourceOptional(recipentAddress, coinStore)) !== undefined;

      const payloadInput = {
        coinType,
        vaaBytes,
        minOut: parsedPayload.nativeSwapAmount.toString(),
        escrowed: !registered
      };
      const redeemVaaArgs = redeemVaaPayload(
        this.aptosAddress,
        payloadInput
      );

      const tx = await this.auxClient.sendOrSimulateTransaction(
        redeemVaaArgs,
        options
      );

      return this.parseRedeemVaaTransaction(tx);
    }
    return null;
  }

  async withdrawEscrowPayload(
    input: WithdrawEscrowInput,
    options: Partial<AuxClientOptions> = {}
  ): Promise<AuxTransaction<WithdrawEscrowEvent>> {
    const { coinType } = input;

    const payloadInput = {
      coinType,
    };

    const withdrawEscrowArgs = withdrawEscrowPayload(
      this.aptosAddress,
      payloadInput
    );

    const tx = await this.auxClient.sendOrSimulateTransaction(
      withdrawEscrowArgs,
      options
    );
    return this.parseWithdrawEscrowTransaction(tx);
  }

  /*********************/
  /* Private functions */
  /*********************/

  private parseRedeemVaaTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<RedeemVaaEvent> {
    return this.parseRelayTransaction(
      transaction,
      `${this.aptosAddress}::redeem_with_native_swap::RedeemVaaEvent`,
      parseRawRedeemVaaEvent
    )
  }

  private parseWithdrawEscrowTransaction(
    transaction: Types.UserTransaction
  ): AuxTransaction<WithdrawEscrowEvent> {
    return this.parseRelayTransaction(
      transaction,
      `${this.aptosAddress}::redeem_with_native_swap::WithdrawEscrowEvent`,
      parseRawWithdrawEscrowEvent
    )
  }

  private parseRelayTransaction<
    RawType extends RawRelayEvent,
    ParsedType extends RelayEvent
  >(
    transaction: Types.UserTransaction,
    poolEventType: Types.MoveStructTag,
    parse: (raw: RawType) => ParsedType
  ): AuxTransaction<ParsedType> {
    const events = transaction.events.filter(
      (event) => event.type === poolEventType
    );
    if (!transaction.success) {
      return { transaction, result: undefined };
    }
    if (events.length > 1) {
      throw new Error(
        `Got unexpected number of events: ${transaction.hash} ${JSON.stringify(
          events,
          undefined,
          4
        )}`
      );
    }
    if (events.length === 0) {
      return { transaction, result: undefined };
    }
    return {
      transaction,
      result: parse(events[0]! as RawType),
    };
  }
}