package aptos

import "fmt"

type Network string

const (
	Devnet    Network = "devnet"
	Testnet   Network = "testnet"
	Localnet  Network = "localnet"
	Mainnet   Network = "mainnet"
	Customnet Network = "customnet"
)

func GetDefaultEndpoint(network Network) (restUrl string, faucetUrl string, err error) {
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
	case Mainnet:
		restUrl = "https://fullnode.mainnet.aptoslabs.com/v1"
		return
	case Customnet:
		err = fmt.Errorf("doesn't support customnet")
		return
	default:
		err = fmt.Errorf("unrecognized network name: %s", network)
		return
	}
}

func (network Network) String() string {
	return string(network)
}

func (network *Network) Set(s string) error {
	switch Network(s) {
	case Mainnet:
		*network = Mainnet
		return nil
	case Devnet:
		*network = Devnet
		return nil
	case Localnet:
		*network = Localnet
		return nil
	case Testnet:
		*network = Testnet
		return nil
	case Customnet:
		*network = Customnet
	default:
		return fmt.Errorf("failed to recognize network: %s", s)
	}

	return nil
}

func (network *Network) Type() string {
	return "aptos-network"
}
