package cmd

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func GetPlaceClobOrderCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "place-clob-order",
		Short: "place an order on clob",
		Args:  cobra.NoArgs,
	}

	network := aptos.Devnet
	profile := string(network)
	endpoint := ""
	baseCoinStr := ""
	quoteCoinStr := ""
	var maxGasAmount uint64 = 200000
	simulate := false

	var limitPrice uint64 = 0
	var quantity uint64 = 0

	cmd.PersistentFlags().VarP(&network, "network", "n", "network for the market.")
	cmd.PersistentFlags().StringVarP(&endpoint, "endpoint", "u", endpoint, "endpoint for the rest api, default to the one provided by aptos labs.")
	cmd.PersistentFlags().Uint64VarP(&maxGasAmount, "max-gas-amount", "m", maxGasAmount, "max gas amount for the simulation.")
	cmd.PersistentFlags().StringVarP(&profile, "profile", "k", profile, "aptos profile to use")
	cmd.PersistentFlags().BoolVarP(&simulate, "simulate", "s", simulate, "simulate the transaction")

	cmd.PersistentFlags().StringVarP(&baseCoinStr, "base-coin", "b", baseCoinStr, "base coin for the market")
	cmd.MarkPersistentFlagRequired("base-coin")
	cmd.PersistentFlags().StringVarP(&quoteCoinStr, "quote-coin", "q", quoteCoinStr, "quote coin for the market")
	cmd.MarkPersistentFlagRequired("quote-coin")
	cmd.PersistentFlags().Uint64VarP(&limitPrice, "limit-price", "p", limitPrice, "limit price")
	cmd.MarkPersistentFlagRequired("limit-price")
	cmd.PersistentFlags().Uint64VarP(&quantity, "quantity", "t", quantity, "quantity")
	cmd.MarkPersistentFlagRequired("quantity")

	buyCmd := &cobra.Command{
		Use:   "buy",
		Short: "buy on aux",
		Args:  cobra.NoArgs,
	}

	sellCmd := &cobra.Command{
		Use:   "sell",
		Short: "sell on aux",
		Args:  cobra.NoArgs,
	}

	buildCmd := func(isBuy bool) func(*cobra.Command, []string) {
		isBid := isBuy
		return func(c *cobra.Command, s []string) {
			configFile, _ := getConfigFileLocation()
			configs := getOrPanic(aptos.ParseAptosConfigFile(getOrPanic(os.ReadFile(configFile))))
			if configs.Profiles == nil {
				orPanic(fmt.Errorf("empty configuration at %s", configFile))
			}
			config, ok := configs.Profiles[profile]
			if !ok {
				orPanic(fmt.Errorf("cannot find profile %s in config file %s", profile, configFile))
			}

			if endpoint == "" && config.RestUrl != "" {
				endpoint = config.RestUrl
			}
			if endpoint == "" {
				var err error
				endpoint, _, err = aptos.GetDefaultEndpoint(network)
				orPanic(err)
			}
			account := getOrPanic(config.GetLocalAccount())

			auxConfig := getOrPanic(aptos.GetAuxClientConfig(network))

			client := aptos.NewClient(endpoint)

			baseCoin := getOrPanic(parseCoinType(network, baseCoinStr))
			quoteCoin := getOrPanic(parseCoinType(network, quoteCoinStr))

			tx := auxConfig.BuildPlaceOrder(account.Address, isBid, baseCoin, quoteCoin, limitPrice, quantity, aptos.TransactionOption_MaxGasAmount(maxGasAmount))
			orPanic(client.FillTransactionData(context.Background(), tx, false))

			if simulate {
				resp := getOrPanic(
					client.SimulateTransaction(context.Background(), &aptos.SimulateTransactionRequest{
						Transaction: tx,
						Signature:   aptos.NewSingleSignatureForSimulation(&account.PublicKey),
					}),
				)
				fmt.Println(string(resp.RawData))
				return
			}

			resp := getOrPanic(client.EncodeSubmission(context.Background(), &aptos.EncodeSubmissionRequest{
				Transaction: tx,
			}))

			signature := getOrPanic(account.Sign(getOrPanic(hex.DecodeString(strings.TrimPrefix(string(*resp.Parsed), "0x")))))

			spew.Dump(getOrPanic(client.SubmitTransaction(context.Background(), &aptos.SubmitTransactionRequest{
				Transaction: tx,
				Signature:   *signature,
			})))
		}
	}

	buyCmd.Run = buildCmd(true)
	sellCmd.Run = buildCmd(false)

	cmd.AddCommand(buyCmd, sellCmd)

	return cmd
}
