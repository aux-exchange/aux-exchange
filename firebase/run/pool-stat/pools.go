package main

import (
	"regexp"
	"time"

	"github.com/fardream/go-aptos/aptos"
	"github.com/fardream/go-aptos/aptos/known"
)

const bpsDenominator = 10_000

type Stat struct {
	Volume           float64             `json:"volume"`
	Fee              float64             `json:"fee"`
	TransactionCount int                 `json:"transaction_count"`
	UserCount        int                 `json:"user_count"`
	Users            map[string]struct{} `json:"-"`
}

func (s *Stat) Reset() {
	s.Volume = 0
	s.Fee = 0
	s.TransactionCount = 0
	if s.Users != nil {
		// golang.org/x/exp/maps can be used here, but does look a little over kill for such simple functionality
		for k := range s.Users {
			delete(s.Users, k)
		}
	} else {
		s.Users = make(map[string]struct{})
	}
}

type SwapStat struct {
	Last7Days   Stat    `json:"last_7days"`
	Last24Hours Stat    `json:"last_24hours"`
	TVL         float64 `json:"tvl"`
}

type SwapEvent struct {
	aptos.AuxAmm_SwapEvent
	SequenceNumber aptos.JsonUint64 `json:"sequence_number"`
}

type PoolStat struct {
	Pool     *aptos.AuxAmmPool             `json:"pool"`
	CoinX    *known.HippoCoinRegistryEntry `json:"coin_x"`
	CoinY    *known.HippoCoinRegistryEntry `json:"coin_y"`
	CoinPair string                        `json:"coin_pair"`

	SwapEvents []*SwapEvent `json:"swap_events"`

	MaxSequenceNumber aptos.JsonUint64 `json:"max_sequence_number"`

	SwapStat
}

type AllPools struct {
	Pools map[string]*PoolStat `json:"pools"`

	SwapStat `json:"total_stat"`

	Timestamp time.Time `json:"timestamp"`
}

var allDecimals = []int64{1, 10, 100, 1000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000}

func getDecimal(n uint8) int64 {
	if len(allDecimals) < int(n) {
		for i := len(allDecimals); i < int(n); i++ {
			allDecimals = append(allDecimals, allDecimals[i-1]*10)
		}
	}

	return allDecimals[n]
}

var regexUSDC = regexp.MustCompile("-USDC$")

func (ap *AllPools) FillTVL() {
	for remaining, i := len(ap.Pools), 0; remaining > 0 && i < 256; i++ {
		for _, pool := range ap.Pools {
			if !regexUSDC.MatchString(pool.CoinPair) && i == 0 {
				continue // for first loop, only check of USDC
			}

			if pool.Pool.XReserve.Value == 0 || pool.Pool.YReserve.Value == 0 {
				continue
			}
			if pool.TVL > 0 {
				continue
			}

			pool.TVL = 0
			decimalX := float64(DecimalByType[pool.CoinX.TokenType.Type.String()])
			xv := float64(pool.Pool.XReserve.Value) / decimalX
			priceX, hasPriceX := PriceBySymbol[pool.CoinX.Symbol]
			decimalY := float64(DecimalByType[pool.CoinY.TokenType.Type.String()])
			yv := float64(pool.Pool.YReserve.Value) / decimalY
			priceY, hasPriceY := PriceBySymbol[pool.CoinY.Symbol]
			if hasPriceX && hasPriceY {
				remaining--
				pool.TVL = xv*priceX + yv*priceY
			} else if hasPriceX && !hasPriceY {
				priceY = xv / yv * priceX
				PriceBySymbol[pool.CoinY.Symbol] = priceY
				PriceByTypeTag[pool.CoinY.TokenType.Type.String()] = priceY
			} else if hasPriceY && !hasPriceX {
				priceX = yv / xv * priceY
				PriceBySymbol[pool.CoinX.Symbol] = priceX
				PriceByTypeTag[pool.CoinX.TokenType.Type.String()] = priceX
			}
		}
	}

	ap.TVL = 0
	for _, pool := range ap.Pools {
		ap.TVL += pool.TVL
	}
}

var DecimalByType map[string]int64 = make(map[string]int64)

var PriceBySymbol map[string]float64 = make(map[string]float64)

var PriceByTypeTag map[string]float64 = make(map[string]float64)

var allStables map[string]*known.HippoCoinRegistryEntry = make(map[string]*known.HippoCoinRegistryEntry)

var allStablesByType = make(map[string]string)

func isStableType(typeTag string) bool {
	_, ok := allStablesByType[typeTag]
	return ok
}

func (p *PoolStat) FillStat(now time.Time) {
	p.Last24Hours.Reset()
	p.Last7Days.Reset()

	for _, ev := range p.SwapEvents {
		microseconds := ev.Timestamp
		swapTime := time.Unix(0, int64(microseconds)*1000)
		diff := now.Sub(swapTime)
		if diff <= 24*7*time.Hour {
			volume := 0.0
			fee := 0.0
			if isStableType(ev.OutCoinType.String()) {
				decimalOut := float64(DecimalByType[ev.OutCoinType.String()])
				feeInt := (uint64(ev.FeeBps) * uint64(ev.OutAu)) / bpsDenominator
				fee = float64(feeInt) / decimalOut
				volume = float64(ev.OutAu) / decimalOut
			} else {
				inType := ev.InCoinType.String()
				decimalin := float64(DecimalByType[inType])
				feeInt := (uint64(ev.FeeBps) * uint64(ev.InAu)) / bpsDenominator
				fee = float64(feeInt) / decimalin * PriceByTypeTag[inType]
				volume = float64(ev.InAu) / decimalin * PriceByTypeTag[inType]
			}

			p.Last7Days.Fee += fee
			p.Last7Days.Volume += volume
			p.Last7Days.TransactionCount += 1
			p.Last7Days.Users[ev.SenderAddr.String()] = struct{}{}

			if diff <= 24*time.Hour {
				p.Last24Hours.Fee += fee
				p.Last24Hours.Volume += volume
				p.Last24Hours.TransactionCount += 1
				p.Last24Hours.Users[ev.SenderAddr.String()] = struct{}{}
			}
		}
	}

	p.Last7Days.UserCount = len(p.Last7Days.Users)
	p.Last24Hours.UserCount = len(p.Last24Hours.Users)
}

func (ap *AllPools) FillStat() {
	ap.Last24Hours.Reset()
	ap.Last7Days.Reset()
	for _, p := range ap.Pools {
		p.FillStat(ap.Timestamp)

		ap.Last7Days.Fee += p.Last7Days.Fee
		ap.Last7Days.Volume += p.Last7Days.Volume
		ap.Last7Days.TransactionCount += p.Last7Days.TransactionCount
		for u := range p.Last7Days.Users {
			ap.Last7Days.Users[u] = struct{}{}
		}

		ap.Last24Hours.Fee += p.Last24Hours.Fee
		ap.Last24Hours.Volume += p.Last24Hours.Volume
		ap.Last24Hours.TransactionCount += p.Last24Hours.TransactionCount
		for u := range p.Last24Hours.Users {
			ap.Last24Hours.Users[u] = struct{}{}
		}
	}

	ap.Last7Days.UserCount = len(ap.Last7Days.Users)
	ap.Last24Hours.UserCount = len(ap.Last24Hours.Users)
}
