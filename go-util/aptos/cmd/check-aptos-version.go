package cmd

import (
	"fmt"
	"os/exec"
	"regexp"
)

const (
	requiredVersion = "1.0.1"
	installCmd      = `RUSTFLAGS="--cfg tokio_unstable" cargo install --git https://github.com/aptos-labs/aptos-core.git --rev aptos-cli-v1.0.1 aptos`
)

func checkAptosVersion() {
	_, err := exec.LookPath("aptos")
	if err != nil {
		orPanic(fmt.Errorf("failed to find aptos cli: %w\n. Install with:\n%s", err, installCmd))
	}

	versionCmd := exec.Command("aptos", "--version")

	versionMatch := regexp.MustCompile(`(?m)^aptos 1\.0\.1$`)

	output := getOrPanic(versionCmd.Output())

	if !versionMatch.Match(output) {
		orPanic(
			fmt.Errorf("required %s is not available, got: %s. install with: %s",
				requiredVersion,
				string(output),
				installCmd,
			),
		)
	}
}
