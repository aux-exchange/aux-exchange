package main

import (
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func main() {
	cmd := cobra.Command{
		Use:   "gen-mnemonic-codes-and-private-key",
		Short: "generate menemonic codes and print out the corresponding private key, public key, and address",
		Args:  cobra.NoArgs,
	}

	mnemonicCodes := []string{}

	cmd.Flags().StringArrayVarP(&mnemonicCodes, "mnemonic", "m", mnemonicCodes, "mnemonic codes")
	cmd.Run = func(cmd *cobra.Command, args []string) {
		mnemonic := ""
		var localAccount *aptos.LocalAccount
		var err error

		switch numCodes := len(mnemonicCodes); {
		case numCodes == 0:
			localAccount, mnemonic, err = aptos.NewLocalAccountWithMnemonic()
			if err != nil {
				panic(err)
			}
		case numCodes == 1:
			mnemonic = mnemonicCodes[0]
			localAccount, err = aptos.NewLocalAccountFromMnemonic(mnemonic, "")
			if err != nil {
				panic(err)
			}
		case numCodes == 12:
			mnemonic = strings.Join(mnemonicCodes, " ")
			localAccount, err = aptos.NewLocalAccountFromMnemonic(mnemonic, "")
			if err != nil {
				panic(err)
			}
		default:
			panic(fmt.Errorf("mnemoic codes should be exactly 12 words: %v", mnemonicCodes))
		}

		fmt.Printf("mnemonic: %s\n", mnemonic)
		fmt.Printf("private key: 0x%s\n", hex.EncodeToString(localAccount.PrivateKey.Seed()))
		fmt.Printf("public key: 0x%s\n", hex.EncodeToString(localAccount.PublicKey))
		fmt.Printf("address: %s\n", localAccount.Address.String())
	}

	cmd.Execute()
}
