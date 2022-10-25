package aptos

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

var (
	identifierRegex  = regexp.MustCompile("^[A-z_][A-z-9_]+$")
	whiteSpaceRegex  = regexp.MustCompile(`\s+`)
	genericTypeRegex = regexp.MustCompile(`^([A-z0-9_:]+)+<(.+)>$`)
)

// A type in move is in the format of
// address::module_name::TypeName
// off-chain, the address is a 0x prefixed hex encoded string, but during move development there can be named addresses.
type MoveTypeTag struct {
	// Address of the type
	Address Address
	// Module of the type
	Module string
	// Name of the type
	Name string

	GenericTypeParameters []*MoveTypeTag
}

func NewMoveTypeTag(address Address, module string, name string, genericTypeParameters []*MoveTypeTag) (*MoveTypeTag, error) {
	if !identifierRegex.MatchString(module) {
		return nil, fmt.Errorf("%s is not valid module name", module)
	}
	if !identifierRegex.MatchString(name) {
		return nil, fmt.Errorf("%s is not type name", name)
	}

	return &MoveTypeTag{
		Address: address,
		Module:  module,
		Name:    name,

		GenericTypeParameters: genericTypeParameters,
	}, nil
}

func makeCanonicalSegment(input string) string {
	return whiteSpaceRegex.ReplaceAllString(input, "")
}

func parseMoveTypeTagInternal(fullName string, moveTypeTag *MoveTypeTag) error {
	name := makeCanonicalSegment(fullName)

	var segments []string

	genericMatches := genericTypeRegex.FindStringSubmatch(name)
	var genericParameters []*MoveTypeTag
	if len(genericMatches) == 3 {
		name = genericMatches[1]
		var err error
		genericParameters, err = parseGenericTypeListString(genericMatches[2])
		if err != nil {
			return err
		}
	}

	segments = strings.Split(name, "::")
	if len(segments) != 3 {
		return fmt.Errorf("%s is not in the format of address::module::Name", fullName)
	}

	addressStr := segments[0]

	address, err := ParseAddress(addressStr)
	if err != nil {
		return fmt.Errorf("%s doesn't contain a valid address: %w", fullName, err)
	}

	moduleNameStr := segments[1]
	if !identifierRegex.MatchString(moduleNameStr) {
		return fmt.Errorf("module name %s in %s is invalid", moduleNameStr, fullName)
	}
	typeNameStr := segments[2]

	moveTypeTag.Address = address
	moveTypeTag.Module = moduleNameStr
	moveTypeTag.Name = typeNameStr
	moveTypeTag.GenericTypeParameters = genericParameters

	return nil
}

// ParseMoveTypeTag takes the full name of the move type tag
func ParseMoveTypeTag(fullName string) (*MoveTypeTag, error) {
	r := &MoveTypeTag{}
	if err := parseMoveTypeTagInternal(fullName, r); err != nil {
		return nil, err
	}

	return r, nil
}

func parseGenericTypeListString(genericTypeListString string) ([]*MoveTypeTag, error) {
	leftBracketCount := 0
	var parsedTypes []*MoveTypeTag
	start := 0
	end := 0
	l := len(genericTypeListString)
	if l == 0 {
		return nil, nil
	}

	for idx := 0; idx < l; idx++ {
		switch genericTypeListString[idx] {
		case '<':
			leftBracketCount += 1
		case '>':
			leftBracketCount -= 1
		case ',':
			if leftBracketCount == 0 {
				end = idx
				aTypeStr := genericTypeListString[start:end]
				aType, err := ParseMoveTypeTag(aTypeStr)
				if err != nil {
					return nil, err
				}
				parsedTypes = append(parsedTypes, aType)
				start = idx + 1
				end = idx + 1
			}
		}
	}

	if end < l-1 {
		aType, err := ParseMoveTypeTag(genericTypeListString[start:l])
		if err != nil {
			return nil, err
		}
		parsedTypes = append(parsedTypes, aType)
	}

	return parsedTypes, nil
}

func mapSlices[E ~[]TIn, TIn any, TOut any](input E, mapper func(TIn) TOut) []TOut {
	var r []TOut
	for _, e := range input {
		r = append(r, mapper(e))
	}

	return r
}

func (t *MoveTypeTag) String() string {
	genericListStr := ""
	if len(t.GenericTypeParameters) > 0 {
		genericListStr = fmt.Sprintf(
			"<%s>",
			strings.Join(
				mapSlices(
					t.GenericTypeParameters,
					func(t *MoveTypeTag) string {
						return t.String()
					},
				),
				",",
			),
		)
	}

	return fmt.Sprintf("%s::%s::%s%s", t.Address.String(), t.Module, t.Name, genericListStr)
}

var _ json.Marshaler = (*MoveTypeTag)(nil)

func (t *MoveTypeTag) MarshalJSON() ([]byte, error) {
	typeName := t.String()
	return json.Marshal(typeName)
}

var _ json.Unmarshaler = (*MoveTypeTag)(nil)

func (t *MoveTypeTag) UnmarshalJSON(data []byte) error {
	var dataStr string
	err := json.Unmarshal(data, &dataStr)
	if err != nil {
		return err
	}
	return parseMoveTypeTagInternal(dataStr, t)
}

// Type is to support cobra value
func (t *MoveTypeTag) Type() string {
	return "move-type-tag"
}

// Set is to support cobra value
func (t *MoveTypeTag) Set(data string) error {
	return parseMoveTypeTagInternal(data, t)
}
