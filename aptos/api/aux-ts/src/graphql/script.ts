// import { ApolloClient, gql, InMemoryCache } from "@apollo/client/core";
// import * as aux from "@aux/aux-ts";
// import { NODE_URL, FAUCET_URL } from "@aux/aux-ts/build/util";
// import { AptosClient, FaucetClient } from "aptos";
// // import { AptosAccount } from "aptos";
// // import * as query from "../src/amm/query";

// // const POOL_QUERY = gql`
// //   query ($poolInputs: [PoolInput!]!) {
// //     pools(poolInputs: $poolInputs) {
// //       coinInfoX {
// //         decimals
// //         name
// //         symbol
// //         type
// //       }
// //       coinInfoY {
// //         decimals
// //         name
// //         symbol
// //         type
// //       }
// //       amountAuX
// //       amountAuY
// //       amountAuLP
// //       feeBps
// //       swapEvents {
// //         amountAuIn
// //         amountAuOut
// //         coinInfoIn {
// //           decimals
// //           name
// //           symbol
// //           type
// //         }
// //         coinInfoOut {
// //           decimals
// //           name
// //           symbol
// //           type
// //         }
// //       }
// //       addLiquidityEvents {
// //         amountAuAddedX
// //         amountAuAddedY
// //         amountAuMintedLP
// //       }
// //       removeLiquidityEvents {
// //         amountAuRemovedX
// //         amountAuRemovedY
// //         amountAuBurnedLP
// //       }
// //     }
// //   }
// // `;

// async function main() {
//   const apolloClient = new ApolloClient({
//     cache: new InMemoryCache({}),
//     uri: "http://localhost:4000/graphql",
//   });

//   const auxCoin =
//     "0x9d9987d40be86216564e3ce7ebddf0a5ad922c017e73ee2c9f563b79ac27ebc6::aux_coin::AuxCoin";
//   const aptosCoin = "0x1::aptos_coin::AptosCoin";

//   // const createPool = await apolloClient.mutate({
//   //   mutation: gql`
//   //     mutation ($createPoolInput: CreatePoolInput!) {
//   //       createPool(createPoolInput: $createPoolInput) {
//   //         coinInfoX {
//   //           name
//   //         }
//   //         coinInfoY {
//   //           name
//   //         }
//   //       }
//   //     }
//   //   `,
//   //   variables: {
//   //     createPoolInput: {
//   //       sender: aux.util.parseConfig('private_key: "'),
//   //       coinTypeX:
//   //         "0x736f3cec0f1a8aa0d89d2d87e6a6cf639cabeae615dd42ce605d446f03ce02ee::aux_coin::AuxCoin",
//   //       coinTypeY: "0x1::aptos_coin::AptosCoin",
//   //       feeBps: 0,
//   //     },
//   //   },
//   // });

//   const addLiquidity = await apolloClient.mutate({
//     mutation: gql`
//       mutation ($addLiquidityInput: AddLiquidityInput!) {
//         addLiquidity(addLiquidityInput: $addLiquidityInput) {
//           feeBps
//         }
//       }
//     `,
//     variables: {
//       addLiquidityInput: {
//         sender: aux.util.parseConfig('private_key: "'),
//         coinTypeX: auxCoin,
//         coinTypeY: aptosCoin,
//         amountAuX: 1,
//         amountAuY: 10,
//       },
//     },
//   });
//   console.log(addLiquidity);

//   console.log(JSON.stringify({
//     sender: aux.util.parseConfig('private_key: "'),
//     coinTypeIn: auxCoin,
//     coinTypeOut: aptosCoin,
//     amountAuIn: "1",
//     minAmountAuOut: "5",
//   }))

//   const swap = await apolloClient.mutate({
//     mutation: gql`
//       mutation ($swapInput: SwapInput!) {
//         swap(swapInput: $swapInput) {
//           feeBps
//         }
//       }
//     `,
//     variables: {
//       swapInput: {
//         sender: aux.util.parseConfig('private_key: "'),
//         coinTypeIn: auxCoin,
//         coinTypeOut: aptosCoin,
//         amountAuIn: "1",
//         minAmountAuOut: "5",
//       },
//     },
//   });
//   console.log(swap);

//   const auxClient = {
//     aptosClient: new AptosClient(NODE_URL),
//     faucetClient: new FaucetClient(NODE_URL, FAUCET_URL),
//     moduleAddress: "0x" + aux.util.parseConfig("account: "),
//   };

//   let poolz = await aux.amm.query.pool(auxClient, {
//     coinTypeX: auxCoin,
//     coinTypeY: aptosCoin,
//   });
//   console.log(poolz);

//   const removeLiquidity = await apolloClient.mutate({
//     mutation: gql`
//       mutation ($removeLiquidityInput: RemoveLiquidityInput!) {
//         removeLiquidity(removeLiquidityInput: $removeLiquidityInput) {
//           feeBps
//         }
//       }
//     `,
//     variables: {
//       removeLiquidityInput: {
//         sender: aux.util.parseConfig('private_key: "'),
//         coinTypeX: auxCoin,
//         coinTypeY: aptosCoin,
//         amountAuLP: "1000000000",
//       },
//     },
//   });
//   console.log(removeLiquidity);

//   // console.log(JSON.stringify({
//   //   removeLiquidityInput: {
//   //     sender: aux.util.parseConfig('private_key: "'),
//   //     coinTypeX: auxCoin,
//   //     coinTypeY: aptosCoin,
//   //     amountAuLP: 21000000000,
//   //   },
//   // }));

//   // const sender = aux.util.parseConfig('private_key: "');
//   // const account = AptosAccount.fromAptosAccountObject({privateKeyHex: sender});

//   // await aux.amm.mutation.addLiquidity(auxClient, {
//   //   sender: account,
//   //   coinTypeX: auxCoin,
//   //   coinTypeY: aptosCoin,
//   //   amountAuX: "1",
//   //   amountAuY: "10"
//   // });

//   // await aux.amm.mutation.removeLiquidity(auxClient, {
//   //   sender: account,
//   //   coinTypeX: auxCoin,
//   //   coinTypeY: aptosCoin,
//   //   auLP: "3000000000",
//   // });

//   let pool = await aux.amm.query.pool(auxClient, {
//     coinTypeX: auxCoin,
//     coinTypeY: aptosCoin,
//   });
//   console.log(pool);
//   // assert.equal(pool.amountAuX, 2);
//   // assert.equal(pool.amountAuY, 5);
//   // assert.equal(pool.amountAuLP, 1_000_000_000);

//   // let pools = await apolloClient.query({
//   //   query: POOL_QUERY,
//   //   variables: {
//   //     poolInputs: [
//   //       {
//   //         coinTypeX:
//   //           "0x9d9987d40be86216564e3ce7ebddf0a5ad922c017e73ee2c9f563b79ac27ebc6::aux_coin::AuxCoin",
//   //         coinTypeY: "0x1::aptos_coin::AptosCoin",
//   //       },
//   //     ],
//   //   },
//   // });

//   // console.log(pools.data.pools[0]);
// }

// main().then(() => {});
