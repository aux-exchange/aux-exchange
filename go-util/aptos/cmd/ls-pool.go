package cmd

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
	"github.com/aux-exchange/aux-exchange/go-util/aptos/known"
)

func GetListPoolCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ls-pool",
		Short: "get all markets for aux",
		Args:  cobra.NoArgs,
	}

	network := aptos.Mainnet
	endpoint := ""
	cmd.Flags().VarP(&network, "network", "n", "network for the market.")
	cmd.Flags().StringVarP(&endpoint, "endpoint", "u", endpoint, "endpoint for the rest api, default to the one provided by aptos labs.")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		if endpoint == "" {
			var err error
			endpoint, _, err = aptos.GetDefaultEndpoint(network)
			orPanic(err)
		}

		auxConfig := getOrPanic(aptos.GetAuxClientConfig(network))

		moduleAddress := auxConfig.Address

		client := aptos.NewClient(endpoint)

		resources := getOrPanic(client.GetAccountResources(context.Background(), &aptos.GetAccountResourcesRequest{
			Address: moduleAddress,
		}))

		for _, resource := range *resources.Parsed {
			resourceType := resource.Type

			if resourceType.Module == "amm" && resourceType.Name == "Pool" && cmp.Equal(auxConfig.Address, resourceType.Address) {
				var amm aptos.AuxAmmPool
				if err := json.Unmarshal(resource.Data, &amm); err != nil {
					fmt.Printf("failed to parse %s due to %v\n", string(resource.Data), err)
					continue
				}
				baseName := resourceType.GenericTypeParameters[0].String()
				if baseCoin := known.GetCoinInfo(network, resourceType.GenericTypeParameters[0]); baseCoin != nil {
					baseName = baseCoin.Name
				}
				quoteName := resourceType.GenericTypeParameters[1].String()
				if quoteCoin := known.GetCoinInfo(network, resourceType.GenericTypeParameters[1]); quoteCoin != nil {
					quoteName = quoteCoin.Name
				}
				fmt.Printf("found pool for %s: %d <-> %s: %d\n",
					baseName, amm.XReserve.Value, quoteName, amm.YReserve.Value,
				)
			}
		}
	}

	return cmd
}
