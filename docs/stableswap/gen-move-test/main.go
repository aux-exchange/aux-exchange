package main

import (
	_ "embed"
	"fmt"
	"math/big"
	"os"
	"strings"
	"text/template"

	"github.com/aux-exchange/aux-exchange/docs/stableswap"
	"github.com/spf13/cobra"
)

//go:embed math_2pool_test.move.template
var twoPoolTestMoveTemplate string

//go:embed math_3pool_test.move.template
var threePoolTestMoveTemplate string

type TwoPoolTest struct {
	Id         int
	X0         string
	X1         string
	D          string
	ExpectedX1 string
}

type ThreePoolTest struct {
	Id         int
	X0         string
	X1         string
	X2         string
	D          string
	ExpectedX2 string
}

type TwoPoolTests struct {
	Tests []*TwoPoolTest
}

type ThreePoolTests struct {
	Tests []*ThreePoolTest
}

func twoPoolCmd() *cobra.Command {
	originalTests := stableswap.TwoCoinTestCases

	cmd := &cobra.Command{
		Use:   "2pool",
		Short: "generate move test for 2pool",
		Args:  cobra.NoArgs,
	}

	var output string
	var ntest uint32 = 30

	cmd.Flags().StringVarP(&output, "output", "o", output, "2 pool output")
	cmd.MarkFlagFilename("output")
	cmd.MarkFlagRequired("output")
	cmd.Flags().Uint32VarP(&ntest, "n-test", "n", ntest, fmt.Sprintf("number of tests - adding too many tests will cause the test to timeout and/or compilation failure. max number of tests: %d", len(originalTests)))
	cmd.Run = func(cmd *cobra.Command, args []string) {
		if ntest >= uint32(len(originalTests)) {
			ntest = uint32(len(originalTests))
		}

		tests := []*TwoPoolTest{}

		for i, t := range originalTests[:ntest] {
			amp := big.NewInt(15)
			x0, _ := big.NewInt(0).SetString(t[0], 10)
			d, _ := big.NewInt(0).SetString(t[2], 10)
			expectedx1, _ := stableswap.CalculateXi(amp, 2, d, x0)
			tests = append(tests, &TwoPoolTest{
				Id:         i,
				X0:         t[0],
				X1:         t[1],
				D:          t[2],
				ExpectedX1: expectedx1.String(),
			})
		}

		v := &TwoPoolTests{Tests: tests}

		tmpl, err := template.New("temp").Parse(twoPoolTestMoveTemplate)
		if err != nil {
			panic(err)
		}

		var buf strings.Builder
		err = tmpl.Execute(&buf, &v)
		if err != nil {
			panic(err)
		}

		if err := os.WriteFile(output, []byte(buf.String()), 0o666); err != nil {
			panic(err)
		}
	}

	return cmd
}

func threePoolCmd() *cobra.Command {
	originalTests := stableswap.ThreeCoinTestCases

	cmd := &cobra.Command{
		Use:   "3pool",
		Short: "generate move test for 3pool",
		Args:  cobra.NoArgs,
	}

	var output string
	var ntest uint32 = 30

	cmd.Flags().StringVarP(&output, "output", "o", output, "3 pool output")
	cmd.MarkFlagFilename("output")
	cmd.MarkFlagRequired("output")
	cmd.Flags().Uint32VarP(&ntest, "n-test", "n", ntest, fmt.Sprintf("number of tests - adding too many tests will cause the test to timeout and/or compilation failure. max number of tests: %d", len(originalTests)))
	cmd.Run = func(cmd *cobra.Command, args []string) {
		if ntest >= uint32(len(originalTests)) {
			ntest = uint32(len(originalTests))
		}

		tests := []*ThreePoolTest{}

		for i, t := range originalTests[:ntest] {
			amp := big.NewInt(15)
			x0, _ := big.NewInt(0).SetString(t[0], 10)
			x1, _ := big.NewInt(0).SetString(t[1], 10)
			d, _ := big.NewInt(0).SetString(t[3], 10)
			expectedx2, _ := stableswap.CalculateXi(amp, 3, d, x0, x1)
			tests = append(tests, &ThreePoolTest{
				Id:         i,
				X0:         t[0],
				X1:         t[1],
				X2:         t[2],
				D:          t[3],
				ExpectedX2: expectedx2.String(),
			})
		}

		v := &ThreePoolTests{Tests: tests}

		tmpl, err := template.New("temp").Parse(threePoolTestMoveTemplate)
		if err != nil {
			panic(err)
		}

		var buf strings.Builder
		err = tmpl.Execute(&buf, &v)
		if err != nil {
			panic(err)
		}

		if err := os.WriteFile(output, []byte(buf.String()), 0o666); err != nil {
			panic(err)
		}
	}

	return cmd
}

func main() {
	cmd := &cobra.Command{
		Use:   "gen-move-test",
		Short: "generate move test for stable swaps",
		Args:  cobra.NoArgs,
	}

	cmd.AddCommand(twoPoolCmd(), threePoolCmd())

	cmd.Execute()
}
