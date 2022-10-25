package cmd

import (
	"encoding/hex"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

const (
	shortDescription = `calculate resource account address from source address and seed string.`
	longDescription  = shortDescription + `

Process to generate the resource account address
- concatenate source address and seed string.
- run sha3_256 on the bytes.
`
)

func GetCalculateResourceAddressCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "calculate-resource-address",
		Short: "calculate resource account address from source address and seed string",
		Long:  longDescription,
		Args:  cobra.NoArgs,
	}

	var sourceAddress, seed string

	cmd.Flags().StringVarP(&sourceAddress, "address", "a", "", "source address")
	cmd.MarkFlagRequired("address")
	cmd.Flags().StringVarP(&seed, "seed", "s", "", "seed")
	cmd.MarkFlagRequired("seed")

	cmd.Run = func(_ *cobra.Command, _ []string) {
		fmt.Printf("source address: %s\n", sourceAddress)
		fmt.Printf("seed: %s\n", seed)
		addr, err := aptos.ParseAddress(sourceAddress)
		if err != nil {
			panic(err)
		}
		resourceAddr, err := aptos.CalculateResourceAddress(addr, ([]byte)(seed))
		if err != nil {
			panic(err)
		}
		fmt.Printf("resource address: 0x%s\n", hex.EncodeToString(resourceAddr[:]))
	}

	return cmd
}
