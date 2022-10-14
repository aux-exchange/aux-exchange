import { AptosAccount, CoinClient, Types } from "aptos";
import { assert } from "console";
import type { TransactionResult } from "../..//transaction";
import { AnyUnits, AU } from "../..//units";
import type { AuxClient, TransactionOptions } from "../../client";
import {
  RouterEvent,
  swapCoinForExactCoin,
  swapExactCoinForCoin,
} from "../core/mutation";
import { getRouterQuote, RouterQuote } from "./router_quote";

export default class Router {
  client: AuxClient;
  sender: AptosAccount | undefined;

  constructor({
    client,
    sender,
  }: {
    client: AuxClient;
    sender?: AptosAccount;
  }) {
    this.client = client;
    this.sender = sender;
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

  async getQuoteExactCoinForCoin({
    exactAmountIn,
    coinTypeIn,
    coinTypeOut,
  }: {
    exactAmountIn: AnyUnits;
    coinTypeIn: Types.MoveStructTag;
    coinTypeOut: Types.MoveStructTag;
  }): Promise<TransactionResult<RouterQuote | undefined>> {
    const sender = this.sender;
    if (sender === undefined) {
      throw new Error("Router swap must have sender");
    }
    assert(sender !== undefined);
    const result = swapExactCoinForCoin(
      this.client,
      {
        sender,
        coinTypeIn,
        coinTypeOut,
        exactAmountAuIn: (
          await this.client.toAtomicUnits(coinTypeIn, exactAmountIn)
        ).toU64(),
        minAmountAuOut: AU(0).toU64(),
      },
      { simulate: true }
    );
    return result.then((r) => {
      return getRouterQuote(
        this.client,
        "ExactIn",
        r,
        true,
        coinTypeIn,
        coinTypeOut
      );
    });
  }

  async getQuoteCoinForExactCoin({
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
