package aptos

import (
	"crypto/ed25519"
	"encoding/json"
)

// Transaction doesn't have signatures attached to them.
type Transaction struct {
	Sender                  Address               `json:"sender"`
	SequenceNumber          JsonUint64            `json:"sequence_number"`
	MaxGasAmount            JsonUint64            `json:"max_gas_amount"`
	GasUnitPrice            JsonUint64            `json:"gas_unit_price"`
	ExpirationTimestampSecs JsonUint64            `json:"expiration_timestamp_secs"`
	Payload                 *EntryFunctionPayload `json:"payload"`
}

type SingleSignature struct {
	Type      string `json:"type"`
	PublicKey string `json:"public_key"`
	Signature string `json:"signature"`
}

const (
	Ed25519SignatureType = "ed25519_signature"
	// 64 zero bytes
	simulationSignature = "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
)

func NewSingleSignature(publicKey *ed25519.PublicKey, signature []byte) *SingleSignature {
	return &SingleSignature{
		Signature: prefixedHexString(signature),
		PublicKey: prefixedHexString(*publicKey),
		Type:      Ed25519SignatureType,
	}
}

func NewSingleSignatureForSimulation(publicKey *ed25519.PublicKey) *SingleSignature {
	return &SingleSignature{
		Type:      Ed25519SignatureType,
		PublicKey: prefixedHexString(*publicKey),
		Signature: simulationSignature,
	}
}

type TransactionInfo struct {
	Hash                string            `json:"hash"`
	StateChangeHash     string            `json:"state_change_hash"`
	EventRootHash       string            `json:"event_root_hash"`
	StateCheckPointHash string            `json:"state_checkpoint_hash"`
	GasUsed             JsonUint64        `json:"gas_used"`
	Success             bool              `json:"success"`
	VmStatus            string            `json:"vm_status"`
	AccumulatorRootHash string            `json:"accumulator_root_hash"`
	Changes             []json.RawMessage `json:"changes"`
	Events              []*RawEvent       `json:"events"`
	Timestamp           JsonUint64        `json:"timestamp"`
}
