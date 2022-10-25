package aptos

import "fmt"

func StringToBCS(s string) []byte {
	v := []byte(s)
	return append(ULEB128Encode(len(v)), v...)
}

// ULEB128Encode converts an uint32 into []byte
func ULEB128Encode[T uint8 | uint16 | uint32 | uint64 | int](input T) []byte {
	var result []byte

	for {
		b := (byte)(input & 127)
		input >>= 7

		if input == 0 {
			result = append(result, b)
			break
		} else {
			result = append(result, b|128)
		}
	}

	return result
}

func ULEB128Decode([]byte) (uint32, error) {
	return 0, fmt.Errorf("unimplemented")
}
