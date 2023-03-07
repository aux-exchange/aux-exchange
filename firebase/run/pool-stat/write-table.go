package main

import (
	"io"

	"github.com/olekukonko/tablewriter"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func writeTable(out io.Writer, pools *AllPools) {
	table := tablewriter.NewWriter(out)

	table.SetHeader([]string{"Pool", "TVL", "Last 24 Hour Volume", "Last 24 Hour Fee", "Tx Count", "User Count", "Last 7 Day Volume", "Last 7 Day Fee", "Tx Count", "User Count"})

	formatter := message.NewPrinter(language.AmericanEnglish)
	for _, pool := range pools.Pools {
		table.Append([]string{
			pool.CoinPair,
			formatter.Sprintf("%.2f", pool.TVL),
			formatter.Sprintf("%.2f", pool.Last24Hours.Volume),
			formatter.Sprintf("%.2f", pool.Last24Hours.Fee),
			formatter.Sprintf("%d", pool.Last24Hours.TransactionCount),
			formatter.Sprintf("%d", pool.Last24Hours.UserCount),
			formatter.Sprintf("%.2f", pool.Last7Days.Volume),
			formatter.Sprintf("%.2f", pool.Last7Days.Fee),
			formatter.Sprintf("%d", pool.Last7Days.TransactionCount),
			formatter.Sprintf("%d", pool.Last7Days.UserCount),
		})
	}

	table.SetFooter([]string{
		"Total",
		formatter.Sprintf("%.2f", pools.TVL),
		formatter.Sprintf("%.2f", pools.Last24Hours.Volume),
		formatter.Sprintf("%.2f", pools.Last24Hours.Fee),
		formatter.Sprintf("%d", pools.Last24Hours.TransactionCount),
		formatter.Sprintf("%d", pools.Last24Hours.UserCount),
		formatter.Sprintf("%.2f", pools.Last7Days.Volume),
		formatter.Sprintf("%.2f", pools.Last7Days.Fee),
		formatter.Sprintf("%d", pools.Last7Days.TransactionCount),
		formatter.Sprintf("%d", pools.Last7Days.UserCount),
	})

	table.Render()
}
