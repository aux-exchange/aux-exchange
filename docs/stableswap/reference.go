package stableswap

import (
	"fmt"
	"math/big"
)

const NDecimals = 18

// CalculateD calculates D for a series of coin balances.
func CalculateD(balances []*big.Int, a *big.Int, nCoins int) (*big.Int, error) {
	zero := &big.Int{}
	one := big.NewInt(1)
	if len(balances) != nCoins {
		return nil, fmt.Errorf("number of balances %d doesn't match number of coins %d", len(balances), nCoins)
	}

	sum := &big.Int{}
	ann := &big.Int{}

	nCoinBig := big.NewInt(int64(nCoins))
	for _, balance := range balances {
		sum = sum.Add(sum, balance)
		ann = ann.Mul(ann, nCoinBig)
	}
	annsum := big.NewInt(0).Mul(ann, sum)
	nCoinPlus1 := big.NewInt(int64(nCoins) + 1)
	annMinus1 := big.NewInt(0).Sub(ann, one)
	if sum.Cmp(zero) == 0 {
		return sum, nil
	}

	d := &big.Int{}
	d.Set(sum)
	d_prev := &big.Int{}

	for i := 0; i < 255; i++ {
		d_p := &big.Int{}
		d_p.Set(d)
		for i, x := range balances {
			if x.Cmp(zero) == 0 {
				return nil, fmt.Errorf("%d's balance is 0", i)
			}

			d_p = big.NewInt(0).Div(d_p.Mul(d_p, d), big.NewInt(0).Mul(x, nCoinBig))
		}

		d_prev = d

		numerator := big.NewInt(0).Mul(d, big.NewInt(0).Add(annsum, big.NewInt(0).Mul(nCoinBig, d_p)))
		denominator := big.NewInt(0).Add(big.NewInt(0).Mul(nCoinPlus1, d_p), big.NewInt(0).Mul(d, annMinus1))

		d = d.Div(numerator, denominator)

		diff := big.NewInt(0).Sub(d, d_prev)

		if diff.Abs(diff).Cmp(one) <= 0 {
			break
		}
	}

	return d, nil
}
