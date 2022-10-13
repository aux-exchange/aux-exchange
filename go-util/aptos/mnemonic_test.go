package aptos_test

import (
	"testing"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

const testCodes = "sponsor asthma entry later call ten label arrive mention small army oven"

const expectedAddress = "0xc3b381e81f1924a45af30820c07382ddeeb43a8adbc63cde3fdc960511fbf686"

func TestFromMnemonic(t *testing.T) {
	localAccount, err := aptos.NewLocalAccountFromMnemonic(testCodes, "")
	if err != nil {
		t.Fatalf("failed to get local account: %#v", err)
	}

	if localAccount.Address.String() != expectedAddress {
		t.Fatalf("not correct public key: %s", localAccount.Address.String())
	}
}
