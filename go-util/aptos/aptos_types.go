package aptos

import "encoding/json"

type TableWithLength struct {
	Inner  *Table     `json:"inner"`
	Length JsonUint64 `json:"length"`
}

type Table struct {
	Handle Address `json:"handle"`
}

type EventGUID struct {
	CreationNumber JsonUint64 `json:"creation_num"`
	AccountAddress Address    `json:"addr"`
}

type EventHandler struct {
	Counter JsonUint64 `json:"counter"`
	GUID    struct {
		Id EventGUID `json:"id"`
	} `json:"guid"`
}

type Coin struct {
	Value JsonUint64 `json:"value"`
}

type EntryFunctionPayload struct {
	Type          string             `json:"type"`
	Function      string             `json:"function"`
	TypeArguments []*MoveTypeTag     `json:"type_arguments"`
	Arguments     []EntryFunctionArg `json:"arguments"`
}

type EntryFunctionArg interface{}

func NewEntryFunctionPayload(functionName string, typeArguments []*MoveTypeTag, arguments []EntryFunctionArg) *EntryFunctionPayload {
	r := &EntryFunctionPayload{
		Type:          "entry_function_payload",
		Function:      functionName,
		TypeArguments: typeArguments,
		Arguments:     arguments,
	}

	if r.TypeArguments == nil {
		r.TypeArguments = make([]*MoveTypeTag, 0)
	}
	if r.Arguments == nil {
		r.Arguments = make([]EntryFunctionArg, 0)
	}

	return r
}

var AptosStdAddress Address

func init() {
	var err error
	AptosStdAddress, err = ParseAddress("0x1")
	if err != nil {
		panic(err)
	}
}

// LedgerInfo contains basic information about the chain.
type LedgerInfo struct {
	ChainId             int32      `json:"chain_id"`
	Epoch               JsonUint64 `json:"epoch"`
	LedgerVersion       JsonUint64 `json:"ledger_version"`
	OldestLedgerVersion JsonUint64 `json:"oldest_ledger_version"`
	LedgerTimestamp     JsonUint64 `json:"ledger_timestamp"`
	NodeRole            string     `json:"node_role"`
	OldestBlockHeight   JsonUint64 `json:"oldest_block_height"`
	BlockHeight         JsonUint64 `json:"block_height"`
	GitHash             string     `json:"git_hash"`
}

// Event emitted from aptos transactions
type Event[T any] struct {
	GUID           EventGUID   `json:"guid"`
	SequenceNumber JsonUint64  `json:"sequence_number"`
	Type           MoveTypeTag `json:"type"`
	Data           *T          `json:"data"`
}

type RawEvent = Event[json.RawMessage]
