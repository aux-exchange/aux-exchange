package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/fardream/go-aptos/aptos"
)

func (p *PoolStat) LoadSwaps(ctx context.Context, client *aptos.Client, now time.Time) {
	weekDuration := 7 * 24 * time.Hour

	start := p.MaxSequenceNumber + 1
	var end aptos.JsonUint64 = 0
	if p.Pool.SwapEvents != nil {
		end = p.Pool.SwapEvents.Counter
	}

	// max limit allowed by aptos fullnode looks to be 25.
	var slice aptos.JsonUint64 = 25

loadLoop:
	for {
		if start >= end {
			break loadLoop
		}

		thisEnd := start + slice
		thisLimit := slice
		if thisEnd > end {
			thisEnd = end
			thisLimit = end - start
		}

		thisStart := start

		fmt.Fprintf(os.Stderr, "loading events for pool: %s - start at: %d, limit: %d, end at: %d\n", p.CoinPair, thisStart, thisLimit, end)

		resp, err := client.GetEventsByCreationNumber(ctx, &aptos.GetEventsByCreationNumberRequest{
			Address:        p.Pool.SwapEvents.GUID.Id.AccountAddress,
			CreationNumber: p.Pool.SwapEvents.GUID.Id.CreationNumber,
			Start:          &thisStart,
			Limit:          &thisLimit,
		})
		if err != nil {
			fmt.Println(err)
			break loadLoop
		}

		for _, ev := range *resp.Parsed {
			var swap SwapEvent
			if err := json.Unmarshal(*ev.Data, &swap.AuxAmm_SwapEvent); err != nil {
				fmt.Fprintf(os.Stderr, "error parsing data: seq: %d, data: %s\n", ev.SequenceNumber, string(*ev.Data))
				continue loadLoop
			}
			swap.SequenceNumber = ev.SequenceNumber
			p.SwapEvents = append(p.SwapEvents, &swap)
			if p.MaxSequenceNumber < ev.SequenceNumber {
				p.MaxSequenceNumber = ev.SequenceNumber
			}
		}

		start = p.MaxSequenceNumber + 1

		select {
		case <-ctx.Done():
			break loadLoop
		default:
		}
	}

	tmp := make([]*SwapEvent, 0, len(p.SwapEvents))
	for _, ev := range p.SwapEvents {
		if now.Sub(time.Unix(0, int64(ev.Timestamp)*1000)) > weekDuration {
			continue
		}
		tmp = append(tmp, ev)
	}

	p.SwapEvents = tmp
}
