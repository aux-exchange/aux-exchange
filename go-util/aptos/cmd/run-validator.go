package cmd

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"time"
)

const LocalFaucetUrl = "http://127.0.0.1:8081"

// isValidatorRunning checks if a validator is running at the target url.
// This is done by checking for `accounts/0x1` on the remote url.
func isValidatorRunning(restUrl string) bool {
	pathToCheck := getOrPanic(url.JoinPath(restUrl, "accounts/0x1"))
	_, err := http.Get(pathToCheck)
	if err != nil {
		redWarn.Printf("validator is not responding at %s: %#v\n", pathToCheck, err)
		return false
	}

	return true
}

func runValidator(detacheValidator bool) *exec.Cmd {
	cmd := exec.Command("aptos", "node", "run-local-testnet", "--with-faucet", "--force-restart", "--assume-yes")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	orPanic(cmd.Start())
	process := cmd.Process

	redWarn.Printf("aptos process started with pid: %d\n", process.Pid)
	redWarn.Printf("command to kill: kill -2 %d\n", process.Pid)

	url := getOrPanic(url.JoinPath(LocalFaucetUrl, "mint"))

	totalWait := time.After(time.Minute)
faucetLoop:
	for {
		select {
		case <-time.After(time.Second):
			if _, err := http.Get(url); err == nil {
				break faucetLoop
			}
		case <-totalWait:
			orPanic(fmt.Errorf("waited one minute for faucet to come up"))
		}
	}

	if detacheValidator {
		orPanic(cmd.Process.Release())
		return nil
	} else {
		return cmd
	}
}
