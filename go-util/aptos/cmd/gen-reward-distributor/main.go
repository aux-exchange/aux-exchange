package main

import (
	"bytes"
	_ "embed"
	"os"
	"text/template"

	"github.com/spf13/cobra"
)

//go:embed reward_distributor.move.template
var rewardDistributorTemplate string

type RewardDistributorData struct {
	IsNotQuote bool
	ModuleName string
	ClassName  string
	TokenName  string
	CoinModule string
}

func NewRewardDistributorData(IsNotQuote bool) *RewardDistributorData {
	r := &RewardDistributorData{IsNotQuote: IsNotQuote}

	if IsNotQuote {
		r.ModuleName = "reward_distributor"
		r.ClassName = "RewardDistributor"
		r.TokenName = "RedeemToken"
		r.CoinModule = "coin"
	} else {
		r.ModuleName = "reward_quoter"
		r.ClassName = "RewardDistributionQuoter"
		r.TokenName = "QuoterRedeemToken"
		r.CoinModule = "quote_coin"
	}
	return r
}

func main() {
	cmd := &cobra.Command{
		Use:   "reward-distributor-gen",
		Short: "generate reward distributor code.",
		Args:  cobra.NoArgs,
	}

	output := ""
	isQuote := false
	cmd.Flags().StringVarP(&output, "output", "o", output, "output file")
	cmd.MarkFlagFilename("output")
	cmd.MarkFlagRequired("output")
	cmd.Flags().BoolVarP(&isQuote, "is-quote", "q", isQuote, "for quote")

	cmd.Run = func(*cobra.Command, []string) {
		tmpl, err := template.New("tmp").Parse(rewardDistributorTemplate)
		if err != nil {
			panic(err)
		}

		v := NewRewardDistributorData(!isQuote)

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
