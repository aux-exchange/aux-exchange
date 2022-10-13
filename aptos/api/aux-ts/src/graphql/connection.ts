import { PubSub } from "graphql-subscriptions";
import { AuxClient } from "../client";

export const [auxClient, _] = AuxClient.createFromEnvForTesting({});
export const pubsub = new PubSub();
