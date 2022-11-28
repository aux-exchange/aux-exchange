package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fardream/go-aptos/aptos"
	"github.com/fardream/go-aptos/aptos/known"
	"github.com/go-redis/redis/v9"
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
	outputFile := ""
	redisEndpoint := ""

	cmd := cobra.Command{
		Use:   "pool-stat",
		Short: "download pool-stat for aux pools",
	}

	cmd.Flags().StringVarP(&rpc, "rpc-endpoint", "u", rpc, "rpc endpoint to query the events")
	cmd.Flags().VarP(&network, "network", "n", "network to query")
	cmd.Flags().StringVarP(&outputFile, "data-file", "o", outputFile, "data file used to store the data")
	cmd.Flags().StringVarP(&redisEndpoint, "redis-endpoint", "r", redisEndpoint, "redis endpoint to load the data")
	cmd.MarkFlagFilename(outputFile)

	cmd.Run = func(cmd *cobra.Command, args []string) {
		mainFunction(network, rpc, outputFile, redisEndpoint)
	}

	cmd.Execute()
}

func mainFunction(network aptos.Network, rpc, outputFile, redisEndpoint string) {
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
		if coinType == nil {
			continue
		}
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

	known.ReloadHippoCoinRegistry(known.HippoCoinRegistryUrl)

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

		coinX := known.GetCoinInfo(network, resourceType.GenericTypeParameters[0].Struct)
		coinY := known.GetCoinInfo(network, resourceType.GenericTypeParameters[1].Struct)
		if coinX == nil || coinY == nil {
			continue poolReadLoop
		}

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

	if outputFile != "" {
		orPanic(os.WriteFile(outputFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))
	}

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

	if outputFile != "" {
		orPanic(os.WriteFile(outputFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))
	}

	if redisEndpoint != "" {
		redisCtx, redisCtxCancel := context.WithTimeout(context.Background(), time.Minute)
		defer redisCtxCancel()
		rdb := redis.NewClient(&redis.Options{
			Addr: redisEndpoint,
		})

		for _, pool := range pools.Pools {
			coinXTypeString := pool.CoinX.TokenType.Type.String()
			coinYTypeString := pool.CoinY.TokenType.Type.String()
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-tvl", coinXTypeString, coinYTypeString), fmt.Sprintf("%f", pool.TVL), 0)

			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-volume-24h", coinXTypeString, coinYTypeString), fmt.Sprintf("%f", pool.Last24Hours.Volume), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-fee-24h", coinXTypeString, coinYTypeString), fmt.Sprintf("%f", pool.Last24Hours.Fee), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-txcount-24h", coinXTypeString, coinYTypeString), fmt.Sprintf("%d", pool.Last24Hours.TransactionCount), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-usercount-24h", coinXTypeString, coinYTypeString), fmt.Sprintf("%d", pool.Last24Hours.UserCount), 0)

			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-volume-1w", coinXTypeString, coinYTypeString), fmt.Sprintf("%f", pool.Last7Days.Volume), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-fee-1w", coinXTypeString, coinYTypeString), fmt.Sprintf("%f", pool.Last7Days.Fee), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-txcount-1w", coinXTypeString, coinYTypeString), fmt.Sprintf("%d", pool.Last7Days.TransactionCount), 0)
			rdb.Set(redisCtx, fmt.Sprintf("amm-%s-%s-usercount-1w", coinXTypeString, coinYTypeString), fmt.Sprintf("%d", pool.Last7Days.UserCount), 0)
		}

		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-tvl", auxConfig.Address.String()), fmt.Sprintf("%f", pools.TVL), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-volume-24h", auxConfig.Address.String()), fmt.Sprintf("%f", pools.Last24Hours.Volume), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-fee-24h", auxConfig.Address.String()), fmt.Sprintf("%f", pools.Last24Hours.Fee), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-txcount-24h", auxConfig.Address.String()), fmt.Sprintf("%d", pools.Last24Hours.TransactionCount), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-usercount-24h", auxConfig.Address.String()), fmt.Sprintf("%d", pools.Last24Hours.UserCount), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-volume-1w", auxConfig.Address.String()), fmt.Sprintf("%f", pools.Last7Days.Volume), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-fee-1w", auxConfig.Address.String()), fmt.Sprintf("%f", pools.Last7Days.Fee), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-txcount-1w", auxConfig.Address.String()), fmt.Sprintf("%d", pools.Last7Days.TransactionCount), 0)
		rdb.Set(redisCtx, fmt.Sprintf("amm-all-%s-usercount-1w", auxConfig.Address.String()), fmt.Sprintf("%d", pools.Last7Days.UserCount), 0)

	}
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
		formatter.Sprintf("%.2f", pools.TVL),
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
