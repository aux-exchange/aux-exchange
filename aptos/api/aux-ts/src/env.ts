import { Network, NETWORKS } from "./client";
import * as dotenv from "dotenv";

export function env(): { aptosNetwork: Network } {
  const network = process.env["APTOS_NETWORK"];
  if (
    !(
      network === "mainnet" ||
      network === "testnet" ||
      network === "devnet" ||
      network === "localnet"
    )
  ) {
    throw new Error(
      `Invalid \`network\` ${network}: must be one of ${NETWORKS}`
    );
  }
  return {
    aptosNetwork: network,
    ...dotenv.config(),
  };
}
