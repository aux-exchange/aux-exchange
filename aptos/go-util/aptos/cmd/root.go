package cmd

import (
	"github.com/spf13/cobra"

	aptosCmd "github.com/fardream/go-aptos/aptos/cmd"
)

func GetRootCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "aux-for-aptos",
		Short: "aux exchange utility cli - aptos version",
		Args:  cobra.NoArgs,
	}

	cmd.AddCommand(
		GetSetupAuxCmd(),
		aptosCmd.GetKeyAndMnemonicCmd(),
		aptosCmd.GetCalculateResourceAddressCmd(),
		aptosCmd.GetLaunchAptosNodeCmd(),
		aptosCmd.GetListAccountCmd(),
		aptosCmd.GetListMarketCmd(),
		aptosCmd.GetListChainCmd(),
		aptosCmd.GetListPoolCmd(),
		aptosCmd.GetListL2MarketCmd(),
		aptosCmd.GetListAllOrdersCmd(),
		aptosCmd.GetPlaceClobOrderCmd(),
	)

	return cmd
}
