package aptos

import (
	"context"
)

// GetLedgerInfo
// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/get_ledger_info
func (client *Client) GetLedgerInfo(ctx context.Context) (*AptosResponse[GetLedgerInfoResponse], error) {
	return doRequestForType[GetLedgerInfoResponse](ctx, client, newPathSegmentHolder())
}

type GetLedgerInfoResponse struct {
	*LedgerInfo `json:",inline"`
}
