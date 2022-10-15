import { PubSub } from "graphql-subscriptions";
import { AuxClient, Network } from "../client";

export const auxClient = process.env["APTOS_LOCAL"] === "true"
  ? AuxClient.createFromEnvForTesting({})[0]
  : AuxClient.create({
      network: Network.Devnet,
      validatorAddress: "https://fullnode.devnet.aptoslabs.com/v1",
    });
export const pubsub = new PubSub();
