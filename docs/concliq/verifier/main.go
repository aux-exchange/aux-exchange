package main

import (
	"fmt"
	"math/big"

	"github.com/aux-exchange/aux-exchange/docs/concliq"
)

var Base1X96 *big.Int = big.NewInt(1).Lsh(big.NewInt(1), 96)

func main() {
	fmt.Println("1          ", Base1X96)
	fmt.Println("sqrt 1.0001", concliq.GetSquarePricePow2N(0, 96))

	v := concliq.NewSquarePriceList(96)
	positive := v.PositiveIndices
	negative := v.NegativeIndices

	m := big.NewInt(0)
	for i, j := range positive {
		j := j.BigInt
		m.Div(j, Base1X96)
		fmt.Printf("%2d %s %s\n", i, j.String(), m.String())
	}

	for i, j := range negative {
		j := j.BigInt
		m.Div(j, Base1X96)
		fmt.Printf("%2d %s %s\n", i, j.String(), m.String())
	}
}
