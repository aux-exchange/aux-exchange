package aptos

import "fmt"

const (
	Devnet   = "devnet"
	Testnet  = "testnet"
	Localnet = "localnet"
	Mainet   = "mainnet"
)

func GetDefaultEndpoint(network string) (restUrl string, faucetUrl string, err error) {
	switch network {
	case Devnet:
		restUrl = "https://fullnode.devnet.aptoslabs.com/v1"
		faucetUrl = "https://faucet.devnet.aptoslabs.com"
		return
	case Testnet:
		restUrl = "https://fullnode.testnet.aptoslabs.com/v1"
		faucetUrl = "https://faucet.testnet.aptoslabs.com"
		return
	case Localnet:
		restUrl = "http://127.0.0.1:8080/v1"
		faucetUrl = "http://127.0.0.1:8081"
		return
	case Mainet:
		restUrl = "https://fullnode.mainnet.aptoslabs.com/v1"
		return
	default:
		err = fmt.Errorf("unrecognized network name: %s", network)
		return
	}
}
