package stableswap_test

import (
	"math/big"
	"testing"

	"github.com/aux-exchange/aux-exchange/docs/stableswap"
)

func TestCalculateD(t *testing.T) {
	nCoins := 3
	nBalances := []*big.Int{big.NewInt(1_000_000_000_000_000), big.NewInt(1_000_000_000_000_000), big.NewInt(1_000_000_000_000_000)}
	a := big.NewInt(85)

	d, err := stableswap.CalculateD(nBalances, a, nCoins)
	if err != nil {
		t.Fatalf("failed to calculate d: %v", err)
	}

	sum := big.NewInt(0)
	for _, b := range nBalances {
		sum = sum.Add(sum, b)
	}

	if d.Cmp(sum) != 0 {
		t.Fatalf("looking for %s, got %s", sum.String(), d.String())
	}
}
