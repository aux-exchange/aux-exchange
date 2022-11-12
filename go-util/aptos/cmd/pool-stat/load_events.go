package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/fardream/go-aptos/aptos"
)

func (p *PoolStat) LoadSwaps(ctx context.Context, client *aptos.Client) {
	start := len(p.SwapEvents)
	end := 0
	if p.Pool.SwapEvents != nil {
		end = int(p.Pool.SwapEvents.Counter)
	}

	slice := 100

loadLoop:
	for {
		fmt.Fprintf(os.Stderr, "loading events for pool: %s - start at: %d, end at: %d\n", p.CoinPair, start, end)
		if start >= end {
			break loadLoop
		}

		thisEnd := start + slice
		thisLimit := slice
		if thisEnd > end {
			thisEnd = end
			thisLimit = end - start
		}

		thisStart := aptos.JsonUint64(start)
		limitIn := aptos.JsonUint64(thisLimit)
		resp, err := client.GetEventsByCreationNumber(ctx, &aptos.GetEventsByCreationNumberRequest{
			Address:        p.Pool.SwapEvents.GUID.Id.AccountAddress,
			CreationNumber: p.Pool.SwapEvents.GUID.Id.CreationNumber,
			Start:          &thisStart,
			Limit:          &limitIn,
		})
		if err != nil {
			fmt.Println(err)
			break loadLoop
		}

		for _, ev := range *resp.Parsed {
			var swap aptos.AuxAmm_SwapEvent
			if err := json.Unmarshal(*ev.Data, &swap); err != nil {
				break loadLoop
			}
			p.SwapEvents = append(p.SwapEvents, &swap)
		}

		start = len(p.SwapEvents)

		select {
		case <-ctx.Done():
			break loadLoop
		default:
		}
	}
}
