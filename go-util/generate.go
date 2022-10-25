// Code in this folder is for running go:generate.
// Put real code in folder for corresponding chain.
package aux_go_generate

// critbit

// need go install github.com/fardream/gen-move-container@latest
//go:generate gen-move-container critbit -o ../aptos/contract/aux/sources/critbit_v.move -p aux -m critbit_v
//go:generate gen-move-container critbit -o ../aptos/contract/aux/sources/critbit.move -p aux -m critbit --use-aptos-table

// abort-only-contract
// must run this after the commands above because this is copying the contract over

//go:generate go run ./cmd/move-abort -e authority.move -i ../aptos/contract/aux/sources -o ../aptos/abort-only-contract/aux/sources
