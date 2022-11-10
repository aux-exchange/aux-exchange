package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/fardream/go-aptos/aptos"
	"github.com/fardream/go-aptos/aptos/known"
	"github.com/google/go-cmp/cmp"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func getOrPanic[T any](input T, err error) T {
	orPanic(err)
	return input
}

func orPanic(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	network := aptos.Mainnet
	rpc := ""
	initFile := ""

	cmd := cobra.Command{
		Use:   "pool-stat",
		Short: "download pool-stat for aux pools",
	}

	cmd.Flags().StringVarP(&rpc, "rpc-endpoint", "u", rpc, "rpc endpoint to query the events")
	cmd.Flags().VarP(&network, "network", "n", "network to query")
	cmd.Flags().StringVarP(&initFile, "data-file", "o", initFile, "data file used to store the data")
	cmd.MarkFlagFilename(initFile)
	cmd.MarkFlagRequired("data-file")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		mainfunc(network, rpc, initFile)
	}

	cmd.Execute()
}

func mainfunc(network aptos.Network, rpc string, initFile string) {
	for _, usdSymbol := range []string{
		"USDC",
		"USDCso",
		"USDT",
		"ceUSDC",
		"ceDAI",
		"ceUSDT",
		"zUSDC",
		"zUSDT",
	} {
		coinType := known.GetCoinInfoBySymbol(network, usdSymbol)
		allStables[usdSymbol] = coinType
		PriceBySymbol[usdSymbol] = 1
		PriceByTypeTag[coinType.TokenType.Type.String()] = 1
	}

	client := aptos.MustNewClient(network, rpc)

	auxConfig := getOrPanic(aptos.GetAuxClientConfig(network))

	auxResources := getOrPanic(client.GetAccountResources(context.Background(), &aptos.GetAccountResourcesRequest{
		Address: auxConfig.Address,
	}))

	pools := AllPools{
		Pools: make(map[string]*PoolStat),
	}

poolReadLoop:
	for _, resource := range *auxResources.Parsed {
		resourceType := resource.Type

		if resourceType.Module != aptos.AuxAmmModuleName || resource.Type.Name != "Pool" || !cmp.Equal(auxConfig.Address, resourceType.Address) {
			continue poolReadLoop
		}

		pool := &aptos.AuxAmmPool{}

		if err := json.Unmarshal(resource.Data, pool); err != nil {
			fmt.Printf("failed to parse pool information: %v\n", err)
			continue poolReadLoop
		}

		coinX := known.GetCoinInfo(network, resourceType.GenericTypeParameters[0])
		coinY := known.GetCoinInfo(network, resourceType.GenericTypeParameters[1])
		name := fmt.Sprintf("%s-%s", coinX.Symbol, coinY.Symbol)

		DecimalByType[coinX.TokenType.Type.String()] = getDecimal(coinX.Decimals)
		DecimalByType[coinY.TokenType.Type.String()] = getDecimal(coinY.Decimals)

		pools.Pools[name] = &PoolStat{
			Pool:     pool,
			CoinX:    coinX,
			CoinY:    coinY,
			CoinPair: name,
		}
	}

	pools.FillTVL()

	orPanic(os.WriteFile(initFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT)
	defer cancel()
fillPoolLoop:
	for _, pool := range pools.Pools {
		pool.LoadSwaps(ctx, client)
		select {
		case <-ctx.Done():
			break fillPoolLoop
		default:
		}
	}

	pools.FillStat()

	orPanic(os.WriteFile(initFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))

	table := tablewriter.NewWriter(os.Stdout)

	table.SetHeader([]string{"Pool", "TVL", "Last 24 Hour Volume", "Last 24 Hour Fee", "Tx Count", "User Count", "Last 7 Day Volume", "Last 7 Day Fee", "Tx Count", "User Count"})

	formatter := message.NewPrinter(language.AmericanEnglish)
	for _, pool := range pools.Pools {
		table.Append([]string{
			pool.CoinPair,
			formatter.Sprintf("%.2f", pool.TVL),
			formatter.Sprintf("%.2f", pool.Last24Hours.Volume),
			formatter.Sprintf("%.2f", pool.Last24Hours.Fee),
			formatter.Sprintf("%d", pool.Last24Hours.TransactionCount),
			formatter.Sprintf("%d", pool.Last24Hours.UserCount),
			formatter.Sprintf("%.2f", pool.Last7Days.Volume),
			formatter.Sprintf("%.2f", pool.Last7Days.Fee),
			formatter.Sprintf("%d", pool.Last7Days.TransactionCount),
			formatter.Sprintf("%d", pool.Last7Days.UserCount),
		})
	}

	table.SetFooter([]string{
		"Total",
		formatter.Sprintf("%.2f", pools.TotalTVL),
		formatter.Sprintf("%.2f", pools.Last24Hours.Volume),
		formatter.Sprintf("%.2f", pools.Last24Hours.Fee),
		formatter.Sprintf("%d", pools.Last24Hours.TransactionCount),
		formatter.Sprintf("%d", pools.Last24Hours.UserCount),
		formatter.Sprintf("%.2f", pools.Last7Days.Volume),
		formatter.Sprintf("%.2f", pools.Last7Days.Fee),
		formatter.Sprintf("%d", pools.Last7Days.TransactionCount),
		formatter.Sprintf("%d", pools.Last7Days.UserCount),
	})

	table.Render()
}
