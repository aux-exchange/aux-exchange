import { loadFiles } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import fs from "fs";
import path from 'path'
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import https from "https";
import { WebSocketServer } from "ws";
import { publishAmmEvents, publishClobEvents } from "./feed";
import { account } from "./resolvers/account";
import { market } from "./resolvers/market";
import { mutation } from "./resolvers/mutation";
import { pool } from "./resolvers/pool";
import { query } from "./resolvers/query";
import { subscription } from "./resolvers/subscription";

const resolvers = {
  Query: query,
  Mutation: mutation,
  Subscription: subscription,
  Pool: pool,
  Market: market,
  Account: account,
};

/**
 * Redirects to https if insecure.
 */
function ensureSecure(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  if (req.secure) {
    return next();
  }
  res.redirect("https://" + req.hostname + req.url);
}

async function startApolloServer() {
  market;
  // Create the schema, which will be used separately by ApolloServer and
  // the WebSocket server.
  const typeDefs = await loadFiles("src/graphql/typeDefs/**/*.graphql");
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create an Express app and HTTP server; we will attach both the WebSocket
  // server and the ApolloServer to this HTTP server.
  const app = express();
  
  app.use(express.static(path.join(__dirname, 'client')));

  let server;
  if (process.env["AUX_GRAPHQL_LOCAL"]) {
    server = http.createServer(app);

  } else {
    app.all("*", ensureSecure);
    const privateKey = fs.readFileSync(
      "/etc/letsencrypt/live/aux.exchange/privkey.pem",
      "utf8"
    );
    const certificate = fs.readFileSync(
      "/etc/letsencrypt/live/aux.exchange/cert.pem",
      "utf8"
    );
    const ca = fs.readFileSync(
      "/etc/letsencrypt/live/aux.exchange/chain.pem",
      "utf8"
    );
    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };

    http.createServer(app).listen(80);
    server = https.createServer(credentials, app);
  }

  // Only use http to redirect to https.

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server,
    path: "/graphql",
  });
  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer({ schema }, wsServer);

  // Set up ApolloServer.
  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer: server }),

      // Proper shutdown for the WebSocket server.
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

  // Catch-all so React can handle routing
  app.get("*", (_, res) => res.redirect("/"));

  // Now that our HTTP server is fully set up, we can listen to it.
  if (process.env["AUX_GRAPHQL_LOCAL"]) {
    server.listen(4000, () => {
      console.log("graphql-server is running on 4000");
    });
  } else {
    server.listen(443, () => {
      console.log("graphql-server is running on 443");
    });
  }
}

publishAmmEvents;
publishClobEvents;
startApolloServer().then(() => {});
