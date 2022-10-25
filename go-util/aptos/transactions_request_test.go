package aptos_test

import (
	"context"
	"encoding/hex"
	"testing"
	"time"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

const testUserMenmonic = "escape summer cupboard disagree coach mother permit sugar short excite road smoke"

func TestClientEncodeSubmission(t *testing.T) {
	config, _ := aptos.GetAuxClientConfig(aptos.Devnet)
	moduleAddress := config.Address
	devnetClient := aptos.NewClient("https://fullnode.devnet.aptoslabs.com/v1")
	account, _ := aptos.NewLocalAccountFromMnemonic(testUserMenmonic, "")
	t.Logf("sender is %s", account.Address.String())
	expirationSecs := aptos.JsonUint64(time.Date(3000, 12, 31, 0, 0, 0, 0, time.UTC).Unix())
	t.Logf("expiration is %s", hex.EncodeToString(expirationSecs.ToBCS()))
	t.Logf("gas price is %s", hex.EncodeToString(aptos.JsonUint64(100).ToBCS()))
	t.Logf("max gas is %s", hex.EncodeToString(aptos.JsonUint64(20000).ToBCS()))
	t.Logf("sequence is %s", hex.EncodeToString(aptos.JsonUint64(0).ToBCS()))
	t.Logf("argument 1 is %s", hex.EncodeToString(aptos.JsonUint64(10000000000).ToBCS()))
	t.Logf("module name fake_coin is %s", hex.EncodeToString(aptos.StringToBCS("fake_coin")))
	t.Logf("function name mint is %s", hex.EncodeToString(aptos.StringToBCS("mint")))
	t.Logf("type name USDC is %s", hex.EncodeToString(aptos.StringToBCS("USDC")))
	tx := &aptos.Transaction{
		Sender:                  account.Address,
		ExpirationTimestampSecs: aptos.JsonUint64(expirationSecs),
		GasUnitPrice:            aptos.JsonUint64(100),
		MaxGasAmount:            aptos.JsonUint64(20000),
		SequenceNumber:          aptos.JsonUint64(0),
		Payload: aptos.NewEntryFunctionPayload(
			"0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a::fake_coin::mint",
			[]*aptos.MoveTypeTag{
				{
					Address: moduleAddress,
					Module:  "fake_coin",
					Name:    "USDC",
				},
			},
			[]aptos.EntryFunctionArg{"10000000000"},
		),
	}

	// technically, we should fill the transaction.
	// err := devnetClient.FillTransactionData(context.Background(), tx)
	// if err != nil {
	// 	t.Fatalf("failed to fill transaction: %#v", err)
	// }

	request := &aptos.EncodeSubmissionRequest{
		Transaction:      tx,
		SecondarySigners: nil,
	}
	bodyStr, _ := request.Body()
	t.Log(string(bodyStr))
	r, err := devnetClient.EncodeSubmission(context.Background(), request)
	if err != nil {
		e, ok := err.(*aptos.AptosRestError)
		if ok {
			t.Fatalf("failed: %s", string(e.Message))
		} else {
			t.Fatalf("failed to encode: %#v", err)
		}
	}

	expected := "0xb5e97db07fa0bd0e5598aa3643a9bc6f6693bddc1a9fec9e674a461eaa00b1937d928500a7c0176468d16bd391c5b551bcea5c08394b19690ec8233fd464bcef000000000000000002ea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a0966616b655f636f696e046d696e740107ea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a0966616b655f636f696e045553444300010800e40b5402000000204e000000000000640000000000000000ae3e930700000022"
	result := string(*r.Parsed)
	if expected != result {
		t.Fatalf("want: %s\ngot:%s\n", expected, result)
	}
}
