package aptos_test

import (
	"testing"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func TestParseTypeName(t *testing.T) {
	moveType, err := aptos.ParseMoveTypeTag("0x1::coin::CoinInfo<0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541::amm::LP<0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T, 0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>>")
	if err != nil {
		t.Fatalf("failed to parse type: %v", err)
	}

	if moveType.Address.String() != "0x1" {
		t.Fatalf("invalid type: %v", moveType.Address.String())
	}
}
