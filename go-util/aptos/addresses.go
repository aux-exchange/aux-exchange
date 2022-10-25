package aptos

import "crypto/ed25519"

type AuxClientConfig struct {
	Address           Address
	Deployer          Address
	DataFeedAddress   Address
	DataFeedPublicKey ed25519.PublicKey
}

func must[T any](in T, err error) T {
	if err != nil {
		panic(err)
	}

	return in
}

func MustStringToAddress(s string) Address {
	return must(ParseAddress(s))
}
