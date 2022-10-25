package aptos

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"golang.org/x/crypto/sha3"
)

const AddressLength = 32

// Address in aptos, 32 byte long.
type Address [AddressLength]byte

// ParseAddress converts a hex encoded string to address.
func ParseAddress(s string) (Address, error) {
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

// Hex representation of the address, with 0x prefix
func (address Address) String() string {
	allBytes := address[:]
	return "0x" + strings.TrimLeft(hex.EncodeToString(allBytes), "0")
}

// Checks if the address is zero.
func (address Address) IsZero() bool {
	for i := 0; i < AddressLength; i++ {
		if address[i] != 0 {
			return false
		}
	}

	return true
}

// Check if an address string is named address
func IsNamedAddress(address string) bool {
	return !strings.HasPrefix(address, "0x")
}

var (
	_ json.Marshaler   = (*Address)(nil)
	_ json.Unmarshaler = (*Address)(nil)
)

func (address *Address) UnmarshalJSON(input []byte) error {
	var dataStr string
	if err := json.Unmarshal(input, &dataStr); err != nil {
		return err
	}

	x, err := ParseAddress(dataStr)
	if err != nil {
		return err
	}
	*address = x

	return nil
}

func (address Address) MarshalJSON() ([]byte, error) {
	return json.Marshal(address.String())
}

// Set is to support cobra value
func (a *Address) Set(s string) error {
	b, err := ParseAddress(s)
	*a = Address(b)
	if err != nil {
		return err
	}

	return nil
}

// Type is to support cobra value
func (a Address) Type() string {
	return "aptos-address"
}
