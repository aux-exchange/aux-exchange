package cmd

import (
	"encoding/hex"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func GetKeyAndMnemonicCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "key-and-mnemonic",
		Short: "generate menemonic codes and print out the corresponding private key, public key, and address",
		Args:  cobra.NoArgs,
	}

	mnemonicCodes := []string{}

	outputFile := ""
	profile := ""
	cmd.Flags().StringArrayVarP(&mnemonicCodes, "mnemonic", "m", mnemonicCodes, "mnemonic codes")
	cmd.Flags().StringVarP(&outputFile, "output", "o", outputFile, "output the data into a configuration file. if the file already exists, it will be backed up")
	cmd.Flags().StringVarP(&profile, "profile", "p", profile, "profile name in the configuration file")
	cmd.MarkFlagFilename("output", "yml", "yaml")
	cmd.MarkFlagsRequiredTogether("output", "profile")

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

		if outputFile != "" {
			configs := aptos.NewConfigFile()
			if IsFileExists(outputFile) {
				configs = getOrPanic(aptos.ParseAptosConfigFile(getOrPanic(os.ReadFile(outputFile))))
			}
			if configs.Profiles == nil {
				configs.Profiles = make(map[string]*aptos.Config)
			}

			config := &aptos.Config{}
			config.SetKey(localAccount)
			configs.Profiles[profile] = config

			OverwriteConfig(configs, outputFile)
		}
	}

	return cmd
}
