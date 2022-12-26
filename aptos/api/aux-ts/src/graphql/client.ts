import { RedisPubSub } from "graphql-redis-subscriptions";
import * as redis from "redis";
import { AuxClient } from "../client";
import { AuxEnv } from "../env";
import Redis from 'ioredis';

export const auxEnv = new AuxEnv();
export const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient);

const redisClientOptions = process.env["REDIS_HOST"]
  ? { url: `redis://${process.env["REDIS_HOST"]}:6379` }
  : {};
export const redisClient = redis.createClient(redisClientOptions);
redisClient.on("error", (err) => {
  throw new Error(err);
});
const redisPubSubOptions = process.env["REDIS_HOST"]
  ? { host: process.env["REDIS_HOST"] }
  : {};
export const redisPubSub = new RedisPubSub({
    // https://github.com/davidyaha/graphql-redis-subscriptions/issues/559
    // @ts-ignore
  publisher: new Redis(redisPubSubOptions),  
    // @ts-ignore
  subscriber: new Redis(redisPubSubOptions),
});

// const connection = new Connection("https://solana-api.projectserum.com");
// const pythPublicKey = getPythProgramKeyForCluster("mainnet-beta");
// export const pythClient = new PythHttpClient(connection, pythPublicKey);
// export const pythConnection = new PythConnection(connection, pythPublicKey);
