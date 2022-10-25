package aptos

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func RequestFromFaucet(ctx context.Context, faucetUrl string, address *Address, amount uint64) ([]string, error) {
	url, err := url.JoinPath(faucetUrl, "mint")
	if err != nil {
		return nil, err
	}

	fullUrl := fmt.Sprintf("%s?address=%s&amount=%d", url, address.String(), amount)

	fmt.Printf("requesting airdrop for %s from %s\n", address, fullUrl)

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, fullUrl, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	allBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("failed to fund from faucet: %s", string(allBytes))
	}

	allTxHashes := make([]string, 0)
	err = json.Unmarshal(allBytes, &allTxHashes)
	if err != nil {
		return nil, nil
	}
	return mapSlices(allTxHashes, func(in string) string {
		if !strings.HasPrefix(in, "0x") {
			return "0x" + in
		} else {
			return in
		}
	}), nil
}
