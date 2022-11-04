// Code in this folder is for running go:generate.
// Put real code in folder for corresponding chain.
package aux_go_generate

// critbit

// need go install github.com/fardream/gen-move-container@latest
//go:generate gen-move-container critbit -o ../aptos/contract/aux/sources/critbit_v.move -p aux -m critbit_v
//go:generate gen-move-container critbit -o ../aptos/contract/aux/sources/critbit.move -p aux -m critbit --use-aptos-table

//go:generate go run ../docs/stableswap/gen-pool -n 2 -o ../aptos/contract/aux/sources
//go:generate go run ../docs/stableswap/gen-pool -n 3 -o ../aptos/contract/aux/sources
//go:generate go run ../docs/stableswap/gen-move-test 2pool -o ../aptos/contract/aux/sources/math_2pool_test.move -n 50
//go:generate go run ../docs/stableswap/gen-move-test 3pool -o ../aptos/contract/aux/sources/math_3pool_test.move -n 50

// abort-only-contract
// must run this at the last one of the commands since this will copy all contract codes

//go:generate go run ./cmd/move-abort -e authority.move -i ../aptos/contract/aux/sources -o ../aptos/abort-only-contract/aux/sources
