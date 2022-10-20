import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import fetch from "cross-fetch";
import gql from "graphql-tag";
import { clob } from "../src";
import { AuxClient } from "../src/client";

const [auxClient, _] = AuxClient.createFromEnvForTesting();
const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://mainnet.aux.exchange/graphql",
    fetch,
  }),
  cache: new InMemoryCache(),
});

async function main() {
  const marketInputs = await clob.core.query.markets(auxClient);
  for (const marketInput of marketInputs) {
    // @ts-ignore
    delete marketInput.marketType;
    console.log(JSON.stringify(marketInput, undefined, 4));
    const market = await apolloClient.query({
      query: gql`
        query ($marketInput: MarketInput!) {
          market(marketInput: $marketInput) {
            orderbook {
              asks {
                price
                quantity
              }
              bids {
                price
                quantity
              }
            }
            tradeHistory {
              price
              quantity
              time
            }
          }
        }
      `,
      variables: {
        marketInput
      },
    });
    console.log(market.data.market.orderbook);
  }
}

main();
