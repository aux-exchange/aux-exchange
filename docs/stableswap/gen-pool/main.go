package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"path"
	"text/template"

	"github.com/aux-exchange/aux-exchange/docs/stableswap"
	"github.com/spf13/cobra"
)

//go:embed stable_pool.move.template
var stablePool string

//go:embed math_pool.move.template
var mathPool string

//go:embed router_pool.move.template
var routerPool string

func WriteTemplate(v *stableswap.PoolGen, templateText, outputPath string) {
	poolTmp, err := template.New("temp").Parse(templateText)
	if err != nil {
		panic(err)
	}

	var poolBuf bytes.Buffer
	if err := poolTmp.Execute(&poolBuf, v); err != nil {
		panic(err)
	}
	if err := os.WriteFile(outputPath, poolBuf.Bytes(), 0o666); err != nil {
		panic(err)
	}
}

func main() {
	cmd := cobra.Command{
		Use:  "gen-pool",
		Args: cobra.NoArgs,
	}

	nCoins := 0
	outputDir := ""
	noQuoter := false
	cmd.Flags().IntVarP(&nCoins, "n-coins", "n", nCoins, "number of coins")
	cmd.MarkFlagRequired("n-coins")
	cmd.Flags().StringVarP(&outputDir, "output-dir", "o", outputDir, "output file name")
	cmd.MarkFlagRequired("output-dir")
	cmd.MarkFlagDirname("output-dir")
	cmd.Flags().BoolVar(&noQuoter, "no-quoter", noQuoter, "turn off qutoer")

	cmd.Run = func(cmd *cobra.Command, args []string) {
		v := stableswap.NewPoolGen(nCoins, false)
		v.UseQuoter = !noQuoter
		WriteTemplate(v, stablePool, path.Join(outputDir, fmt.Sprintf("stable_%dpool.move", nCoins)))
		WriteTemplate(v, mathPool, path.Join(outputDir, fmt.Sprintf("math_%dpool.move", nCoins)))
		WriteTemplate(v, routerPool, path.Join(outputDir, fmt.Sprintf("router_%dpool.move", nCoins)))
		if !noQuoter {
			v := stableswap.NewPoolGen(nCoins, true)
			WriteTemplate(v, stablePool, path.Join(outputDir, fmt.Sprintf("quoter_%dpool.move", nCoins)))
		}
	}

	cmd.Execute()
}
