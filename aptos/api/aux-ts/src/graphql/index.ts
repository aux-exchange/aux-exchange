import { loadFiles } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";
import { account } from "./resolvers/account";
import { market } from "./resolvers/market";
import { mutation } from "./resolvers/mutation";
import { pool } from "./resolvers/pool";
import { stakePool } from "./resolvers/stake";
import { query } from "./resolvers/query";
import { subscription } from "./resolvers/subscription";
import cors from "cors";

const resolvers = {
  Query: query,
  Mutation: mutation,
  Subscription: subscription,
  Pool: pool,
  Market: market,
  Account: account,
  StakePool: stakePool,
};

async function startApolloServer() {
  const typeDefs = await loadFiles("src/graphql/typeDefs/**/*.graphql");
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express();
  app.use(cors());
  app.use(express.static(path.join(__dirname, "client")));

  const server = http.createServer(app);
  const wsServer = new WebSocketServer({
    server,
    path: "/graphql",
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  // let react handle routing
  app.get("*", (_, res) => res.sendFile(__dirname + "/client/index.html"));

  const port = Number(process.env["GRAPHQL_PORT"] ?? 4000);
  server.listen(port, () => {
    console.log("graphql-server is running on", port);
  });
}

startApolloServer().then(() => {});
