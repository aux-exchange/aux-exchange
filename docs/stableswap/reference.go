// stableswap is the reference implementation of stable swap for https://aux.exchange.
//
// The idea is to generate test cases and implementation details in a more capable languange and
// verify the mathematics. It doesn't involve onchain logics or other.
package stableswap

import (
	"fmt"
	"math/big"
)

const NDecimals = 18

// CalculateD calculates D for a series of coin balances.
//
// See stable swap doc for details.
func CalculateD(amp *big.Int, nCoins int, xi ...*big.Int) (*big.Int, error) {
	if nCoins < 2 {
		return nil, fmt.Errorf("number of coins is smaller than 2: %d", nCoins)
	}
	// check the length of the coins.
	if len(xi) != nCoins {
		return nil, fmt.Errorf("number of balances %d doesn't match number of coins %d", len(xi), nCoins)
	}

	// zero
	zero := &big.Int{}
	// 1
	one := big.NewInt(1)

	// sum of all x_i s
	sum := &big.Int{}
	// Ann -> An^n
	ann := (&big.Int{}).Set(amp)

	nCoinBig := big.NewInt(int64(nCoins))

	for i, balance := range xi {
		if balance.Cmp(zero) < 0 {
			return nil, fmt.Errorf("balance of coin %d:%s is smaller than zero", i, balance.String())
		}

		sum = sum.Add(sum, balance)
		ann = ann.Mul(ann, nCoinBig)
	}

	// An^n * \sum x_i
	annsum := big.NewInt(0).Mul(ann, sum)
	// n + 1
	nCoinPlus1 := big.NewInt(int64(nCoins) + 1)
	// Ann - 1
	annMinus1 := big.NewInt(0).Sub(ann, one)

	if sum.Cmp(zero) == 0 {
		return sum, nil
	}

	// initial value of d
	d := (&big.Int{}).Set(sum)

	dPrev := &big.Int{}

	for i := 0; i < 255; i++ {
		// calculate D_p
		dP := &big.Int{}
		dP.Set(d)

		for i, x := range xi {
			if x.Cmp(zero) == 0 {
				return nil, fmt.Errorf("%d's balance is 0", i)
			}

			dP = dP.Mul(dP, d)
			dP = dP.Div(dP, big.NewInt(0).Mul(x, nCoinBig))
		}

		// copy over the d
		dPrev.Set(d)

		numerator := (&big.Int{}).Mul(nCoinBig, dP)
		numerator = numerator.Add(numerator, annsum)
		numerator = numerator.Mul(numerator, d)

		denominator := (&big.Int{}).Mul(nCoinPlus1, dP)
		denominator = denominator.Add(denominator, big.NewInt(0).Mul(d, annMinus1))

		d = d.Div(numerator, denominator)

		diff := big.NewInt(0).Sub(d, dPrev)

		if diff.Abs(diff).Cmp(one) <= 0 {
			return d, nil
		}
	}

	return nil, fmt.Errorf("failed converging after 256 iterations, d is now: %s", d.String())
}

func CalculateXi(amp *big.Int, nCoins int, d *big.Int, xj ...*big.Int) (*big.Int, error) {
	if nCoins < 2 {
		return nil, fmt.Errorf("number of coins %d is smaller than 2", nCoins)
	}
	if len(xj) != nCoins-1 {
		return nil, fmt.Errorf("number of coin balances %d is not number of coins (%d) - 1", len(xj), nCoins)
	}

	// zero
	zero := &big.Int{}
	// 1
	one := big.NewInt(1)
	nCoinBig := big.NewInt(int64(nCoins))

	sum_ex_i := big.NewInt(0)
	c := big.NewInt(0).Set(d)
	// Ann -> An^n
	ann := (&big.Int{}).Mul(amp, nCoinBig)

	for i, balance := range xj {
		if balance.Cmp(zero) <= 0 {
			return nil, fmt.Errorf("%d's balance is smaller or equal to 0: %s", i, balance.String())
		}

		c = c.Mul(c, d)
		c = c.Div(c, big.NewInt(0).Mul(nCoinBig, balance))

		ann = ann.Mul(ann, nCoinBig)
		sum_ex_i = sum_ex_i.Add(sum_ex_i, balance)
	}

	c = c.Mul(c, d)
	c = c.Div(c, big.NewInt(0).Mul(ann, nCoinBig))

	b := big.NewInt(0).Div(d, ann)
	b = b.Add(sum_ex_i, b)

	xi := big.NewInt(0).Set(d)

	for i := 0; i < 256; i++ {
		numerator := big.NewInt(0).Mul(xi, xi)
		numerator = numerator.Add(numerator, c)

		denominator := big.NewInt(0).Add(xi, xi)
		denominator = denominator.Add(denominator, b)
		denominator = denominator.Sub(denominator, d)

		xiPrev := big.NewInt(0).Set(xi)
		xi = xi.Div(numerator, denominator)
		xiPrev.Sub(xiPrev, xi)
		xiPrev = xiPrev.Abs(xiPrev)
		if xiPrev.Cmp(one) <= 0 {
			return xi, nil
		}
	}

	return nil, fmt.Errorf("failed converging after 256 iterations, xi is now: %s", xi.String())
}

func CalculateXiWithI(amp *big.Int, nCoins int, d *big.Int, i int, xj ...*big.Int) (*big.Int, error) {
	xi, err := CalculateXi(amp, nCoins, d, xj...)
	if err != nil {
		return nil, err
	}

	newD, err := CalculateD(amp, nCoins, append(append(xj[0:i], xi), xj[i:]...)...)
	if err != nil {
		return nil, err
	}

	if newD.Cmp(d) < 0 {
		return xi.Add(xi, big.NewInt(1)), nil
	} else {
		return xi, nil
	}
}
