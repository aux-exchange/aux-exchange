// Code in this folder is for running go:generate.
// Put real code in folder for corresponding chain.

package aux_go_generate

// math
//go:generate go run github.com/fardream/gen-move-math signed-math -p aux -o ../aptos/contract/aux/sources/signed_int.move -p aux -w 32 -w 128
//go:generate go run github.com/fardream/gen-move-math double-width -p aux -w 256 -o ../aptos/contract/aux/sources/double_width_unsigned.move
//go:generate go run github.com/fardream/gen-move-math more-math -p aux -w 256 -w 128 -o ../aptos/contract/aux/sources/more_math.move

// critbit
//go:generate go run github.com/fardream/gen-move-container critbit -o ../aptos/contract/aux/sources/critbit_v.move -p aux -m critbit_v
//go:generate go run github.com/fardream/gen-move-container critbit -o ../aptos/contract/aux/sources/critbit.move -p aux -m critbit --use-aptos-table

// linked list
//go:generate go run github.com/fardream/gen-move-container linked-list -o ../aptos/contract/aux/sources/linked_list.move -p aux -m linked_list --use-aptos-table
//go:generate go run github.com/fardream/gen-move-container linked-list -o ../aptos/contract/aux/sources/linked_list_v.move -p aux -m linked_list_v

// reward distributor
//go:generate go run ./aptos/cmd/gen-reward-distributor -o ../aptos/contract/aux/sources/reward_distributor.move
//go:generate go run ./aptos/cmd/gen-reward-distributor -q -o ../aptos/contract/aux/sources/reward_quoter.move

//go:generate go run ../docs/concliq/gen-math -o ../aptos/contract/aux/sources/concliq_math.move -p 64

// abort-only-contract
// Uncomment the below command to generate abort only contract
// //go:generate go run ./cmd/move-abort -e authority.move -i ../aptos/contract/aux/sources -o ../aptos/abort-only-contract/aux/sources
