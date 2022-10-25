package cmd

import (
	"context"

	"github.com/davecgh/go-spew/spew"
	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func GetListChainCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ls-chain",
		Short: "listing the chain info",
		Args:  cobra.NoArgs,
	}

	network := aptos.Mainnet
	cmd.Flags().VarP(&network, "network", "c", "network")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		r, _, err := aptos.GetDefaultEndpoint(network)
		if err != nil {
			orPanic(err)
		}

		client := aptos.NewClient(r)
		spew.Dump(getOrPanic(client.GetLedgerInfo(context.Background())))
		spew.Dump(getOrPanic(client.EstimateGasPrice(context.Background())))
	}
	return cmd
}
