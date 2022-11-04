package cmd

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/fardream/go-aptos/aptos"
	"github.com/spf13/cobra"
)

func GetSetupAuxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "setup",
		Short: "set up aux for testing.",
		Long: `setup aux on the target network.

Deploy aux to devnet with "default" profile or a local validator with "local" profile.
The profiles at user home directory's ".aptos/config.yaml" will be used.
If the profile for the chosen network exists, use that. Othwerise a new key will be generated.
		`,
	}

	network := aptos.Localnet
	genNewKey := false
	workDir := "aptos/contract"
	skipLocalNet := false
	seed := "aux"
	overrideUrl := ""
	overrideProfileName := ""
	skipVersionCheck := false
	skipFaucet := false
	doFaucet := false
	waitForValidator := false
	redeploy := false
	cmd.Flags().Var(&network, "network", fmt.Sprintf("network to publish to, must be one of %s, %s, %s, or %s", aptos.Localnet, aptos.Devnet, aptos.Testnet, aptos.Mainnet))
	cmd.Flags().BoolVarP(&genNewKey, "gen-newkey", "f", genNewKey, "generate new key even if old key exists.")
	cmd.Flags().StringVarP(&workDir, "working-directory", "w", workDir, "working directory containing the code of aux and deployer.")
	cmd.Flags().BoolVarP(&skipLocalNet, "skip-localnet-validator", "n", skipLocalNet, "skip launching a new validator if nothing is running at :8080")
	cmd.Flags().StringVarP(&seed, "seed", "s", seed, "seed for aux resource account")
	cmd.Flags().StringVarP(&overrideUrl, "override-url", "u", overrideUrl, "override url for rest endpoint (useful for accessing your own fullnode to avoid 429/too many requests)")
	cmd.Flags().StringVarP(&overrideProfileName, "override-profile", "p", overrideProfileName, "override profile name")
	cmd.Flags().BoolVarP(&skipVersionCheck, "skip-version-check", "v", skipVersionCheck, "check Aptos version == required version")
	cmd.Flags().BoolVar(&skipFaucet, "skip-faucet", skipFaucet, "skip faucet request")
	cmd.Flags().BoolVar(&doFaucet, "do-faucet-for-existing", doFaucet, "do faucet for existing accounts")
	cmd.Flags().BoolVarP(&waitForValidator, "wait-validator", "r", waitForValidator, "wait for validator to quit")
	cmd.Flags().BoolVar(&redeploy, "redeploy", redeploy, "redeploy")

	cmd.Run = func(_ *cobra.Command, _ []string) {
		// check aptos version
		if !skipVersionCheck {
			checkAptosVersion()
		}

		// check if the node is running
		restUrl, faucetUrl, err := aptos.GetDefaultEndpoint(network)
		orPanic(err)

		if len(overrideUrl) > 0 {
			restUrl = overrideUrl
		}

		var validatorProcess *exec.Cmd
		if isValidatorRunning(restUrl) {
			fmt.Printf("Validator is running at %s\n", restUrl)
		} else if network == aptos.Localnet && !skipLocalNet {
			fmt.Println("Launch a validator")
			validatorProcess = runValidator(!waitForValidator)
		} else {
			orPanic(fmt.Errorf("validator is not running at %s", restUrl))
		}

		profileName := getProfile(network)

		if len(overrideProfileName) > 0 {
			profileName = overrideProfileName
		}

		configFile, configFileExists := getConfigFileLocation()
		var configs *aptos.ConfigFile
		if configFileExists {
			configs = getOrPanic(aptos.ParseAptosConfigFile(getOrPanic(os.ReadFile(configFile))))
		} else {
			configs = aptos.NewConfigFile()
		}

		config, hasProfile := configs.Profiles[profileName]

		if !hasProfile && redeploy {
			orPanic(fmt.Errorf("cannot find profile %s at %s, but redeploy is requested", profileName, configFile))
		}
		if genNewKey && redeploy {
			orPanic(fmt.Errorf("cannot generate new key and redeploy at the same time"))
		}

		if !hasProfile || genNewKey {
			config = &aptos.Config{
				FaucetUrl: faucetUrl,
				RestUrl:   restUrl,
			}
			localAccount := getOrPanic(aptos.NewLocalAccountWithRandomKey())
			orPanic(config.SetKey(localAccount))

			configs.Profiles[profileName] = config

			if hasProfile {
				redWarn.Printf("overwriting profile at %s\n", configFile)
			} else if !configFileExists {
				fmt.Printf("write config to %s\n", configFile)
			} else {
				fmt.Printf("add profile %s to config %s\n", profileName, configFile)
			}
			if configFileExists {
				timestr := time.Now().Format("2006-01-02-H-15-04-05-999999999")
				backName := fmt.Sprintf("%s.backup.%s", configFile, timestr)
				fmt.Printf("backup config at %s\n", backName)
				orPanic(os.Rename(configFile, backName))
			}
			os.WriteFile(configFile, getOrPanic(configs.ToString()), 0o666)
			if skipFaucet {
				redWarn.Printf("Newly created profile... not requesting airdrop, quit\n")
			} else {
				addr := getOrPanic(aptos.ParseAddress(config.Account))
				fmt.Println(getOrPanic(aptos.RequestFromFaucet(context.Background(), config.FaucetUrl, &addr, 1_000_000_000)))
			}
		} else if doFaucet {
			addr := getOrPanic(aptos.ParseAddress(config.Account))
			fmt.Println(getOrPanic(aptos.RequestFromFaucet(context.Background(), config.FaucetUrl, &addr, 1_000_000_000)))
		}

		resourceAccount := aptos.CalculateResourceAddress(getOrPanic(aptos.ParseAddress(config.Account)), []byte(seed)).String()
		if checkAccountExist(config.RestUrl, resourceAccount) {
			redWarn.Printf("resource account: %s exists, maybe redeploy?\n", resourceAccount)
		}

		doDeploy(config, workDir, seed, redeploy)

		if validatorProcess != nil {
			validatorProcess.Wait()
		}
	}

	return cmd
}
