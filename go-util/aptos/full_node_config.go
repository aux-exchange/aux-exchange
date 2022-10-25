package aptos

import "github.com/goccy/go-yaml"

// FullNodeConfig is representation of full_node_config.yml
type FullNodeConfig struct {
	Base *struct {
		DataDir  string `yaml:"data_dir"`
		Waypoint *struct {
			FromFile string         `yaml:"from_file"`
			Others   map[string]any `yaml:",inline"`
		} `yaml:"waypoint"`
		Others map[string]any `yaml:",inline"`
	} `yaml:"base"`
	Execution *struct {
		GenesisFileLocation string         `yaml:"genesis_file_location"`
		Others              map[string]any `yaml:",inline"`
	} `yaml:"execution"`
	FullNodeNetworks []*struct {
		Others map[string]any `yaml:",inline"`
	} `yaml:"full_node_networks"`

	Api *struct {
		Enabled bool           `yaml:"enabled"`
		Address string         `yaml:"address"`
		Others  map[string]any `yaml:",inline"`
	} `yaml:"api"`
	Others map[string]any `yaml:",inline"`
}

func ParseFullNodeConfig(data []byte) (*FullNodeConfig, error) {
	result := &FullNodeConfig{}

	if err := yaml.Unmarshal(data, result); err != nil {
		return nil, err
	}

	return result, nil
}

func (config *FullNodeConfig) ToConfigFile() ([]byte, error) {
	return yaml.Marshal(config)
}
