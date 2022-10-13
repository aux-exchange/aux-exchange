package aptos_test

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"gopkg.in/yaml.v3"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

const fileContent = `---
profiles:
  default:
    private_key: "0xc4aac9b726fadf5f7e92524e33230d54bc7a85786d99c9c48d018fddd6f4c29a"
    public_key: "0xd58f597475ebee62e0f22bc40c17c9745766f34e95001e80c4aae8a9f41ecaa7"
    account: f8572aa66c9e15462878f87c39863d162f9bf547a319c586c5819c1438de016b
    rest_url: "https://fullnode.devnet.aptoslabs.com/v1"
    faucet_url: "https://faucet.devnet.aptoslabs.com/"
  localnet:
    private_key: "0x2f859272453b4ad6e186e19bb9b99fe1ddfccbe680a0490b7b90142a1e5d4430"
    public_key: "0xfcfbf4ec360e0139423ff0fc0ba362b2050f68dd5d3518dbea43610f830458b0"
    account: 22bd90a2f5fb4fdf1ef6a9e9b0982b491f4ac5c3bc241a59959e38fabcce2426
    rest_url: "http://0.0.0.0:8080/"
    faucet_url: "http://0.0.0.0:8081/"
`

var expectedConfigParsed aptos.ConfigFile = aptos.ConfigFile{
	Profiles: map[string]*aptos.Config{
		"default": {
			PrivateKey: "0xc4aac9b726fadf5f7e92524e33230d54bc7a85786d99c9c48d018fddd6f4c29a",
			PublicKey:  "0xd58f597475ebee62e0f22bc40c17c9745766f34e95001e80c4aae8a9f41ecaa7",
			Account:    "f8572aa66c9e15462878f87c39863d162f9bf547a319c586c5819c1438de016b",
			RestUrl:    "https://fullnode.devnet.aptoslabs.com/v1",
			FaucetUrl:  "https://faucet.devnet.aptoslabs.com/",
		},
		"localnet": {
			PrivateKey: "0x2f859272453b4ad6e186e19bb9b99fe1ddfccbe680a0490b7b90142a1e5d4430",
			PublicKey:  "0xfcfbf4ec360e0139423ff0fc0ba362b2050f68dd5d3518dbea43610f830458b0",
			Account:    "22bd90a2f5fb4fdf1ef6a9e9b0982b491f4ac5c3bc241a59959e38fabcce2426",
			RestUrl:    "http://0.0.0.0:8080/",
			FaucetUrl:  "http://0.0.0.0:8081/",
		},
	},
}

func TestParseAptosConfigFile(t *testing.T) {
	configParsed, err := aptos.ParseAptosConfigFile([]byte(fileContent))
	if err != nil {
		t.Fatal(err)
	}

	if !cmp.Equal(configParsed, &expectedConfigParsed) {
		t.Fatalf("want:\n%#v\n, got:\n%#v", expectedConfigParsed, configParsed)
	}
}

func TestConfig_MarshalYAML(t *testing.T) {
	configParsed, err := aptos.ParseAptosConfigFile([]byte(fileContent))
	if err != nil {
		t.Fatal(err)
	}

	st, err := yaml.Marshal(configParsed)
	if err != nil {
		t.Fatal(err)
	}

	if len(st) == 0 {
		t.Fatal(st)
	}
}
