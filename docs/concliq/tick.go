package concliq

import (
	"log"
	"math/big"
)

// GetSquarePricePow2N calculate (sqrt(1.0001))^(2^n) with precision.
// precision is the number of bits after the decimal points
func GetSquarePricePow2N(n int, precision uint) *big.Int {
	numerator := big.NewInt(10001)
	denominator := big.NewInt(100)

	for ; n > 0; n-- {
		numerator.Mul(numerator, numerator)
		denominator.Mul(denominator, denominator)
	}
	numerator.Mul(numerator, big.NewInt(1).Lsh(big.NewInt(1), precision*2))
	numerator.Sqrt(numerator)
	numerator.Div(numerator, denominator)

	return numerator
}

func IntInverse(bigInt *big.Int, precision uint, roundUp bool) *big.Int {
	one := big.NewInt(0).Lsh(big.NewInt(1), precision*2)
	r := big.NewInt(0).Div(one, bigInt)
	tmp := big.NewInt(0).Mul(r, bigInt)
	if roundUp && tmp.Cmp(one) < 0 {
		r = r.Add(r, big.NewInt(1))
	}

	return r
}

// GetSquarePricePow2N calculate (sqrt(1.0001))^(-2^n) with precision.
// precision is the number of bits after the decimal points
func GetSquarePriceNegPow2N(n int, precision uint) *big.Int {
	numerator := big.NewInt(10000)
	denominator := big.NewInt(10001)

	for ; n > 0; n-- {
		numerator.Mul(numerator, numerator)
		denominator.Mul(denominator, denominator)
	}

	numerator.Mul(numerator, big.NewInt(1).Lsh(big.NewInt(1), precision*2))
	numerator.Div(numerator, denominator)
	numerator.Sqrt(numerator)

	return numerator
}

// TwoPowerPrice contains the sqrt(1.0001)^(2^n) or sqrt(1.0001)^(-2^n)
type TwoPowerPrice struct {
	// StringV is the string representation of the Value
	StringV string
	// BigInt is the value itself.
	BigInt *big.Int
	// I is the n in 2^n or 2^{-n}
	I int
	// TwoP is 2^I
	TwoP int
	// Log2
	Log2          *big.Int
	AbsLog2String string
	IsNeg         bool
}

func NewTwoPowerPrice(i int, bigInt *big.Int, precision uint) *TwoPowerPrice {
	r := &TwoPowerPrice{
		I:       i,
		BigInt:  bigInt,
		StringV: bigInt.String(),
		TwoP:    1 << i,
	}

	log2, err := GetLog2(bigInt, precision)
	if err != nil {
		log.Fatal(err)
	}
	r.Log2 = log2
	r.IsNeg = log2.Sign() < 0
	r.AbsLog2String = log2.Abs(log2).String()

	return r
}

// SquarePriceList contains list of sqrt(1.0001)^(2^n) and sqrt(1.0001)^(-2^n)
type SquarePriceList struct {
	PositiveIndices  []*TwoPowerPrice
	NegativeIndices  []*TwoPowerPrice
	MaxPositiveIndex int
	MinNegativeIndex int
	Precision        uint

	// SquarePrice1 is sqrt(1.0001)
	SquarePrice1 string
	// SquarePrice1Log2 is log_2 sqrt(1.0001)
	SquarePrice1Log2 string

	// SquarePriceNeg1 is 1/sqrt(1.0001)
	SquarePriceNeg1 string
	// SquarePriceNeg1Log2 is log_2 1/sqrt(1.0001)
	SquarePriceNeg1Log2 string
}

func NewSquarePriceList(precision uint) *SquarePriceList {
	if precision <= 32 || precision%32 != 0 || precision > 96 {
		log.Fatalf("%d is not valid precision, must be 64, or 96", precision)
	}

	result := &SquarePriceList{
		MaxPositiveIndex: 443636,
		MinNegativeIndex: 443636,
		Precision:        precision,
	}

	for i := 0; i < 19; i++ {
		positivePrice := GetSquarePricePow2N(i, precision)
		// the two ways of calculating the sqrt(1.0001)^n will generate different result
		// for either 1/sqrt(p) or log_{sqrt(1.0001)} p
		//
		// using GetSquarePriceNegPow2N will get exact log, but will error when the price is obtained from inverse.
		//
		// negativePrice := IntInverse(positivePrice, precision, false)
		negativePrice := GetSquarePriceNegPow2N(i, precision)
		result.NegativeIndices = append(result.NegativeIndices, NewTwoPowerPrice(i, negativePrice, precision+32))
		result.PositiveIndices = append(result.PositiveIndices, NewTwoPowerPrice(i, positivePrice, precision+32))
	}

	result.SquarePrice1 = result.PositiveIndices[0].StringV
	result.SquarePrice1Log2 = result.PositiveIndices[0].AbsLog2String
	result.SquarePriceNeg1 = result.NegativeIndices[0].StringV
	result.SquarePriceNeg1Log2 = result.NegativeIndices[0].AbsLog2String

	return result
}
