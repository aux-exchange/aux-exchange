package aptos

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"strconv"
)

// JsonUint64 is an uint64, but serialized into a string, and can be deserialized from either a string or a number from json.
// This is because aptos fullnode uses string for uint64, whereas golang's json encoding only support number.
type JsonUint64 uint64

var (
	_ json.Marshaler   = (*JsonUint64)(nil)
	_ json.Unmarshaler = (*JsonUint64)(nil)
)

func (i *JsonUint64) UnmarshalJSON(data []byte) error {
	var j uint64
	if err := json.Unmarshal(data, &j); err != nil {
		var str string
		if errStr := json.Unmarshal(data, &str); errStr != nil {
			return fmt.Errorf("failed to parse as uint64: %w, then failed to parse as string: %v", err, errStr)
		}
		if j, err := strconv.ParseUint(str, 10, 64); err != nil {
			return fmt.Errorf("failed to parse string: %s as uint64: %w", str, err)
		} else {
			*i = JsonUint64(j)
		}
	} else {
		*i = JsonUint64(j)
	}

	return nil
}

func (i JsonUint64) MarshalJSON() ([]byte, error) {
	return json.Marshal(strconv.FormatUint(uint64(i), 10))
}

func (i JsonUint64) ToBCS() []byte {
	b := make([]byte, 8)
	binary.LittleEndian.PutUint64(b, uint64(i))
	return b
}
