package main

import (
	"fmt"
	"os/exec"
	"regexp"
)

const requiredVersion = "0.4.0"

func checkAptosVersion() {
	versionCmd := exec.Command("aptos", "--version")

	versionMatch := regexp.MustCompile(`(?m)^aptos 0\.4\.0$`)

	output := getOrPanic(versionCmd.Output())

	if !versionMatch.Match(output) {
		orPanic(
			fmt.Errorf("required %s is not available, got: %s. install with: %s",
				requiredVersion,
				string(output),
				`RUSTFLAGS="--cfg tokio_unstable" cargo install --git https://github.com/aptos-labs/aptos-core.git --rev aptos-cli-v0.4.0 aptos`,
			),
		)
	}
}
