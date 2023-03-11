package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"github.com/fardream/go-aptos/aptos"
	"github.com/fardream/go-aptos/aptos/known"
	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"
	"google.golang.org/api/option"
)

func main() {
	network := aptos.Mainnet
	rpc := ""
	outputFile := ""
	firestoreCredential := ""
	firestoreProject := ""
	skipVolume := false
	inputFile := ""

	cmd := cobra.Command{
		Use:   "pool-stat",
		Short: "download pool-stat for aux pools",
	}

	cmd.Flags().StringVarP(&rpc, "rpc-endpoint", "u", rpc, "rpc endpoint to query the events")
	cmd.Flags().VarP(&network, "network", "n", "network to query")
	cmd.Flags().StringVarP(&outputFile, "data-file", "o", outputFile, "data file used to store the data")
	cmd.MarkFlagFilename(outputFile, "json")
	cmd.Flags().StringVar(&firestoreCredential, "firestore-credential", firestoreCredential, "firestore service account credential file to use")
	cmd.MarkFlagFilename("filestore-credenetial")
	cmd.Flags().StringVar(&firestoreProject, "firestore-project", firestoreProject, "filestore project to use")
	cmd.Flags().BoolVar(&skipVolume, "skip-volume", skipVolume, "skip calculating volume from events")
	cmd.Flags().StringVarP(&inputFile, "input-file", "i", inputFile, "input file for events loaded")
	cmd.MarkFlagFilename("input-file", "json")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		mainFunction(network, rpc, outputFile, inputFile, firestoreCredential, firestoreProject, skipVolume)
	}

	cmd.Execute()
}

func createFilebaseApp(ctx context.Context, firestoreCredential, firestoreProject string) *firebase.App {
	if firestoreCredential != "" {
		sa := option.WithCredentialsFile(firestoreCredential)
		return getOrPanic(firebase.NewApp(ctx, nil, sa))
	} else if firestoreProject != "" {
		return getOrPanic(firebase.NewApp(ctx, &firebase.Config{ProjectID: firestoreProject}))
	}

	return nil
}

func mainFunction(network aptos.Network, rpc, outputFile, inputFile, firestoreCredential, firestoreProject string, skipVolume bool) {
	if firestoreCredential != "" && firestoreProject == "" {
		orPanic(fmt.Errorf("must set firestore project when using a credential"))
	}

	// update hippo coin registry
	known.ReloadHippoCoinRegistry(known.HippoCoinRegistryUrl)

	// update prices for all stable coins
	for _, usdSymbol := range []string{
		"USDC",
		"USDCso",
		"USDT",
		"ceUSDC",
		"ceDAI",
		"ceUSDT",
		"zUSDC",
		"zUSDT",
		"BUSD",
		"ceBUSD",
		"zBUSD",
	} {
		coinType := known.GetCoinInfoBySymbol(network, usdSymbol)
		if coinType == nil {
			continue
		}
		allStables[usdSymbol] = coinType
		PriceBySymbol[usdSymbol] = 1
		PriceByTypeTag[coinType.TokenType.Type.String()] = 1
	}

	// load the aux resources account which contains all amms
	client := aptos.MustNewClient(network, rpc)

	auxConfig := getOrPanic(aptos.GetAuxClientConfig(network))

	auxResources := getOrPanic(client.GetAccountResources(context.Background(), &aptos.GetAccountResourcesRequest{
		Address: auxConfig.Address,
	}))

	pools := AllPools{
		Pools:     make(map[string]*PoolStat),
		Timestamp: time.Now(),
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

	var firebaseApp *firebase.App = nil

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT)
	defer cancel()

	ammRawObjectName := fmt.Sprintf("amm-%s-raw.json", auxResources.Headers.AptosChainId)
	bucketName := fmt.Sprintf("%s.appspot.com", firestoreProject)
	var anotherPoolBytes []byte

	if inputFile != "" {
		anotherPoolBytes = getOrPanic(os.ReadFile(inputFile))
	} else if firestoreCredential != "" || firestoreProject != "" {
		firebaseApp = createFilebaseApp(ctx, firestoreCredential, firestoreProject)
		storageClient := getOrPanic(firebaseApp.Storage(ctx))
		bucket, err := storageClient.Bucket(bucketName)
		if err == nil {
			handle := bucket.Object(ammRawObjectName)
			if _, err := handle.Attrs(ctx); err == nil {
				anotherPoolBytes = getOrPanic(io.ReadAll(getOrPanic(handle.NewReader(ctx))))
			} else if err == storage.ErrObjectNotExist {
				fmt.Fprintf(os.Stderr, "%s doesn't exist\n", ammRawObjectName)
			}
		}
	}

	if len(anotherPoolBytes) > 0 {
		anotherPools := &AllPools{}
		orPanic(json.Unmarshal(anotherPoolBytes, anotherPools))
		if anotherPools.Pools != nil {
			for poolKey, poolV := range anotherPools.Pools {
				if pool, ok := pools.Pools[poolKey]; !ok {
					pools.Pools[poolKey] = poolV
					pool = pools.Pools[poolKey]
				} else {
					pool.MaxSequenceNumber = poolV.MaxSequenceNumber
					pool.SwapEvents = poolV.SwapEvents
				}
			}
		}
	}

	if outputFile != "" {
		orPanic(os.WriteFile(outputFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))
	}

	if !skipVolume {
	fillPoolLoop:
		for _, pool := range pools.Pools {
			pool.LoadSwaps(ctx, client, pools.Timestamp)
			select {
			case <-ctx.Done():
				break fillPoolLoop
			default:
			}
		}
	}

	pools.FillStat()

	if outputFile != "" {
		orPanic(os.WriteFile(outputFile, getOrPanic(json.MarshalIndent(pools, "", "  ")), 0o666))
	}

	if (firestoreCredential != "" || firestoreProject != "") && firebaseApp == nil {
		firebaseApp = createFilebaseApp(ctx, firestoreCredential, firestoreProject)
	}

	if firebaseApp != nil {
		writeFirestore(ctx, firebaseApp, &pools, auxConfig)
		storageClient := getOrPanic(firebaseApp.Storage(ctx))

		bucket := getOrPanic(storageClient.Bucket(bucketName))
		handle := bucket.Object(ammRawObjectName)

		w := handle.NewWriter(ctx)
		defer w.Close()

		j := json.NewEncoder(w)
		orPanic(j.Encode(pools))
	}

	writeTable(os.Stdout, &pools)
}
