import {
  AptosAccount,
  CoinClient,
  HexString,
  TxnBuilderTypes,
  Types,
} from "aptos";
import type { TransactionResult } from "../..//transaction";
import { AnyUnits, AU } from "../..//units";
import type { AuxClient, TransactionOptions } from "../../client";
import {
  parseRouterEvents,
  RouterEvent,
  swapCoinForExactCoin,
  swapExactCoinForCoin,
  swapExactCoinForCoinPayload,
} from "../core/mutation";
import { getRouterQuote, RouterQuote } from "./router_quote";

export default class Router {
  client: AuxClient;
  sender: AptosAccount | undefined;
  pubkey: TxnBuilderTypes.Ed25519PublicKey | undefined;

  constructor({
    client,
    sender,
    pubkey,
  }: {
    client: AuxClient;
    sender?: AptosAccount;
    pubkey?: TxnBuilderTypes.Ed25519PublicKey;
  }) {
    this.client = client;
    this.sender = sender;
    this.pubkey = pubkey;
  }

  // TODO: combine swap and quote interfaces and take a "quote" bool flag
  async swapExactCoinForCoin(
    {
      exactAmountIn,
      minAmountOut,
      coinTypeIn,
      coinTypeOut,
    }: {
      exactAmountIn: AnyUnits;
      minAmountOut: AnyUnits;
      coinTypeIn: Types.MoveStructTag;
      coinTypeOut: Types.MoveStructTag;
    },
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<RouterEvent[]>> {
    return swapExactCoinForCoin(
      this.client,
      {
        // @ts-ignore
        sender: this.sender,
        coinTypeIn,
        coinTypeOut,
        exactAmountAuIn: (
          await this.client.toAtomicUnits(coinTypeIn, exactAmountIn)
        ).toU64(),
        minAmountAuOut: (
          await this.client.toAtomicUnits(coinTypeOut, minAmountOut)
        ).toU64(),
      },
      transactionOptions
    );
  }

  async swapCoinForExactCoin(
    {
      exactAmountOut,
      maxAmountIn,
      coinTypeIn,
      coinTypeOut,
    }: {
      exactAmountOut: AnyUnits;
      maxAmountIn: AnyUnits;
      coinTypeIn: Types.MoveStructTag;
      coinTypeOut: Types.MoveStructTag;
    },
    transactionOptions?: TransactionOptions
  ): Promise<TransactionResult<RouterEvent[]>> {
    const sender = this.sender;
    if (sender === undefined) {
      throw new Error("Router swap must have sender");
    }
    return swapCoinForExactCoin(
      this.client,
      {
        sender,
        coinTypeIn,
        coinTypeOut,
        maxAmountAuIn: (
          await this.client.toAtomicUnits(coinTypeIn, maxAmountIn)
        ).toU64(),
        exactAmountAuOut: (
          await this.client.toAtomicUnits(coinTypeOut, exactAmountOut)
        ).toU64(),
      },
      transactionOptions
    );
  }

  async quoteExactCoinForCoin({
    pubkey,
    exactAmountIn,
    coinTypeIn,
    coinTypeOut,
  }: {
    pubkey: Types.Address;
    exactAmountIn: AnyUnits;
    coinTypeIn: Types.MoveStructTag;
    coinTypeOut: Types.MoveStructTag;
  }): Promise<TransactionResult<RouterQuote | undefined>> {
    const accountFrom = new TxnBuilderTypes.Ed25519PublicKey(
      new HexString(pubkey).toUint8Array()
    );
    const tx = await this.client.aptosClient.simulateTransaction(
      accountFrom,
      await this.client.aptosClient.generateTransaction(
        new HexString(pubkey),
        // @ts-ignore
        swapExactCoinForCoinPayload(this.client, {
          coinTypeIn,
          coinTypeOut,
          exactAmountAuIn: (
            await this.client.toAtomicUnits(coinTypeIn, exactAmountIn)
          ).toU64(),
          minAmountAuOut: "0",
        })
      ),
      {
        estimateGasUnitPrice: true,
        estimateMaxGasAmount: true,
        estimatePrioritizedGasUnitPrice: true,
      }
    );
    const result = parseRouterEvents(this.client, tx[0]!);
    return getRouterQuote(
      this.client,
      "ExactIn",
      result,
      true,
      coinTypeIn,
      coinTypeOut
    );
  }

  async quoteCoinForExactCoin({
    exactAmountOut,
    coinTypeIn,
    coinTypeOut,
  }: {
    exactAmountOut: AnyUnits;
    coinTypeIn: Types.MoveStructTag;
    coinTypeOut: Types.MoveStructTag;
  }): Promise<TransactionResult<RouterQuote | undefined>> {
    const result = swapCoinForExactCoin(
      this.client,
      {
        // @ts-ignore
        sender: this.sender,
        coinTypeIn,
        coinTypeOut,
        exactAmountAuOut: (
          await this.client.toAtomicUnits(coinTypeOut, exactAmountOut)
        ).toU64(),
        maxAmountAuIn: AU(
          Number(
            await new CoinClient(this.client.aptosClient).checkBalance(
              this.sender!,
              { coinType: coinTypeIn }
            )
          )
        ).toU64(),
      },
      { simulate: true }
    );
    return result.then((r) => {
      return getRouterQuote(
        this.client,
        "ExactOut",
        r,
        true,
        coinTypeIn,
        coinTypeOut
      );
    });
  }
}
