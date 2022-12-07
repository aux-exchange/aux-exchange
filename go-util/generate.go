// Code in this folder is for running go:generate.
// Put real code in folder for corresponding chain.

package aux_go_generate

// math
//go:generate go run github.com/fardream/gen-move-math -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 64 -w 128
//go:generate go run github.com/fardream/gen-move-math double-width -p aux -w 256 -o ../aptos/contract/aux/sources/double_width_unsigned.move

// critbit
//go:generate go run github.com/fardream/gen-move-container critbit -o ../aptos/contract/aux/sources/critbit_v.move -p aux -m critbit_v
//go:generate go run github.com/fardream/gen-move-container critbit -o ../aptos/contract/aux/sources/critbit.move -p aux -m critbit --use-aptos-table

// reward distributor
//go:generate go run ./aptos/cmd/gen-reward-distributor -o ../aptos/contract/aux/sources/reward_distributor.move
//go:generate go run ./aptos/cmd/gen-reward-distributor -q -o ../aptos/contract/aux/sources/reward_quoter.move

//go:generate go run ../docs/concliq/gen-math -o ../aptos/contract/aux/sources/concliq_math.move -p 64

// abort-only-contract
// Uncomment the below command to generate abort only contract
// //go:generate go run ./cmd/move-abort -e authority.move -i ../aptos/contract/aux/sources -o ../aptos/abort-only-contract/aux/sources
