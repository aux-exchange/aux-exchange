package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"text/template"

	"github.com/spf13/cobra"
)

//go:embed math_pool.move.template
var mathNPoolTemplate string

type mathNPoolXi struct {
	I       int
	Others  []int
	Befores []int
	Afters  []int
}
type mathNPool struct {
	N   int
	Xis []*mathNPoolXi
}

func newMathNPool(n int) *mathNPool {
	if n <= 1 {
		panic(fmt.Errorf("too few coins: %d", n))
	}
	r := &mathNPool{
		N: n,
	}

	for i := 0; i < n; i++ {
		xi := &mathNPoolXi{
			I: i,
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

	return r
}

func main() {
	cmd := cobra.Command{
		Use:  "gen-pool-math",
		Args: cobra.NoArgs,
	}

	nCoins := 2
	output := ""
	cmd.Flags().IntVarP(&nCoins, "n-coins", "n", nCoins, "number of coins")
	cmd.MarkFlagRequired("n-coins")
	cmd.Flags().StringVarP(&output, "output", "o", output, "output file name")
	cmd.MarkFlagRequired("output")
	cmd.MarkFlagFilename("output")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		v := newMathNPool(nCoins)
		tmpl, err := template.New("temp").Parse(mathNPoolTemplate)
		if err != nil {
			panic(err)
		}

		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, v); err != nil {
			panic(err)
		}
		if err := os.WriteFile(output, buf.Bytes(), 0o666); err != nil {
			panic(err)
		}
	}

	cmd.Execute()
}
