package aptos

import (
	"crypto/ed25519"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/binary"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/tyler-smith/go-bip39"
)

const (
	PetraPath      = "m/44'/637'/0'/0'/0'"
	HmacKey        = "ed25519 seed"
	HardenedOffset = 0x80000000
)

func NewLocalAccountWithMnemonic() (*LocalAccount, string, error) {
	entropy, err := bip39.NewEntropy(128)
	if err != nil {
		return nil, "", err
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return nil, "", err
	}

	account, err := NewLocalAccountFromMnemonic(mnemonic, "")
	if err != nil {
		return nil, "", err
	}

	return account, mnemonic, nil
}

// NewLocalAccountFromMnemonic creates a private key from the mnemonic codes.
// https://aptos.dev/guides/building-your-own-wallet#mnemonics
// Also see:
// https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/aptos_account.ts#L47-L68
//
// This is based on bip32 and bip39
// hd key: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// mnemonic code: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
func NewLocalAccountFromMnemonic(mnemonic string, passphrase string) (*LocalAccount, error) {
	bip39Seed, err := bip39.NewSeedWithErrorChecking(mnemonic, passphrase)
	if err != nil {
		return nil, fmt.Errorf("failed to get bip39 seed: %w", err)
	}

	privateKey, err := Bip32DerivePath(PetraPath, bip39Seed, HardenedOffset)
	if err != nil {
		return nil, err
	}

	return NewLocalAccountFromPrivateKey(privateKey)
}

// Bip32Key
type Bip32Key struct {
	Key       []byte
	ChainCode []byte
}

// see https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/utils/hd-key.ts#L21-L30
func GetBip39MasterKeyFromSeed(seed []byte) (*Bip32Key, error) {
	h := hmac.New(sha512.New, []byte(HmacKey))
	_, err := h.Write(seed)
	if err != nil {
		return nil, err
	}

	masterKeyBytes := h.Sum(nil)

	key := masterKeyBytes[0:32]
	chainCode := masterKeyBytes[32:64]

	return &Bip32Key{
		Key:       key,
		ChainCode: chainCode,
	}, nil
}

// see https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/utils/hd-key.ts#L32-L46
func CKDPriv(key *Bip32Key, index uint32) (*Bip32Key, error) {
	indexBytes := make([]byte, 4)
	binary.BigEndian.PutUint32(indexBytes, index)

	data := append([]byte{0x0}, key.Key...)
	data = append(data, indexBytes...)

	h := hmac.New(sha512.New, key.ChainCode)
	_, err := h.Write(data)
	if err != nil {
		return nil, err
	}

	sum := h.Sum(nil)
	return &Bip32Key{
		Key:       sum[0:32],
		ChainCode: sum[32:],
	}, nil
}

// see https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/utils/hd-key.ts#L14
var pathRegex = regexp.MustCompile(`^m(\/[0-9]+')+`)

// see https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/utils/hd-key.ts#L55-L64
func IsValidBip32Path(path string) bool {
	_, err := ParseBip32Path(path)
	return err != nil
}

func ParseBip32Path(path string) ([]uint32, error) {
	if !pathRegex.MatchString(path) {
		return nil, fmt.Errorf("%s is not valid path", path)
	}

	allIndices := strings.Split(path, "/")
	if len(allIndices) <= 1 {
		return nil, fmt.Errorf("%s contains too few elements", path)
	}

	result := []uint32{}
	for _, index := range allIndices[1:] {
		index := strings.TrimRight(index, `'`)
		i, err := strconv.ParseUint(index, 10, 32)
		if err != nil {
			return nil, fmt.Errorf("failed to parse %s as uint: %w", index, err)
		}

		result = append(result, uint32(i))
	}

	return result, nil
}

// see https://github.com/aptos-labs/aptos-core/blob/841a79891dfc9e29b3ffd4c04af285981ff4b8bc/ecosystem/typescript/sdk/src/utils/hd-key.ts#L66-L79
func Bip32DerivePath(path string, seed []byte, offset uint32) (*ed25519.PrivateKey, error) {
	segments, err := ParseBip32Path(path)
	if err != nil {
		return nil, err
	}

	key, err := GetBip39MasterKeyFromSeed(seed)
	if err != nil {
		return nil, err
	}

	for _, segment := range segments {
		key, err = CKDPriv(key, segment+offset)
		if err != nil {
			return nil, err
		}
	}

	result := ed25519.NewKeyFromSeed(key.Key)
	return &result, nil
}
