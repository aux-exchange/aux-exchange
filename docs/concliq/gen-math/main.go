package main

import (
	"bytes"
	_ "embed"
	"log"
	"os"
	"text/template"

	"github.com/aux-exchange/aux-exchange/docs/concliq"
	"github.com/spf13/cobra"
)

//go:embed concliq_math.move.template
var concliqMathTmpl string

func main() {
	cmd := &cobra.Command{
		Use:   "gen-math",
		Short: "generate math functions for concentrated liquidity",
		Args:  cobra.NoArgs,
	}

	outputFile := ""
	precision := 32
	cmd.Flags().StringVarP(&outputFile, "output", "o", outputFile, "output file location")
	cmd.Flags().IntVarP(&precision, "precision", "p", precision, "precision, must be 32, 64, or 96")
	cmd.MarkFlagFilename("output")
	cmd.MarkFlagRequired("output")

	cmd.Run = func(*cobra.Command, []string) {
		tmpl, err := template.New("temp").Parse(concliqMathTmpl)
		if err != nil {
			log.Fatal(err)
		}

		v := concliq.NewSquarePriceList(precision)

		var buf bytes.Buffer

		if err := tmpl.Execute(&buf, v); err != nil {
			log.Fatal(err)
		}

		if err := os.WriteFile(outputFile, buf.Bytes(), 0o666); err != nil {
			log.Fatal(err)
		}
	}

	cmd.Execute()
}
