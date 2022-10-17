import { PubSub } from "graphql-subscriptions";
import { AuxClient, Network } from "../client";
import * as dotenv from "dotenv";

dotenv.config();

export const auxClient =
  process.env["APTOS_LOCAL"] === "true"
    ? AuxClient.createFromEnvForTesting({})[0]
    : AuxClient.create({
        network: Network.Devnet,
        validatorAddress: process.env["DEVNET_NODE_URL"]!,
      });
export const pubsub = new PubSub();
