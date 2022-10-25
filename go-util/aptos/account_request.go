package aptos

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
)

// GetAccount
// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/get_account
func (client *Client) GetAccount(ctx context.Context, request *GetAccountRequest) (*AptosResponse[GetAccountResponse], error) {
	return doRequestForType[GetAccountResponse](ctx, client, request)
}

type GetAccountRequest struct {
	GetRequest

	Address       Address `url:"-"`
	LedgerVersion *uint64 `url:"ledger_version,omitempty"`
}

var _ AptosRequest = (*GetAccountRequest)(nil)

func (r *GetAccountRequest) PathSegments() ([]string, error) {
	if r.Address.IsZero() {
		return nil, fmt.Errorf("empty address for account request")
	}

	return []string{"accounts", r.Address.String()}, nil
}

type GetAccountResponse struct {
	SequenceNumber    JsonUint64 `json:"sequence_number"`
	AuthenticationKey string     `json:"authentication_key"`
}

// GetAccountResources
// https://fullnode.mainnet.aptoslabs.com/v1/accounts/{address}/resources
func (client *Client) GetAccountResources(ctx context.Context, request *GetAccountResourcesRequest) (*AptosResponse[GetAccountResourcesResponse], error) {
	return doRequestForType[GetAccountResourcesResponse](ctx, client, request)
}

var _ AptosRequest = (*GetAccountResourcesRequest)(nil)

type GetAccountResourcesRequest struct {
	GetRequest

	Address       Address `url:"-"`
	LedgerVersion *uint64 `url:"ledger_version,omitempty"`
}

func (r *GetAccountResourcesRequest) PathSegments() ([]string, error) {
	if r.Address.IsZero() {
		return nil, fmt.Errorf("empty address for account resources request")
	}

	return []string{"accounts", r.Address.String(), "resources"}, nil
}

// AccountResource includes the type and json encoding of the data.
type AccountResource struct {
	Type *MoveTypeTag    `json:"type"`
	Data json.RawMessage `json:"data,omitempty"`
}

// TypedAccountResource
type TypedAccountResource[T any] struct {
	AccountResource
	ParsedData *T
}

type GetAccountResourcesResponse []AccountResource

// GetAccountResource
// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/get_account_resource
func (client *Client) GetAccountResource(ctx context.Context, request *GetAccountResourceRequest) (*AptosResponse[GetAccountResourceResponse], error) {
	return doRequestForType[GetAccountResourceResponse](ctx, client, request)
}

type GetAccountResourceRequest struct {
	GetRequest

	Address       Address `url:"-"`
	LedgerVersion *uint64 `url:"ledger_version,omitempty"`
	Type          *MoveTypeTag
}

func (r *GetAccountResourceRequest) PathSegments() ([]string, error) {
	if r.Address.IsZero() {
		return nil, fmt.Errorf("empty address for account resource request")
	}

	if r.Type == nil {
		return nil, fmt.Errorf("missing type information")
	}

	return []string{"account", r.Address.String(), "resource", url.PathEscape(r.Type.String())}, nil
}

type GetAccountResourceResponse struct {
	*AccountResource `json:",inline"`
}
