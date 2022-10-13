package aptos

import (
	"crypto/ed25519"
	"encoding/hex"
	"fmt"
	"strings"

	"gopkg.in/yaml.v3"
)

// Config is a configuration section in aptos's yaml config file.
type Config struct {
	PrivateKey string `yaml:"private_key"`
	PublicKey  string `yaml:"public_key"`
	Account    string `yaml:"account"`
	RestUrl    string `yaml:"rest_url"`
	FaucetUrl  string `yaml:"faucet_url"`
}

func (c *Config) MarshalYAML() (any, error) {
	n := yaml.Node{}
	n.Encode(struct {
		PrivateKey string `yaml:"private_key"`
		PublicKey  string `yaml:"public_key"`
		Account    string `yaml:"account"`
		RestUrl    string `yaml:"rest_url"`
		FaucetUrl  string `yaml:"faucet_url"`
	}{
		PrivateKey: c.PrivateKey,
		PublicKey:  c.PublicKey,
		Account:    c.Account,
		RestUrl:    c.RestUrl,
		FaucetUrl:  c.FaucetUrl,
	})

	for _, v := range n.Content {
		if strings.HasPrefix(v.Value, "0x") {
			v.Style = yaml.DoubleQuotedStyle
		}
	}

	return n, nil
}

func (config *Config) SetKey(account *LocalAccount) error {
	config.PrivateKey = "0x" + hex.EncodeToString(account.PrivateKey.Seed())
	config.PublicKey = "0x" + hex.EncodeToString(account.PublicKey)
	config.Account = hex.EncodeToString(account.Address[:])
	return nil
}

func (config *Config) GetLocalAccount() (*LocalAccount, error) {
	privateKey, err := NewPrivateKeyFromHexString(config.PrivateKey)
	if err != nil {
		return nil, err
	}
	publicKeyBytes, err := parseHexString(config.PublicKey)
	if err != nil {
		return nil, err
	}

	publicKey := (ed25519.PublicKey)(publicKeyBytes)
	if !publicKey.Equal(privateKey.Public()) {
		return nil, fmt.Errorf("public key mismatch")
	}

	account, err := StringToAddress(config.Account)
	if err != nil {
		return nil, err
	}

	return &LocalAccount{
		PrivateKey: *privateKey,
		PublicKey:  publicKey,
		Address:    account,
	}, nil
}

type ConfigFile struct {
	Profiles map[string]*Config `yaml:"profiles"`
}

func ParseAptosConfigFile(configFileContent []byte) (*ConfigFile, error) {
	result := &ConfigFile{}
	err := yaml.Unmarshal(configFileContent, result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (c *ConfigFile) ToString() ([]byte, error) {
	return yaml.Marshal(c)
}

func NewConfigFile() *ConfigFile {
	return &ConfigFile{
		Profiles: make(map[string]*Config),
	}
}
