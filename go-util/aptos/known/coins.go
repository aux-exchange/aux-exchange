package known

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

//go:embed coins.json
var data []byte

type TokenType struct {
	Type *aptos.MoveTypeTag `json:"type"`
}

type HippoCoinRegistryEntry struct {
	Name           string    `json:"name"`
	Symbol         string    `json:"symbol"`
	OfficialSymbol string    `json:"official_symbol"`
	CoingeckoId    string    `json:"coingecko_id"`
	Decimals       uint8     `json:"decimals"`
	LogoUrl        string    `json:"logo_url"`
	ProjectUrl     string    `json:"project_url"`
	TokenType      TokenType `json:"token_type"`
}

type coinMap map[string]*HippoCoinRegistryEntry

var (
	coinByNetworkByTypeName map[aptos.Network]*coinMap
	coinByNetworkBySymbol   map[aptos.Network]*coinMap
)

func addCoins(
	mapByNetwork *map[aptos.Network]*coinMap,
	network aptos.Network,
	coinInfos []*HippoCoinRegistryEntry,
	nameSelector func(*HippoCoinRegistryEntry) string,
) {
	var coins coinMap = make(coinMap)
	(*mapByNetwork)[network] = &coins
	for _, coin := range coinInfos {
		name := nameSelector(coin)
		coins[name] = coin
	}
}

func generateFakeCoins(address aptos.Address) []*HippoCoinRegistryEntry {
	var aptosCoin HippoCoinRegistryEntry
	json.Unmarshal([]byte(`  {
    "name": "Aptos Coin",
    "symbol": "APT",
    "official_symbol": "APT",
    "coingecko_id": "aptos",
    "decimals": 8,
    "logo_url": "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APT.webp",
    "project_url": "https://aptoslabs.com/",
    "token_type": {
      "type": "0x1::aptos_coin::AptosCoin",
      "account_address": "0x1",
      "module_name": "aptos_coin",
      "struct_name": "AptosCoin"
    },
    "extensions": {
      "data": []
    }
  }
`), &aptosCoin)

	result := []*HippoCoinRegistryEntry{&aptosCoin}
	for _, fakeCoin := range aptos.AuxAllFakeCoins {
		t, err := aptos.GetAuxFakeCoinCoinType(address, fakeCoin)
		if err != nil {
			continue
		}
		result = append(result, &HippoCoinRegistryEntry{
			Name:           fmt.Sprintf("Fake Coin %s", fakeCoin.String()),
			Symbol:         fakeCoin.String(),
			OfficialSymbol: fakeCoin.String(),
			TokenType:      TokenType{Type: t},
		})
	}

	return result
}

func init() {
	coinByNetworkByTypeName = make(map[aptos.Network]*coinMap)
	coinByNetworkBySymbol = make(map[aptos.Network]*coinMap)

	var hippoCoinList []*HippoCoinRegistryEntry
	err := json.Unmarshal(data, &hippoCoinList)
	if err != nil {
		panic(err)
	}

	addCoins(&coinByNetworkByTypeName, aptos.Mainnet, hippoCoinList, func(h *HippoCoinRegistryEntry) string {
		return h.TokenType.Type.String()
	})
	addCoins(&coinByNetworkBySymbol, aptos.Mainnet, hippoCoinList, func(h *HippoCoinRegistryEntry) string {
		return h.Symbol
	})

	devnetConfig, _ := aptos.GetAuxClientConfig(aptos.Devnet)
	devnetCoins := generateFakeCoins(devnetConfig.Address)
	addCoins(&coinByNetworkByTypeName, aptos.Devnet, devnetCoins, func(h *HippoCoinRegistryEntry) string {
		return h.TokenType.Type.String()
	})
	addCoins(&coinByNetworkBySymbol, aptos.Devnet, devnetCoins, func(h *HippoCoinRegistryEntry) string {
		return h.Symbol
	})

	testnetConfig, _ := aptos.GetAuxClientConfig(aptos.Testnet)
	testnetCoins := generateFakeCoins(testnetConfig.Address)
	addCoins(&coinByNetworkByTypeName, aptos.Testnet, testnetCoins, func(h *HippoCoinRegistryEntry) string {
		return h.TokenType.Type.String()
	})
	addCoins(&coinByNetworkBySymbol, aptos.Testnet, testnetCoins, func(h *HippoCoinRegistryEntry) string {
		return h.Symbol
	})
}

func GetCoinInfo(network aptos.Network, typeTag *aptos.MoveTypeTag) *HippoCoinRegistryEntry {
	coinForNetwork, ok := coinByNetworkByTypeName[network]
	if !ok {
		return nil
	}

	coinInfo, ok := (*coinForNetwork)[typeTag.String()]
	if !ok {
		return nil
	}

	return coinInfo
}

func GetCoinInfoBySymbol(network aptos.Network, symbol string) *HippoCoinRegistryEntry {
	coinForNetwork, ok := coinByNetworkBySymbol[network]
	if !ok {
		return nil
	}

	coinInfo, ok := (*coinForNetwork)[symbol]
	if !ok {
		return nil
	}

	return coinInfo
}
