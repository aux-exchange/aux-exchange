package aptos

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/google/go-querystring/query"
)

// Client for aptos
type Client struct {
	restUrl     string
	gasEstimate *EstimateGasPriceResponse
	ledgerInfo  *LedgerInfo

	defaultTransactionOptions TransactionOptions
}

// NewClient creates a new client with an endpoint
func NewClient(restUrl string, transactionOptions ...TransactionOption) *Client {
	client := &Client{
		restUrl: restUrl,
	}

	for _, opt := range transactionOptions {
		client.defaultTransactionOptions.SetOption(opt)
	}

	if len(transactionOptions) == 0 {
		client.defaultTransactionOptions.SetOption(TransactionOption_ExpireAfter(5 * time.Minute))
		client.defaultTransactionOptions.SetOption(TransactionOption_MaxGasAmount(20000))
	}

	return client
}

// RefreshData updates gas price estimates and ledger info.
func (client *Client) RefreshData(ctx context.Context) error {
	if est, err := client.EstimateGasPrice(ctx); err != nil {
		return err
	} else {
		client.gasEstimate = est.Parsed
	}

	if info, err := client.GetLedgerInfo(ctx); err != nil {
		return err
	} else {
		client.ledgerInfo = info.Parsed.LedgerInfo
	}

	return nil
}

// AptosRestError
type AptosRestError struct {
	// HttpStatusCode returned
	HttpStatusCode int

	// Body of the response
	Body []byte

	// Message
	Message string
}

var _ error = (*AptosRestError)(nil)

func (e *AptosRestError) Error() string {
	return fmt.Sprintf("http failed: %d %s %s", e.HttpStatusCode, e.Message, e.Body)
}

func doRequest[TResponse any](ctx context.Context, client *Client, method string, pathSegments []string, queryString string, body []byte) (*AptosResponse[TResponse], error) {
	fullUrl, err := url.JoinPath(client.restUrl, pathSegments...)
	if err != nil {
		return nil, err
	}

	if queryString != "" {
		fullUrl = fmt.Sprintf("%s?%s", fullUrl, queryString)
	}

	r, err := http.NewRequestWithContext(ctx, method, fullUrl, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	r.Header.Add("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(r)
	if err != nil {
		return nil, err
	}

	msg, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read the response body: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, &AptosRestError{HttpStatusCode: resp.StatusCode, Message: resp.Status, Body: msg}
	}

	res := &AptosResponse[TResponse]{
		RawData: msg,
		Parsed:  new(TResponse),
	}

	err = json.Unmarshal(msg, res.Parsed)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w\n, response msg: %s", err, string(msg))
	}

	return res, nil
}

// doRequestForType takes an AptosRequest, construct the request and pass on to `doRequest`.
func doRequestForType[TResponse any](ctx context.Context, client *Client, request AptosRequest) (*AptosResponse[TResponse], error) {
	pathSegments, err := request.PathSegments()
	if err != nil {
		return nil, fmt.Errorf("failed to construct path: %w", err)
	}

	queryV, err := query.Values(request)
	if err != nil {
		return nil, err
	}
	queryString := queryV.Encode()

	body, err := request.Body()
	if err != nil {
		return nil, err
	}

	return doRequest[TResponse](ctx, client, request.HttpMethod(), pathSegments, queryString, body)
}
