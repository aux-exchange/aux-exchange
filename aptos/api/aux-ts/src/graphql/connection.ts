import { PubSub } from "graphql-subscriptions";
import { AuxClient } from "../client";
import * as dotenv from "dotenv";

dotenv.config();

export const auxClient = AuxClient.createFromEnvForTesting({})[0];

export const pubsub = new PubSub();
