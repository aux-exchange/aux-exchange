import { PubSub } from "graphql-subscriptions";

import { AuxClient } from "../../src/client";
import { Connection } from "@solana/web3.js";
import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from "@pythnetwork/client";

export const auxClient = AuxClient.createFromEnvForTesting({})[0];

export const pubsub = new PubSub();

const connection = new Connection("https://solana-api.projectserum.com");
const pythPublicKey = getPythProgramKeyForCluster("mainnet-beta");
export const pythClient = new PythHttpClient(connection, pythPublicKey);
