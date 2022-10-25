package aptos

import (
	"fmt"
)

func (info *AuxClientConfig) BuildLoadMarketIntoEvent(baseCoin, quoteCoin *MoveTypeTag, options ...TransactionOption) *Transaction {
	functionNaame := fmt.Sprintf("%s::clob_market::load_market_into_event", info.Address.String())
	payload := NewEntryFunctionPayload(
		functionNaame,
		[]*MoveTypeTag{baseCoin, quoteCoin},
		[]EntryFunctionArg{},
	)

	tx := &Transaction{
		Payload: payload,
	}

	ApplyTransactionOptions(tx, options...)

	if tx.Sender.IsZero() {
		tx.Sender = info.DataFeedAddress
	}

	return tx
}

func (info *AuxClientConfig) BuildLoadAllOrdersIntoEvent(baseCoin, quoteCoin *MoveTypeTag, options ...TransactionOption) *Transaction {
	functionNaame := fmt.Sprintf("%s::clob_market::load_all_orders_into_event", info.Address.String())
	payload := NewEntryFunctionPayload(
		functionNaame,
		[]*MoveTypeTag{baseCoin, quoteCoin},
		[]EntryFunctionArg{},
	)

	tx := &Transaction{
		Payload: payload,
	}

	ApplyTransactionOptions(tx, options...)

	if tx.Sender.IsZero() {
		tx.Sender = info.DataFeedAddress
	}

	return tx
}

func (info *AuxClientConfig) BuildPlaceOrder(sender Address, isBid bool, baseCoin, quoteCoin *MoveTypeTag, limitPrice uint64, quantity uint64, options ...TransactionOption) *Transaction {
	functionName := fmt.Sprintf("%s::clob_market::place_order", info.Address.String())
	payload := NewEntryFunctionPayload(functionName, []*MoveTypeTag{baseCoin, quoteCoin}, []EntryFunctionArg{
		// sender: &signer, // sender is the user who initiates the trade (can also be the vault_account_owner itself) on behalf of vault_account_owner. Will only succeed if sender is the creator of the account, or on the access control list of the account published under vault_account_owner address
		sender.String(),               // vault_account_owner: address, // vault_account_owner is, from the module's internal perspective, the address that actually makes the trade. It will be the actual account that has changes in balance (fee, volume tracker, etc is all associated with vault_account_owner, and independent of sender (i.e. delegatee))
		true,                          // is_bid: bool,
		fmt.Sprintf("%d", limitPrice), // limit_price: u64,
		fmt.Sprintf("%d", quantity),   // quantity: u64,
		"0",                           // aux_au_to_burn_per_lot: u64,
		"0",                           // client_order_id: u128,
		"0",                           // order_type: u64,
		"0",                           // ticks_to_slide: u64, // # of ticks to slide for post only
		false,                         // direction_aggressive: bool, // only used in passive join order
		"18446744073709551615",        // timeout_timestamp: u64, // if by the timeout_timestamp the submitted order is not filled, then it would be cancelled automatically, if the timeout_timestamp <= current_timestamp, the order would not be placed and cancelled immediately
		"201",                         // self_trade_action_type: u64 // self_trade_action_type
	})

	tx := &Transaction{Payload: payload}

	ApplyTransactionOptions(tx, options...)

	if tx.Sender.IsZero() {
		tx.Sender = sender
	}

	return tx
}
