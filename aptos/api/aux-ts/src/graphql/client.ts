import axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import { PubSub } from "graphql-subscriptions";
import { AuxClient } from "../client";
import { AuxEnv } from "../env";

export const auxEnv = new AuxEnv();
export const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient);
// const connection = new Connection("https://solana-api.projectserum.com");
// const pythPublicKey = getPythProgramKeyForCluster("mainnet-beta");
// export const pythClient = new PythHttpClient(connection, pythPublicKey);
// export const pythConnection = new PythConnection(connection, pythPublicKey);

export const axiosInstance = setupCache(axios, {
  ttl: 1000 * 60 * 5,
});

class _fakeRedis {
  async get(v: string): Promise<string | undefined> {
    try {
      const resp = await axiosInstance.get(
        "https://storage.googleapis.com/driven-rider-375613.appspot.com/public/pool-stat.json"
      );
      const data: any = resp.data;

      if (data[v] !== undefined) {
        return data[v];
      } else {
        return undefined;
      }
    } catch (e) {
      console.error(`failed to query ${v} because: ${e}`);
      return undefined;
    }
  }
}

export const dataClient = new _fakeRedis();

export const pubSubClient = new PubSub();
