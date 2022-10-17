package cmd

import "github.com/spf13/cobra"

func GetRootCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "aux-for-aptos",
		Short: "aux exchange utility cli - aptos version",
		Args:  cobra.NoArgs,
	}

	cmd.AddCommand(
		GetSetupAuxCmd(),
		GetKeyAndMnemonicCmd(),
		GetCalculateResourceAddressCmd(),
		GetLaunchAptosNodeCmd(),
	)

	return cmd
}
