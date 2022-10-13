package aptos

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func RequestFromFaucet(faucetUrl string, address string, amount uint64) (string, error) {
	url, err := url.JoinPath(faucetUrl, "mint")
	if err != nil {
		return "", err
	}

	fullUrl := fmt.Sprintf("%s?address=0x%s&amount=%d", url, address, amount)

	fmt.Printf("requesting airdrop for %s from %s\n", address, fullUrl)

	resp, err := http.Post(fullUrl, "", nil)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	allBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("failed to fund from faucet: %s", string(allBytes))
	}

	return string(allBytes), nil
}
