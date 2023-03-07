package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"path"

	"github.com/fardream/go-aptos/aptos"
)

func getCargoCommand(binaryName string) (string, []string) {
	binaryPath, err := exec.LookPath(binaryName)
	if err != nil {
		redWarn.Printf("cannot find %s in path, use cargo\n", binaryName)
		return "cargo", []string{"run", "--manifest-path", "aptos/Cargo.toml", "--bin", binaryName, "--"}
	} else {
		fmt.Printf("found binary %s at %s\n", binaryName, binaryPath)
		return binaryName, []string{}
	}
}

func checkMoveDir(movePackageDir string) {
	if _, err := os.Stat(path.Join(movePackageDir, "Move.toml")); err != nil {
		if os.IsNotExist(err) {
			orPanic(fmt.Errorf("%s doesn't contain Move.toml, is it a move package?", movePackageDir))
		} else {
			orPanic(fmt.Errorf("failed to verify Move.toml file in the package directory: %s", movePackageDir))
		}
	}
	os.RemoveAll(path.Join(movePackageDir, "build"))
}

func doDeploy(account *aptos.Config, workDir string, seed string, redeploy bool) {
	homeMoveDir := path.Join(getOrPanic(os.UserHomeDir()), ".move")
	redWarn.Printf("deleting folder %s\n", homeMoveDir)
	os.RemoveAll(homeMoveDir)
	if !redeploy {
		deployerDir := path.Join(workDir, "deployer")
		checkMoveDir(deployerDir)
		fmt.Printf("publish deployer in %s\n", deployerDir)

		deployCmd := exec.Command(
			"aptos", "move", "publish",
			"--package-dir", deployerDir,
			"--url", account.RestUrl,
			"--included-artifacts", "none",
			"--named-addresses", fmt.Sprintf("deployer=%s", account.Account),
			"--private-key", account.PrivateKey,
			"--assume-yes",
			"--max-gas", "10000",
		)

		deployCmd.Stdout = os.Stdout
		deployCmd.Stderr = os.Stderr

		orPanic(deployCmd.Run())
	}
	auxDir := path.Join(workDir, "auxexch")
	checkMoveDir(auxDir)

	if redeploy {
		redeployDir := path.Join(workDir, "redeploy-aux")
		checkMoveDir(redeployDir)

		afterParams := []string{
			"-d", account.Account,
			"-k", account.PrivateKey,
			"-u", account.RestUrl,
			"-n", "aux",
			"--package-path", auxDir,
			"--redeploy-package", redeployDir,
			"--target-address", aptos.CalculateResourceAddress(getOrPanic(aptos.ParseAddress(account.Account)), []byte(seed)).String(),
		}
		fmt.Printf("re-publish aux in %s\n", auxDir)
		republishBinaryName := "republish-to-resource-account"
		cmdToRun, trailingParams := getCargoCommand(republishBinaryName)

		rebpublishCmd := exec.Command(cmdToRun, append(trailingParams, afterParams...)...)
		rebpublishCmd.Stdout = os.Stdout
		rebpublishCmd.Stderr = os.Stderr

		orPanic(rebpublishCmd.Run())
	} else {
		fmt.Printf("publish aux in %s\n", auxDir)
		afterParams := []string{
			"-d", account.Account,
			"-k", account.PrivateKey,
			"--seed", seed,
			"-u", account.RestUrl,
			"-n", "aux",
			"--package-path", auxDir,
		}
		publishBinaryName := "create-resource-account-and-publish"

		cmdToRun, trailingParams := getCargoCommand(publishBinaryName)

		publishCmd := exec.Command(cmdToRun, append(trailingParams, afterParams...)...)

		publishCmd.Stdout = os.Stdout
		publishCmd.Stderr = os.Stderr

		orPanic(publishCmd.Run())
	}

	fmt.Println("Done. Hope you enjoy aux exchange")
}
