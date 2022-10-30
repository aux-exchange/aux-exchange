import {
  getPythProgramKeyForCluster,
  PythConnection,
  PythHttpClient,
} from "@pythnetwork/client";
import { Connection } from "@solana/web3.js";
import { RedisPubSub } from "graphql-redis-subscriptions";
import * as redis from "redis";
import { AuxClient } from "../../src/client";
import { env } from "../env";

export const auxClient = new AuxClient(env().aptosNetwork, env().aptosClient);

export const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error("[Redis]", err));
export const redisPubSub = new RedisPubSub();

const connection = new Connection("https://solana-api.projectserum.com");
const pythPublicKey = getPythProgramKeyForCluster("mainnet-beta");
export const pythClient = new PythHttpClient(connection, pythPublicKey);
export const pythConnection = new PythConnection(connection, pythPublicKey);
