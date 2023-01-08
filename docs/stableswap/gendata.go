package stableswap

import (
	"fmt"
	"strings"
)

type poolCoinI struct {
	I        int
	CoinName string
	Others   []int
	Befores  []int
	Afters   []int
	NotLast  bool
}

type PoolGen struct {
	// N is number of coins.
	N int
	// LastIndex is number of coins - 1
	LastIndex int
	Xis       []*poolCoinI

	AllPerms [][]*poolCoinI

	Precision     uint64
	NPrecision    int
	BalanceScaler uint64

	NameTake int

	Decimals []uint64

	CoinTypeList string

	MaxU64 uint64

	MaxDecimal uint64

	GenPermutation bool

	FeeDenominator  uint64
	MaxFeeNumerator uint64
	MinFeeNumerator uint64

	MaxAmp uint64

	WarningForManualEdit string

	UseQuoter bool

	IsQuoter   bool
	ModuleName string

	StructParamName string
}

func NewPoolGen(n int, isQuoter bool) *PoolGen {
	if n <= 1 {
		panic(fmt.Errorf("too few coins: %d", n))
	}
	r := &PoolGen{
		N:          n,
		LastIndex:  n - 1,
		NPrecision: 18,
		MaxDecimal: 10,

		GenPermutation: false,

		FeeDenominator:  10_000_000_000, // 1e10
		MaxFeeNumerator: 30_000_000,     // 30bps
		MinFeeNumerator: 1_000_000,      // 1bps

		Precision: 1_000_000_000_000_000_000, // 1e18

		BalanceScaler: 10_000_000_000, // 1e10

		MaxU64: 18_446_744_073_709_551_615,

		MaxAmp: 2000,

		WarningForManualEdit: `/// Auto generated from github.com/aux-exchange/aux-exchange/docs/stableswap
/// don't modify by hand!`,
		IsQuoter:   isQuoter,
		ModuleName: fmt.Sprintf("stable_%dpool", n),
	}

	coinTypes := []string{}

	for i := 0; i < n; i++ {
		coinTypes = append(coinTypes, fmt.Sprintf("Coin%d", i))
		xi := &poolCoinI{
			I:        i,
			CoinName: fmt.Sprintf("Coin<Coin%d>", i),
		}

		if isQuoter {
			xi.CoinName = "u64"
		}

		if i < n-1 {
			xi.NotLast = true
		}

		for j := 0; j < n; j++ {
			if j != i {
				xi.Others = append(xi.Others, j)
				if j < i {
					xi.Befores = append(xi.Befores, j)
				}
				if j > i {
					xi.Afters = append(xi.Afters, j)
				}
			}
		}
		r.Xis = append(r.Xis, xi)
	}

	r.AllPerms = getAllPerms(r.Xis)

	r.NameTake = 32 / n
	if 32%n == 0 && r.NameTake > 1 {
		r.NameTake = r.NameTake - 1
	}

	r.Decimals = []uint64{10}
	for i := 1; i < 18; i++ {
		last := r.Decimals[i-1]
		r.Decimals = append(r.Decimals, last*10)
	}
	for i := 0; i < 9; i++ {
		r.Decimals[i], r.Decimals[17-i] = r.Decimals[17-i], r.Decimals[i]
	}

	r.Decimals = r.Decimals[:r.MaxDecimal]

	r.CoinTypeList = fmt.Sprintf("<%s>", strings.Join(coinTypes, ", "))

	r.StructParamName = fmt.Sprintf("Pool%s", r.CoinTypeList)
	if isQuoter {
		r.ModuleName = fmt.Sprintf("quoter_%dpool", n)
		r.StructParamName = "Quoter"
		r.CoinTypeList = ""
	}

	return r
}
