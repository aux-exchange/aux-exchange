package aptos

import "time"

type TransactionOption interface {
	SetTransactionOption(*Transaction) *Transaction
}

type TransactionOption_MaxGasAmount uint64

var _ TransactionOption = (*TransactionOption_MaxGasAmount)(nil)

func (maxGasAmount TransactionOption_MaxGasAmount) SetTransactionOption(tx *Transaction) *Transaction {
	tx.MaxGasAmount = JsonUint64(maxGasAmount)
	return tx
}

type TransactionOption_ExpireAt time.Time

var _ TransactionOption = (*TransactionOption_ExpireAt)(nil)

func (expiry TransactionOption_ExpireAt) SetTransactionOption(tx *Transaction) *Transaction {
	tx.ExpirationTimestampSecs = JsonUint64(time.Time(expiry).Unix())
	return tx
}

type TransactionOption_ExpireAfter time.Duration

var _ TransactionOption = (*TransactionOption_ExpireAfter)(nil)

func (duration TransactionOption_ExpireAfter) SetTransactionOption(tx *Transaction) *Transaction {
	tx.ExpirationTimestampSecs = JsonUint64(time.Now().Add(time.Duration(duration)).Unix())
	return tx
}

type TransactionOption_SequenceNumber uint64

var _ TransactionOption = (*TransactionOption_SequenceNumber)(nil)

func (seqnum TransactionOption_SequenceNumber) SetTransactionOption(tx *Transaction) *Transaction {
	tx.SequenceNumber = JsonUint64(seqnum)
	return tx
}

type TransactionOption_Sender Address

var _ TransactionOption = (*TransactionOption_Sender)(nil)

func (sender TransactionOption_Sender) SetTransactionOption(tx *Transaction) *Transaction {
	tx.Sender = Address(sender)
	return tx
}

type TransactionOption_GasUnitPrice uint64

func (gasUnitPrice TransactionOption_GasUnitPrice) SetTransactionOption(tx *Transaction) *Transaction {
	tx.GasUnitPrice = JsonUint64(gasUnitPrice)
	return tx
}

func ApplyTransactionOptions(tx *Transaction, options ...TransactionOption) *Transaction {
	for _, opt := range options {
		opt.SetTransactionOption(tx)
	}
	return tx
}

type DefaultTransactionOption struct {
	TransactionOption_ExpireAt
	TransactionOption_MaxGasAmount
}

type TransactionOptions struct {
	*TransactionOption_MaxGasAmount
	*TransactionOption_ExpireAfter
	*TransactionOption_ExpireAt
	*TransactionOption_GasUnitPrice
	*TransactionOption_Sender
	*TransactionOption_SequenceNumber
}

func (options *TransactionOptions) SetOption(opt TransactionOption) {
	switch v := opt.(type) {
	case TransactionOption_ExpireAfter:
		options.TransactionOption_ExpireAfter = &v
	case TransactionOption_ExpireAt:
		options.TransactionOption_ExpireAt = &v
	case TransactionOption_GasUnitPrice:
		options.TransactionOption_GasUnitPrice = &v
	case TransactionOption_MaxGasAmount:
		options.TransactionOption_MaxGasAmount = &v
	case TransactionOption_Sender:
		options.TransactionOption_Sender = &v
	case TransactionOption_SequenceNumber:
		options.TransactionOption_SequenceNumber = &v
	}
}

func (options *TransactionOptions) FillIfDefault(tx *Transaction) {
	if tx.Sender.IsZero() && options.TransactionOption_Sender != nil {
		tx.Sender = Address(*options.TransactionOption_Sender)
	}
	if tx.MaxGasAmount == 0 && options.TransactionOption_MaxGasAmount != nil {
		tx.MaxGasAmount = JsonUint64(*options.TransactionOption_MaxGasAmount)
	}
	if tx.GasUnitPrice == 0 && options.TransactionOption_GasUnitPrice != nil {
		tx.GasUnitPrice = JsonUint64(*options.TransactionOption_GasUnitPrice)
	}
	if tx.ExpirationTimestampSecs == 0 && options.TransactionOption_ExpireAt != nil {
		tx.ExpirationTimestampSecs = JsonUint64(time.Time(*options.TransactionOption_ExpireAt).Unix())
	}
	if tx.ExpirationTimestampSecs == 0 && options.TransactionOption_ExpireAfter != nil {
		tx.ExpirationTimestampSecs = JsonUint64(time.Now().Add(time.Duration(*options.TransactionOption_ExpireAfter)).Unix())
	}
	if tx.SequenceNumber == 0 && options.TransactionOption_SequenceNumber != nil {
		tx.SequenceNumber = JsonUint64(*options.TransactionOption_SequenceNumber)
	}
}
