package cmd

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func downloadFile(url string) []byte {
	resp := getOrPanic(http.Get(url))

	defer resp.Body.Close()

	msg := getOrPanic(io.ReadAll(resp.Body))

	if resp.StatusCode >= 400 {
		orPanic(fmt.Errorf("failed to download the file: %d: %s", resp.StatusCode, string(msg)))
	}

	return msg
}

func GetLaunchAptosNodeCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "launch-aptos-node",
		Short: "launch aptos node",
		Args:  cobra.NoArgs,
	}

	networkName := "devnet"
	workingDir := getOrPanic(os.UserHomeDir())
	apiPort := "8080"
	tcpPort := "6180"
	telemetryPort := "9101"
	detach := false

	cmd.Flags().StringVarP(&workingDir, "working-dir", "d", workingDir, "working directory - default to user home directory. a folder \"aptos-node-{network}\" wil be created in that folder.")
	cmd.MarkFlagDirname("working-dir")
	cmd.Flags().StringVarP(&networkName, "chain", "c", networkName, "chain")
	cmd.Flags().StringVarP(&apiPort, "api-port", "p", apiPort, "api port (try not to collide with default 8080)")
	cmd.Flags().StringVarP(&tcpPort, "tcp-port", "t", tcpPort, "tcp port (try not to collide with default 6180)")
	cmd.Flags().StringVarP(&telemetryPort, "telemetry-port", "m", telemetryPort, "telemetry port (try not to collide with default 9101)")
	cmd.Flags().BoolVar(&detach, "detach", detach, "detach the podman process")

	cmd.Run = func(_ *cobra.Command, _ []string) {
		workingDir = path.Clean(workingDir)
		oldWorkingDir := workingDir
		workingDir = getOrPanic(filepath.Abs(workingDir))
		if oldWorkingDir != workingDir {
			fmt.Printf("replace working directory %s with absolute path %s\n", oldWorkingDir, workingDir)
		}
		// create the directory
		realDir := path.Join(workingDir, fmt.Sprintf("aptos-node-%s", networkName))
		dataDir := path.Join(realDir, "data")
		os.MkdirAll(dataDir, 0o777)

		genesisBlob := downloadFile(fmt.Sprintf("https://github.com/aptos-labs/aptos-networks/blob/main/%s/genesis.blob?raw=true", networkName))
		waypointTxt := downloadFile(fmt.Sprintf("https://raw.githubusercontent.com/aptos-labs/aptos-networks/main/%s/waypoint.txt", networkName))

		genesisBlobFile := path.Join(realDir, "genesis.blob")
		waypointFile := path.Join(realDir, "waypoint.txt")
		orPanic(os.WriteFile(genesisBlobFile, genesisBlob, 0o666))
		orPanic(os.WriteFile(waypointFile, waypointTxt, 0o666))

		fullNodeConfigContent := downloadFile(fmt.Sprintf("https://raw.githubusercontent.com/aptos-labs/aptos-core/%s/config/src/config/test_data/public_full_node.yaml", networkName))

		fullNodeConfig := getOrPanic(aptos.ParseFullNodeConfig(fullNodeConfigContent))
		fullNodeConfig.Api.Address = "0.0.0.0:8080"
		fullNodeConfigPath := path.Join(realDir, "full_node.yml")
		os.WriteFile(fullNodeConfigPath, getOrPanic(fullNodeConfig.ToConfigFile()), 0o666)

		image := fmt.Sprintf("docker.io/aptoslabs/validator:%s", networkName)

		//  docker run --pull=always --rm -p 8080:8080 -p 9101:9101 -p 6180:6180 -v $(pwd):/opt/aptos/etc -v $(pwd)/data:/opt/aptos/data --workdir /opt/aptos/etc --name=aptos-fullnode aptoslabs/validator:devnet aptos-node -f /opt/aptos/etc/public_full_node.yaml
		params := []string{
			"run",
			"--rm", "--pull=always",
		}

		if detach {
			params = append(params, "-d")
		}
		params = append(params, "-p", fmt.Sprintf("%s:8080", apiPort),
			"-p", fmt.Sprintf("%s:6180", tcpPort),
			"-p", fmt.Sprintf("%s:9101", telemetryPort),
			"-v", fmt.Sprintf("%s:/opt/aptos/etc:z", realDir),
			"-v", fmt.Sprintf("%s:/opt/aptos/data:z", dataDir),
			"--workdir", "/opt/aptos/etc",
			fmt.Sprintf("--name=aptos-fullnode-%s", networkName),
			image,
			"aptos-node",
			"-f", "/opt/aptos/etc/full_node.yml",
		)

		fullNodeCmd := exec.Command("podman", params...)
		fullNodeCmd.Stderr = os.Stderr
		fullNodeCmd.Stdout = os.Stdout

		orPanic(fullNodeCmd.Run())
	}

	return cmd
}