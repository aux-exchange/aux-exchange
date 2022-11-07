import type { AptosAccount, HexString, Types } from "aptos";
import type { AuxClient, AuxClientOptions } from "../../client";
import type { FakeCoin } from "../../coin";
import {
  AnyUnits,
  AtomicUnits,
  DecimalUnits,
  toAtomicUnits,
} from "../../units";
import * as mutation from "../core/mutation";
import * as query from "../core/query";

// TODO add interfaces for function params

export default class Vault {
  auxClient: AuxClient;

  constructor(auxClient: AuxClient) {
    this.auxClient = auxClient;
  }

  /*************/
  /* MUTATIONS */
  /*************/

  async createAuxAccount(
    options: Partial<AuxClientOptions> = {}
  ): Promise<Types.UserTransaction> {
    return await mutation.createAuxAccount(this.auxClient, options);
  }

  async deposit(
    sender: AptosAccount,
    coinType: Types.MoveStructTag,
    amount: AnyUnits,
    to?: Types.Address
  ): Promise<Types.UserTransaction> {
    const decimals = (await this.auxClient.getCoinInfo(coinType)).decimals;
    if (decimals) {
      const amountAu = toAtomicUnits(amount, decimals).toString();
      if (to === undefined) {
        return await mutation.deposit(this.auxClient, {
          sender,
          coinType,
          amountAu,
        });
      }
      return await mutation.deposit(this.auxClient, {
        sender,
        coinType,
        amountAu,
        to,
      });
    } else {
      throw new Error(`Cannot deposit unregistered coin: ${coinType}`);
    }
  }

  async withdraw(
    sender: AptosAccount,
    coinType: Types.MoveStructTag,
    amount: AnyUnits
  ): Promise<Types.UserTransaction> {
    const decimals = (await this.auxClient.getCoinInfo(coinType)).decimals;
    if (decimals) {
      const amountAu = toAtomicUnits(amount, decimals).toString();
      return await mutation.withdraw(this.auxClient, {
        sender,
        coinType,
        amountAu,
      });
    } else {
      throw new Error(`Cannot withdraw unregistered coin: ${coinType}`);
    }
  }

  /**
   * Withdraws all of the user's balance of a given coin type. Returns the
   * withdraw transaction, or undefined if nothing was withdrawn.
   */
  async withdrawAll(
    sender: AptosAccount,
    coinType: Types.MoveStructTag
  ): Promise<Types.UserTransaction | undefined> {
    const balance = await this.balance(sender.address().toString(), coinType);
    if (balance.toNumber() > 0) {
      return this.withdraw(sender, coinType, balance);
    }
    return undefined;
  }

  async transfer(
    sender: AptosAccount,
    recipient: Types.Address,
    coinType: Types.MoveStructTag,
    amount: AnyUnits
  ): Promise<Types.UserTransaction> {
    const decimals = (await this.auxClient.getCoinInfo(coinType)).decimals;
    if (decimals) {
      const amountAu = toAtomicUnits(amount, decimals).toString();
      return await mutation.transfer(this.auxClient, {
        sender,
        recipient,
        coinType,
        amountAu,
      });
    } else {
      throw new Error(`Cannot transfer unregistered coin: ${coinType}`);
    }
  }

  /***********/
  /* QUERIES */
  /***********/

  async accountExists(ownerAddress: HexString) {
    const auxAccount = await this.auxClient.getAccountResourceOptional(
      ownerAddress,
      `${this.auxClient.moduleAddress}::vault::AuxUserAccount`
    );

    return auxAccount !== undefined;
  }

  async balances(ownerAddress: Types.Address): Promise<query.Balances> {
    return await query.balances(this.auxClient, ownerAddress);
  }

  async balance(
    ownerAddress: Types.Address,
    coinType: Types.MoveStructTag
  ): Promise<DecimalUnits> {
    const balance = await query.balance(this.auxClient, ownerAddress, coinType);
    return this.auxClient.toDecimalUnits(coinType, balance);
  }

  async availableBalance(
    ownerAddress: Types.Address,
    coinType: Types.MoveStructTag
  ): Promise<DecimalUnits> {
    const balance = await query.availableBalance(
      this.auxClient,
      ownerAddress,
      coinType
    );
    return this.auxClient.toDecimalUnits(coinType, balance);
  }

  /**
   * Airdrops the fake token to the target address and deposits into the vault
   * if the quantity falls below the desired balance. Defaults to replenishing
   * the minimum. Returns the balance before replenishment.
   */
  async ensureMinimumFakeCoinBalance({
    sender,
    coin,
    minQuantity,
    replenishQuantity,
    to,
  }: {
    sender: AptosAccount;
    coin: FakeCoin;
    minQuantity: AnyUnits;
    replenishQuantity?: AnyUnits;
    to?: Types.Address;
  }): Promise<AtomicUnits> {
    const coinType = this.auxClient.getWrappedFakeCoinType(coin);
    const balanceDu = await this.balance(
      sender.address().toShortString(),
      coinType
    );
    const balanceAu = await this.auxClient.toAtomicUnits(coinType, balanceDu);
    const minAu = await this.auxClient.toAtomicUnits(coinType, minQuantity);
    if (balanceAu.amount.lt(minAu.amount)) {
      const amount =
        replenishQuantity === undefined ? minQuantity : replenishQuantity;

      await this.auxClient.ensureMinimumFakeCoinBalance({
        sender,
        coin,
        minQuantity: amount,
      });

      await this.deposit(sender, coinType, amount, to);
    }
    return balanceAu;
  }
}
