package concliq

import (
	"fmt"
	"math/big"
)

func ShiftY(y *big.Int, one *big.Int, two *big.Int) (*big.Int, int) {
	i := 0
	for y.Cmp(two) >= 0 {
		i++
		y.Rsh(y, 1)
	}

	for y.Cmp(one) < 0 {
		i--
		y.Lsh(y, 1)
	}

	return y, i
}

func GetLog2(y *big.Int, precision uint) (*big.Int, error) {
	if y.Sign() < 0 {
		return nil, fmt.Errorf("negative input to GetLog2: %s", y.String())
	}
	x := big.NewInt(0).Set(y)
	one := big.NewInt(0).Lsh(big.NewInt(1), precision)
	two := big.NewInt(0).Lsh(big.NewInt(2), precision)
	z_2, shifted := ShiftY(x, one, two)

	r := big.NewInt(0)
	var sum_m uint = 0

log2loop:
	for {
		if z_2.Cmp(one) == 0 {
			break log2loop
		}
		z := big.NewInt(0)
		z.Mul(z_2, z_2)
		z.Rsh(z, uint(precision))
		sum_m += 1
		if sum_m > precision {
			break
		}
		if z.Cmp(two) >= 0 {
			r.Add(r, big.NewInt(0).Rsh(one, sum_m))
			z_2.Rsh(z, 1)
		} else {
			z_2.Set(z)
		}
	}

	sumed := big.NewInt(int64(shifted))
	if shifted < 0 {
		sumed.Neg(sumed)
		sumed.Lsh(sumed, precision)
		sumed.Neg(sumed)
	} else {
		sumed.Lsh(sumed, precision)
	}

	sumed.Add(sumed, r)

	return sumed, nil
}
