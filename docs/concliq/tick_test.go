package concliq_test

import (
	"encoding/hex"
	"math/big"
	"strings"
	"testing"

	"github.com/aux-exchange/aux-exchange/docs/concliq"
)

var wantsNeg128 []string = []string{
	"0xfffcb933bd6fad37aa2d162d1a594001",
	"0xfff97272373d413259a46990580e213a",
	"0xfff2e50f5f656932ef12357cf3c7fdcc",
	"0xffe5caca7e10e4e61c3624eaa0941cd0",
	"0xffcb9843d60f6159c9db58835c926644",
	"0xff973b41fa98c081472e6896dfb254c0",
	"0xff2ea16466c96a3843ec78b326b52861",
	"0xfe5dee046a99a2a811c461f1969c3053",
	"0xfcbe86c7900a88aedcffc83b479aa3a4",
	"0xf987a7253ac413176f2b074cf7815e54",
	"0xf3392b0822b70005940c7a398e4b70f3",
	"0xe7159475a2c29b7443b29c7fa6e889d9",
	"0xd097f3bdfd2022b8845ad8f792aa5825",
	"0xa9f746462d870fdf8a65dc1f90e061e5",
	"0x70d869a156d2a1b890bb3df62baf32f7",
	"0x31be135f97d08fd981231505542fcfa6",
	"0x9aa508b5b7a84e1c677de54f3e99bc9",
	"0x5d6af8dedb81196699c329225ee604",
	"0x2216e584f5fa1ea926041bedfe98",
	"0x48a170391f7dc42444e8fa2",
}

func TestGetSquarePriceNegPow2N_128(t *testing.T) {
	// manyones := big.NewInt(0).Lsh(big.NewInt(1), 128*2+64)
	two32 := big.NewInt(0).Lsh(big.NewInt(1), 32)

	for i, want := range wantsNeg128 {
		p := concliq.GetSquarePriceNegPow2N(i, 128+32)
		// p = p.Div(manyones, p)
		reminder := big.NewInt(0).Mod(p, two32).Int64()
		p = p.Rsh(p, 32)
		p = p.Add(p, big.NewInt(reminder>>31))
		wantBytes := strings.TrimPrefix(want, "0x")
		if len(wantBytes)%2 != 0 {
			wantBytes = "0" + wantBytes
		}
		wantStr, _ := hex.DecodeString(wantBytes)
		wantInt := big.NewInt(0).SetBytes(wantStr)

		if wantInt.Cmp(p) != 0 {
			t.Errorf("line: %d\nwant: 0x%s\ngot:  0x%s\nremd: %d\n", i, hex.EncodeToString(wantInt.Bytes()), hex.EncodeToString(p.Bytes()), reminder)
		}
	}
}

var wants96 []string = []string{
	"79232123823359799118286999567",
	"79236085330515764027303304731",
	"79244008939048815603706035061",
	"79259858533276714757314932305",
	"79291567232598584799939703904",
	"79355022692464371645785046466",
	"79482085999252804386437311141",
	"79736823300114093921829183326",
	"80248749790819932309965073892",
	"81282483887344747381513967011",
	"83390072131320151908154831281",
	"87770609709833776024991924138",
	"97234110755111693312479820773",
	"119332217159966728226237229890",
	"179736315981702064433883588727",
	"407748233172238350107850275304",
	"2098478828474011932436660412517",
	"55581415166113811149459800483533",
	"38992368544603139932233054999993551",
}

func TestGetSquarePricePow2N_96(t *testing.T) {
	for i, want := range wants96 {
		p := concliq.GetSquarePricePow2N(i, 96)
		wantInt, ok := big.NewInt(0).SetString(want, 10)
		if !ok {
			t.Fatalf("%s is not a big int", want)
		}

		if p.Cmp(wantInt) != 0 {
			t.Errorf("line: %d\nwant: %s\ngot:  %s\n", i, wantInt.String(), p.String())
		}
	}
}

func TestGetSquarePricePow2N_96_128(t *testing.T) {
	for i, want := range wants96 {
		p := concliq.GetSquarePricePow2N(i, 128)
		p = p.Rsh(p, 32)
		wantInt, ok := big.NewInt(0).SetString(want, 10)
		if !ok {
			t.Fatalf("%s is not a big int", want)
		}

		if p.Cmp(wantInt) != 0 {
			t.Errorf("line: %d\nwant: %s\ngot:  %s\n", i, wantInt.String(), p.String())
		}
	}
}

var wants64 = []string{
	"18445821805675392311",
	"18444899583751176498",
	"18443055278223354162",
	"18439367220385604838",
	"18431993317065449817",
	"18417254355718160513",
	"18387811781193591352",
	"18329067761203520168",
	"18212142134806087854",
	"17980523815641551639",
	"17526086738831147013",
	"16651378430235024244",
	"15030750278693429944",
	"12247334978882834399",
	"8131365268884726200",
	"3584323654723342297",
	"696457651847595233",
	"26294789957452057",
	"37481735321082",
}

func TestGetSquarePriceNegPow2N_64(t *testing.T) {
	for i, want := range wants64 {
		p := concliq.GetSquarePriceNegPow2N(i, 64)
		wantInt, ok := big.NewInt(0).SetString(want, 10)
		if !ok {
			t.Fatalf("%s is not a big int", want)
		}

		if p.Cmp(wantInt) != 0 {
			t.Errorf("line: %d\nwant: %s\ngot:  %s\n", i, wantInt.String(), p.String())
		}
	}
}

func TestGetSquarePricePow2N_64_96(t *testing.T) {
	ones := big.NewInt(1)
	ones.Lsh(ones, 64*2+32*2)
	for i, want := range wants64 {
		p := concliq.GetSquarePricePow2N(i, 96)
		p = p.Div(ones, p)
		p = p.Rsh(p, 32)
		wantInt, ok := big.NewInt(0).SetString(want, 10)
		if !ok {
			t.Fatalf("%s is not a big int", want)
		}

		if p.Cmp(wantInt) != 0 {
			t.Errorf("line: %d\nwant: %s\ngot:  %s\n", i, wantInt.String(), p.String())
		}
	}
}
