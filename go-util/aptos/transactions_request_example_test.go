package aptos_test

import (
	"context"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
	"github.com/davecgh/go-spew/spew"
)

const network = aptos.Devnet

func ExampleClient_SubmitTransaction() {
	restUrl, faucetUrl, _ := aptos.GetDefaultEndpoint(network)

	account, _ := aptos.NewLocalAccountWithRandomKey()

	var err error

	fmt.Printf("private key: 0x%s\n", hex.EncodeToString(account.PrivateKey.Seed()))
	fmt.Printf("address: %s\n", account.Address.String())
	auxConfig, _ := aptos.GetAuxClientConfig(network)

	faucetTxes, err := aptos.RequestFromFaucet(context.Background(), faucetUrl, &account.Address, 1000000000)
	if err != nil {
		panic(err)
	}

	fmt.Printf("faucet tx: %s\n", faucetTxes)

	client := aptos.NewClient(restUrl)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*60)
	defer cancel()

	for _, faucetTx := range faucetTxes {
		txType, err := client.WaitForTransaction(ctx, faucetTx)
		if err != nil {
			spew.Dump(err)
		}
		fmt.Printf("fauct tx type: %s\n", txType)
	}

	tx := aptos.Transaction{
		Sender:                  account.Address,
		ExpirationTimestampSecs: aptos.JsonUint64(time.Date(3000, 1, 1, 0, 0, 0, 0, time.UTC).Unix()),
		Payload: aptos.NewEntryFunctionPayload(fmt.Sprintf("%s::%s::%s", auxConfig.Address.String(), "fake_coin", "mint"),
			[]*aptos.MoveTypeTag{
				{Address: auxConfig.Address, Module: "fake_coin", Name: "USDC"},
			},
			[]aptos.EntryFunctionArg{"1000000000000"}),
	}

	if err := client.FillTransactionData(context.Background(), &tx, false); err != nil {
		panic(err)
	}

	encode, err := client.EncodeSubmission(context.Background(),
		&aptos.EncodeSubmissionRequest{
			Transaction: &tx,
		},
	)
	if err != nil {
		panic(err)
	}

	data, err := hex.DecodeString(strings.TrimPrefix(string(*encode.Parsed), "0x"))
	if err != nil {
		panic(err)
	}

	signature, _ := account.Sign(data)

	request := &aptos.SubmitTransactionRequest{
		Transaction: &tx,
		Signature:   *signature,
	}
	body, _ := request.Body()
	fmt.Println(string(body))
	resp, err := client.SubmitTransaction(context.Background(), request)

	spew.Dump(resp)
	spew.Dump(err)

	if err != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		client.WaitForTransaction(ctx, resp.Parsed.Hash)
	}
}
