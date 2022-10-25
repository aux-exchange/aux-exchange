package aptos

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// FillTransactionData fills the missing data for a transaction.
// seqNumIsZero indicates the sequence number is 0 for the account and therefore doesn't need to check
func (client *Client) FillTransactionData(ctx context.Context, tx *Transaction, seqNumIsZero bool) error {
	// check the sequence number
	if tx.SequenceNumber == 0 && !seqNumIsZero {
		accountInfo, err := client.GetAccount(ctx, &GetAccountRequest{
			Address: tx.Sender,
		})
		if err != nil {
			aptosError, ok := err.(*AptosRestError)
			if !ok || aptosError.HttpStatusCode != http.StatusNotFound {
				return err
			} else {
				tx.SequenceNumber = 0
			}
		} else {
			tx.SequenceNumber = accountInfo.Parsed.SequenceNumber
		}
	}

	if tx.GasUnitPrice == 0 {
		if client.gasEstimate == nil {
			if err := client.RefreshData(ctx); err != nil {
				return err
			}
		}

		tx.GasUnitPrice = JsonUint64(client.gasEstimate.GasEstimate)
	}

	client.defaultTransactionOptions.FillIfDefault(tx)

	return nil
}

// EstimateGasPrice
// https://fullnode.mainnet.aptoslabs.com/v1/estimate_gas_price
func (client *Client) EstimateGasPrice(ctx context.Context) (*AptosResponse[EstimateGasPriceResponse], error) {
	return doRequestForType[EstimateGasPriceResponse](ctx, client, newPathSegmentHolder("estimate_gas_price"))
}

type EstimateGasPriceResponse struct {
	DeprioritizedGasEstimate uint `json:"deprioritized_gas_estimate"`
	GasEstimate              uint `json:"gas_estimate"`
	PrioritizedGasEstimate   uint `json:"prioritized_gas_estimate"`
}

// EncodeSubmission
// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/encode_submission
func (client *Client) EncodeSubmission(ctx context.Context, request *EncodeSubmissionRequest) (*AptosResponse[EncodeSubmissionResponse], error) {
	if len(request.SecondarySigners) == 0 {
		request.SecondarySigners = nil
	}

	return doRequestForType[EncodeSubmissionResponse](ctx, client, request)
}

// EncodeSubmissionRequest
type EncodeSubmissionRequest struct {
	*Transaction     `json:",inline" url:"-"`
	SecondarySigners []Address `json:"secondary_signers,omitempty" url:"-"`
}

var _ AptosRequest = (*EncodeSubmissionRequest)(nil)

func (r *EncodeSubmissionRequest) Body() ([]byte, error) {
	return json.MarshalIndent(r, "", "  ")
}

func (r *EncodeSubmissionRequest) HttpMethod() string {
	return http.MethodPost
}

func (r *EncodeSubmissionRequest) PathSegments() ([]string, error) {
	return []string{"transactions", "encode_submission"}, nil
}

type EncodeSubmissionResponse string

// SubmitTransaction
// https://fullnode.devnet.aptoslabs.com/v1/spec#/operations/submit_transaction
func (client *Client) SubmitTransaction(ctx context.Context, request *SubmitTransactionRequest) (*AptosResponse[SubmitTransactionResponse], error) {
	return doRequestForType[SubmitTransactionResponse](ctx, client, request)
}

type SubmitTransactionRequest struct {
	*Transaction `json:",inline" url:"-"`
	Signature    SingleSignature `json:"signature" url:"-"`
}

var _ AptosRequest = (*SubmitTransactionRequest)(nil)

func (r *SubmitTransactionRequest) Body() ([]byte, error) {
	return json.MarshalIndent(r, "", "  ")
}

func (r *SubmitTransactionRequest) HttpMethod() string {
	return http.MethodPost
}

func (r *SubmitTransactionRequest) PathSegments() ([]string, error) {
	return []string{"transactions"}, nil
}

type SubmitTransactionResponse struct {
	*Transaction     `json:",inline"`
	*TransactionInfo `json:",inline"`
}

// GetTransactionByHash
// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/get_transaction_by_hash
func (client *Client) GetTransactionByHash(ctx context.Context, request *GetTransactionByHashRequest) (*AptosResponse[GetTransactionByHashResponse], error) {
	return doRequestForType[GetTransactionByHashResponse](ctx, client, request)
}

type GetTransactionByHashRequest struct {
	GetRequest
	Hash string `url:"-"`
}

func (r *GetTransactionByHashRequest) PathSegments() ([]string, error) {
	return []string{"transactions", "by_hash", r.Hash}, nil
}

type GetTransactionByHashResponse struct {
	*Transaction     `json:",inline"`
	Type             string `json:"type"`
	*TransactionInfo `json:",inline"`
}

// SimulateTransaction
// https://fullnode.mainnet.aptoslabs.com/v1/transactions/simulate
func (client *Client) SimulateTransaction(ctx context.Context, request *SimulateTransactionRequest) (*AptosResponse[SimulateTransactionResponse], error) {
	if len(request.Signature.Signature) != SignatureLength*2+2 {
		return nil, fmt.Errorf("signature (%s) is not length %d", request.Signature.Signature, SignatureLength)
	}

	if request.Signature.Signature != simulationSignature {
		return nil, fmt.Errorf("signagure (%s) is not all zero", request.Signature.Signature)
	}

	return doRequestForType[SimulateTransactionResponse](ctx, client, request)
}

type SimulateTransactionRequest struct {
	*Transaction `json:",inline" url:"-"`
	Signature    *SingleSignature `json:"signature" url:"-"`
}

var _ AptosRequest = (*SimulateTransactionRequest)(nil)

func (request *SimulateTransactionRequest) HttpMethod() string {
	return http.MethodPost
}

func (request *SimulateTransactionRequest) Body() ([]byte, error) {
	return json.MarshalIndent(request, "", "  ")
}

func (request *SimulateTransactionRequest) PathSegments() ([]string, error) {
	return []string{"transactions", "simulate"}, nil
}

type SimulateTransactionResponse []struct {
	*Transaction     `json:",inline" url:"-"`
	*TransactionInfo `json:",inline" url:"-"`
}

// WaitForTransaction
func (client *Client) WaitForTransaction(ctx context.Context, txHash string) (string, error) {
	r := &GetTransactionByHashRequest{
		Hash: txHash,
	}

waitLoop:
	for {
		resp, err := client.GetTransactionByHash(ctx, r)
		if err != nil {
			aptosError, ok := err.(*AptosRestError)
			if !ok || aptosError.HttpStatusCode != http.StatusNotFound {
				return "", err
			} else {
				continue waitLoop
			}
		}

		if resp.Parsed.Type != "pending_transaction" {
			return resp.Parsed.Type, nil
		}

		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(5 * time.Second):
		}
	}
}
