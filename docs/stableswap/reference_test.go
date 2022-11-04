package stableswap

import (
	"fmt"
	"math/big"
	"testing"
)

func TestCalculateD(t *testing.T) {
	a := big.NewInt(15)
	for _, test := range ThreeCoinTestCases {
		nCoins := 3
		x0, _ := big.NewInt(0).SetString(test[0], 10)
		x1, _ := big.NewInt(0).SetString(test[1], 10)
		x2, _ := big.NewInt(0).SetString(test[2], 10)
		ed, _ := big.NewInt(0).SetString(test[3], 10)
		d, err := CalculateD(a, nCoins, x0, x1, x2)
		if err != nil {
			t.Fatalf("failed to calculate d: %v", err)
		}
		if d.Cmp(ed) != 0 {
			t.Fatalf("looking for %s, got %s", ed.String(), d.String())
		}
	}

	for _, test := range TwoCoinTestCases {
		nCoins := 2
		x0, _ := big.NewInt(0).SetString(test[0], 10)
		x1, _ := big.NewInt(0).SetString(test[1], 10)
		ed, _ := big.NewInt(0).SetString(test[2], 10)
		d, err := CalculateD(a, nCoins, x0, x1)
		if err != nil {
			t.Fatalf("failed to calculate d: %v", err)
		}
		if d.Cmp(ed) != 0 {
			t.Fatalf("looking for %s, got %s", ed.String(), d.String())
		}
	}
}

func ExampleCalculateD() {
	a := big.NewInt(300)
	test := TwoCoinTestCases[0]
	x0, _ := big.NewInt(0).SetString(test[0], 10)
	x1 := big.NewInt(1_000_000_000)

	d, err := CalculateD(a, 2, x0, x1)
	if err != nil {
		panic(err)
	}

	v := big.NewInt(0).Div(x0, d)

	fmt.Printf("x0: %s, x1: %s, d: %s, x0/d: %s\n", x0.String(), x1.String(), d.String(), v.String())

	// Output: x0: 1000000000000000000000, x1: 1000000000, d: 1685917616243366874, x0/d: 593
}

func TestCalculateXi(t *testing.T) {
	a := big.NewInt(15)
	one := big.NewInt(1)

	for _, test := range ThreeCoinTestCases {
		nCoins := 3
		x0, _ := big.NewInt(0).SetString(test[0], 10)
		x1, _ := big.NewInt(0).SetString(test[1], 10)
		x2, _ := big.NewInt(0).SetString(test[2], 10)
		d, _ := big.NewInt(0).SetString(test[3], 10)

		xi, err := CalculateXi(a, nCoins, d, x0, x1)
		if err != nil {
			t.Fatalf("failed to calculate xi: %v", err)
		}

		diff := big.NewInt(0).Sub(xi, x2)
		diff = diff.Abs(diff)
		if diff.Cmp(one) > 0 {
			t.Fatalf("looking for %s, got %s", x2.String(), xi.String())
		}

		x2y, err := CalculateXiWithI(a, nCoins, d, 2, x0, x1)
		if err != nil {
			t.Fatalf("failed to calculate xi: %v", err)
		}
		diff = diff.Sub(x2y, x2)

		if x2y.Cmp(x2) != 0 {
			t.Fatalf("want: %s, has: %s, diff: %s", x2.String(), x2y.String(), diff.String())
		}
	}

	for _, test := range TwoCoinTestCases {
		nCoins := 2
		x0, _ := big.NewInt(0).SetString(test[0], 10)
		x1, _ := big.NewInt(0).SetString(test[1], 10)
		d, _ := big.NewInt(0).SetString(test[2], 10)

		xi, err := CalculateXi(a, nCoins, d, x0)
		if err != nil {
			t.Fatalf("failed to calculate xi: %v", err)
		}

		diff := big.NewInt(0).Sub(xi, x1)
		diff = diff.Abs(diff)
		if diff.Cmp(one) > 0 {
			t.Fatalf("looking for %s, got %s", x1.String(), xi.String())
		}
	}
}
