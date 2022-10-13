package aptos_test

import (
	"testing"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func TestNewLocalAccount(t *testing.T) {
	privateKey, err := aptos.NewPrivateKeyFromHexString("0x2f859272453b4ad6e186e19bb9b99fe1ddfccbe680a0490b7b90142a1e5d4430")
	if err != nil {
		t.Fatalf("failed to parse private key: %v", err)
	}

	account, err := aptos.NewLocalAccountFromPrivateKey(privateKey)
	if err != nil {
		t.Fatalf("failed to create account from private key: %v", err)
	}

	expectedAddress := "0x22bd90a2f5fb4fdf1ef6a9e9b0982b491f4ac5c3bc241a59959e38fabcce2426"

	if account.Address.String() != expectedAddress {
		t.Fatalf("expecting address: %s\n, got %s", expectedAddress, account.Address)
	}
}
