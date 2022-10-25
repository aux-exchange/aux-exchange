package aptos

import "fmt"

//go:generate stringer -type AuxFakeCoin -linecomment

// AuxFakeCoin contains some fake coins to use on devnet and testnet.
// They don't have any value and can be freely minted to anyone.
// Simply call mint (or register_and_mint if not signed up for it already).
type AuxFakeCoin int

const (
	AuxFakeCoin_USDC AuxFakeCoin = iota // USDC
	AuxFakeCoin_ETH                     // ETH
	AuxFakeCoin_BTC                     // BTC
	AuxFakeCoin_SOL                     // SOL
	AuxFakeCoin_AUX                     // AUX
	AuxFakeCoin_USDT                    // USDT
)

// AuxAllFakeCoins contains all the fake coins provided by aux for testing
var AuxAllFakeCoins []AuxFakeCoin = []AuxFakeCoin{
	AuxFakeCoin_USDC,
	AuxFakeCoin_ETH,
	AuxFakeCoin_BTC,
	AuxFakeCoin_SOL,
	AuxFakeCoin_USDT,
	AuxFakeCoin_AUX,
}

// GetAuxFakeCoinType returns the fake coin type. Note, this is actually not a type of coin.
// Use GetAuxFakeCoinCoinType to get the coin type.
func GetAuxFakeCoinType(moduleAddress Address, fakeCoin AuxFakeCoin) (*MoveTypeTag, error) {
	if fakeCoin >= AuxFakeCoin(len(_AuxFakeCoin_index)-1) {
		return nil, fmt.Errorf("unknown fake coin: %d", int(fakeCoin))
	}

	return &MoveTypeTag{
		Address: moduleAddress,
		Module:  "fake_coin",
		Name:    fakeCoin.String(),
	}, nil
}

// GetAuxFakeCoinCoinType returns the fake coin coin type - this is a coin as defined by the aptos framework.
func GetAuxFakeCoinCoinType(moduleAddress Address, fakeCoin AuxFakeCoin) (*MoveTypeTag, error) {
	coinType, err := GetAuxFakeCoinType(moduleAddress, fakeCoin)
	if err != nil {
		return nil, err
	}
	return &MoveTypeTag{
		Address: moduleAddress,
		Module:  "fake_coin",
		Name:    "FakeCoin",

		GenericTypeParameters: []*MoveTypeTag{coinType},
	}, nil
}
