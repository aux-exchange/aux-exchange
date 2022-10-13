package aptos_test

import (
	"bytes"
	"testing"

	aptos "github.com/aux-exchange/aux-exchange/go-util/aptos"
)

var sourceAddrExpected aptos.Address = aptos.Address{204, 182, 37, 160, 214, 7, 156, 81, 63, 173, 30, 240, 93, 150, 58, 60, 198, 143, 80, 225, 63, 83, 255, 120, 68, 208, 225, 253, 253, 210, 133, 192}

func TestStringToAddress(t *testing.T) {
	sourceAddr := "0xccb625a0d6079c513fad1ef05d963a3cc68f50e13f53ff7844d0e1fdfdd285c0"
	addr, err := aptos.StringToAddress(sourceAddr)
	if err != nil {
		t.Fatalf("failed to parse address: %s, %v", sourceAddr, err)
	}

	if !bytes.Equal(addr[:], sourceAddrExpected[:]) {
		t.Fatalf("failed to parse address: %s to %v", sourceAddr, sourceAddrExpected)
	}
}

const resAddrString = "0x168369ec28e1089a80484b8d7f6753a9c9b56c2773b2dd2528fe384e91c6be06"

func TestCalculateResourceAddress(t *testing.T) {
	resAddrExpected, err := aptos.StringToAddress(resAddrString)
	if err != nil {
		t.Fatalf("failed to parse address: %s", resAddrString)
	}
	seed := []byte("test")
	resAddr, err := aptos.CalculateResourceAddress(sourceAddrExpected, seed)
	if err != nil {
		t.Fatalf("failed to calculate resource acount: %v", err)
	}
	if !bytes.Equal(resAddr[:], resAddrExpected[:]) {
		t.Fatalf("resource address calculated is not expected: %v expecting: %v", resAddr, resAddrExpected)
	}
}
