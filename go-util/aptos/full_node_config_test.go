package aptos_test

import (
	"testing"

	"github.com/goccy/go-yaml"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

const originalConfig = `base:
    # Update this value to the location you want the node to store its database
    data_dir: "/opt/aptos/data"
    role: "full_node"
    waypoint:
        # Update this value to that which the blockchain publicly provides. Please regard the directions
        # below on how to safely manage your genesis_file_location with respect to the waypoint.
        from_file: "./waypoint.txt"

execution:
    # Update this to the location to where the genesis.blob is stored, prefer fullpaths
    # Note, this must be paired with a waypoint. If you update your waypoint without a
    # corresponding genesis, the file location should be an empty path.
    genesis_file_location: "./genesis.blob"

full_node_networks:
    - discovery_method: "onchain"
      # The network must have a listen address to specify protocols. This runs it locally to
      # prevent remote, incoming connections.
      listen_address: "/ip4/127.0.0.1/tcp/6180"
      network_id: "public"
      # Define the upstream peers to connect to
      seeds:
        {}


api:
    enabled: true
    address: 127.0.0.1:8080
`

func TestFullNodeConfig(t *testing.T) {
	fullNodeConfig := &aptos.FullNodeConfig{}

	if err := yaml.Unmarshal([]byte(originalConfig), fullNodeConfig); err != nil {
		t.Fatal(err)
	}
}
