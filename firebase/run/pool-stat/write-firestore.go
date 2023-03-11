package main

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/fardream/go-aptos/aptos"
)

func writeFirestore(ctx context.Context, app *firebase.App, pools *AllPools, auxConfig *aptos.AuxClientConfig) {
	client := getOrPanic(app.Firestore(ctx))
	defer client.Close()

	now := time.Now()

	toWrite := make(map[string]any)
	toWrite["expire_at"] = now.Add(72 * time.Hour)

	for _, pool := range pools.Pools {
		coinXTypeString := pool.CoinX.TokenType.Type.String()
		coinYTypeString := pool.CoinY.TokenType.Type.String()
		toWrite[fmt.Sprintf("%s-%s-tvl", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%f", pool.TVL)
		toWrite[fmt.Sprintf("%s-%s-volume-24h", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%f", pool.Last24Hours.Volume)
		toWrite[fmt.Sprintf("%s-%s-fee-24h", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%f", pool.Last24Hours.Fee)
		toWrite[fmt.Sprintf("%s-%s-txcount-24h", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%d", pool.Last24Hours.TransactionCount)
		toWrite[fmt.Sprintf("%s-%s-usercount-24h", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%d", pool.Last24Hours.UserCount)
		toWrite[fmt.Sprintf("%s-%s-volume-1w", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%f", pool.Last7Days.Volume)
		toWrite[fmt.Sprintf("%s-%s-fee-1w", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%f", pool.Last7Days.Fee)
		toWrite[fmt.Sprintf("%s-%s-txcount-1w", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%d", pool.Last7Days.TransactionCount)
		toWrite[fmt.Sprintf("%s-%s-usercount-1w", coinXTypeString, coinYTypeString)] = fmt.Sprintf("%d", pool.Last7Days.UserCount)
	}

	toWrite[fmt.Sprintf("all-%s-tvl", auxConfig.Address.String())] = fmt.Sprintf("%f", pools.TVL)
	toWrite[fmt.Sprintf("all-%s-volume-24h", auxConfig.Address.String())] = fmt.Sprintf("%f", pools.Last24Hours.Volume)
	toWrite[fmt.Sprintf("all-%s-fee-24h", auxConfig.Address.String())] = fmt.Sprintf("%f", pools.Last24Hours.Fee)
	toWrite[fmt.Sprintf("all-%s-txcount-24h", auxConfig.Address.String())] = fmt.Sprintf("%d", pools.Last24Hours.TransactionCount)
	toWrite[fmt.Sprintf("all-%s-usercount-24h", auxConfig.Address.String())] = fmt.Sprintf("%d", pools.Last24Hours.UserCount)
	toWrite[fmt.Sprintf("all-%s-volume-1w", auxConfig.Address.String())] = fmt.Sprintf("%f", pools.Last7Days.Volume)
	toWrite[fmt.Sprintf("all-%s-fee-1w", auxConfig.Address.String())] = fmt.Sprintf("%f", pools.Last7Days.Fee)
	toWrite[fmt.Sprintf("all-%s-txcount-1w", auxConfig.Address.String())] = fmt.Sprintf("%d", pools.Last7Days.TransactionCount)
	toWrite[fmt.Sprintf("all-%s-usercount-1w", auxConfig.Address.String())] = fmt.Sprintf("%d", pools.Last7Days.UserCount)

	_ = getOrPanic(client.Collection("pools").Doc("stat").Set(ctx, toWrite, firestore.MergeAll))
}
