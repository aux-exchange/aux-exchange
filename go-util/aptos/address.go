package aptos

import (
	"encoding/hex"
	"fmt"
	"strings"

	"golang.org/x/crypto/sha3"
)

const AddressLength = 32

// Address in aptos, 32 byte long.
type Address [AddressLength]byte

// StringToAddress converts a hex encoded string to address.
func StringToAddress(s string) (Address, error) {
	trimmed := strings.TrimPrefix(strings.ToLower(s), "0x")
	exptedLength := AddressLength * 2
	if len(trimmed) > exptedLength {
		return Address{},
			fmt.Errorf(
				"input address after trimming 0x is too long, got %d, expecting at most %d: %s",
				len(trimmed),
				exptedLength,
				trimmed)
	}

	if len(trimmed) < exptedLength {
		trimmed = strings.Repeat("0", exptedLength-len(trimmed)) + trimmed
	}

	result := make([]byte, AddressLength)
	length, err := hex.Decode(result, ([]byte)(trimmed))
	if err != nil {
		return Address{}, fmt.Errorf("failed to decode: %s, error is %w", trimmed, err)
	}

	if length != AddressLength {
		return Address{}, fmt.Errorf("decoded length %d is not expected %d: %s", length, AddressLength, trimmed)
	}

	return *((*Address)(result)), nil
}

// CalculateResourceAddress creates a new resource address from
// the source address and seeds.
func CalculateResourceAddress(sourceAddress Address, seed []byte) (Address, error) {
	allbytes := append(sourceAddress[:], seed...)
	allbytes = append(allbytes, byte(255))
	return sha3.Sum256(allbytes), nil
}

func (address Address) String() string {
	allBytes := address[:]
	return "0x" + hex.EncodeToString(allBytes)
}
