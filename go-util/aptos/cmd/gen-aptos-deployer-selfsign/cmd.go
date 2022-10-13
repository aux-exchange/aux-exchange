package main

import (
	"bytes"
	_ "embed"
	"os"
	"strings"
	"text/template"

	"github.com/spf13/cobra"
)

//go:embed self_signed.move.tpl
var selfSignedTemplate string

type moduleInfo struct {
	Address    string
	ModuleName string
}

type selfSignModule struct {
	moduleInfo
	Friends []moduleInfo
	Args    string
}

func main() {
	cmd := &cobra.Command{
		Use:   "gen-aptos-deployer-selfsign",
		Short: "generate package to support selfsign",
		Long:  "generate the self-signed module to support self-signing modules. Used with deployer.",
		Args:  cobra.NoArgs,
	}

	m := &selfSignModule{
		moduleInfo: moduleInfo{
			Address:    "module_address",
			ModuleName: "module_name",
		},
		Friends: []moduleInfo{},
	}

	output := "./sources/self_signed.move"
	friends := []string{}
	cmd.Flags().StringVarP(&output, "output", "o", output, "output file name.")
	cmd.MarkFlagFilename("output", "move")
	cmd.Flags().StringVarP(&m.ModuleName, "module-name", "n", m.ModuleName, "module name for the self-signed module")
	cmd.Flags().StringVarP(&m.Address, "address", "a", m.Address, "address for the module")
	cmd.Flags().StringArrayVarP(&friends, "friend-modules", "f", friends, "friend modules for this module, must be within the same address.")

	cmd.Run = func(_ *cobra.Command, _ []string) {
		m.Args = strings.TrimSpace(strings.Join(os.Args[1:], " "))
		if len(m.Args) > 0 {
			m.Args = " " + m.Args
		}
		for _, f := range friends {
			m.Friends = append(m.Friends, moduleInfo{
				ModuleName: f,
				Address:    m.Address,
			})
		}

		tmpl, err := template.New("tx").Parse(selfSignedTemplate)
		if err != nil {
			panic(err)
		}

		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, m); err != nil {
			panic(err)
		}

		os.WriteFile(output, buf.Bytes(), 0o666)
	}

	cmd.Execute()
}
