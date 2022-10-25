package cmd

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/davecgh/go-spew/spew"
	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func GetListL2MarketCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ls-l2",
		Short: "list level 2 market data",
		Args:  cobra.NoArgs,
	}

	network := aptos.Mainnet
	endpoint := ""
	baseCoinStr := ""
	quoteCoinStr := ""
	var maxGasAmount uint64 = 200000

	cmd.Flags().VarP(&network, "network", "n", "network for the market.")
	cmd.Flags().StringVarP(&endpoint, "endpoint", "u", endpoint, "endpoint for the rest api, default to the one provided by aptos labs.")
	cmd.Flags().Uint64VarP(&maxGasAmount, "max-gas-amount", "m", maxGasAmount, "max gas amount for the simulation.")

	cmd.Flags().StringVarP(&baseCoinStr, "base-coin", "b", baseCoinStr, "base coin for the market")
	cmd.MarkFlagRequired("base-coin")
	cmd.Flags().StringVarP(&quoteCoinStr, "quote-coin", "q", quoteCoinStr, "quote coin for the market")
	cmd.MarkFlagRequired("quote-coin")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		if endpoint == "" {
			var err error
			endpoint, _, err = aptos.GetDefaultEndpoint(network)
			orPanic(err)
		}

		auxConfig := getOrPanic(aptos.GetAuxClientConfig(network))

		client := aptos.NewClient(endpoint)

		baseCoin := getOrPanic(parseCoinType(network, baseCoinStr))
		quoteCoin := getOrPanic(parseCoinType(network, quoteCoinStr))

		tx := auxConfig.BuildLoadMarketIntoEvent(baseCoin, quoteCoin, aptos.TransactionOption_MaxGasAmount(maxGasAmount))

		orPanic(client.FillTransactionData(context.Background(), tx, false))

		resp := getOrPanic(
			client.SimulateTransaction(context.Background(), &aptos.SimulateTransactionRequest{
				Transaction: tx,
				Signature:   aptos.NewSingleSignatureForSimulation(&auxConfig.DataFeedPublicKey),
			}),
		)
		parsed := *resp.Parsed
		if len(parsed) != 1 {
			orPanic(fmt.Errorf("more than one transactions in response: %s", string(resp.RawData)))
		}
		if !parsed[0].Success {
			orPanic(fmt.Errorf("simulation failed: %s, resp is %s", parsed[0].VmStatus, string(resp.RawData)))
		}
		events := parsed[0].Events
		if len(events) != 1 {
			orPanic(fmt.Errorf("there should only be one events: %#v", events))
		}

		var L2 aptos.AuxLevel2Event
		orPanic(json.Unmarshal(*events[0].Data, &L2))

		spew.Dump(L2)
	}

	return cmd
}
