package concliq_test

import (
	"math/big"
	"testing"

	"github.com/aux-exchange/aux-exchange/docs/concliq"
)

func TestGetLog2(t *testing.T) {
	one := big.NewInt(1).Lsh(big.NewInt(1), 64)
	if r, err := concliq.GetLog2(one, 64); err != nil {
		t.Fatal(err)
	} else {
		if r.Cmp(big.NewInt(0)) != 0 {
			t.Fatalf("want 0, got %s", r.String())
		}
	}
}
