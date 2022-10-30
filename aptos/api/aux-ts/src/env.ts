import { getAptosProfile, AptosNetwork, APTOS_NETWORKS } from "./client";
import * as dotenv from "dotenv";
import { AptosClient } from "aptos";

export function env(): { aptosNetwork: AptosNetwork; aptosClient: AptosClient } {
  const aptosNetwork = process.env["APTOS_NETWORK"];
  if (
    !(
      aptosNetwork === "mainnet" ||
      aptosNetwork === "testnet" ||
      aptosNetwork === "devnet" ||
      aptosNetwork === "localnet"
    )
  ) {
    throw new Error(
      `Invalid \`network\` ${aptosNetwork}: must be one of ${APTOS_NETWORKS}`
    );
  }
  const profile = getAptosProfile(aptosNetwork);
  const aptosClient = new AptosClient(profile.rest_url);

  return {
    aptosNetwork,
    aptosClient,
    ...dotenv.config(),
  };
}
