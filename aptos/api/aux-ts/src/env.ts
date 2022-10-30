import * as fs from "fs";
import { AptosNetwork, APTOS_NETWORKS } from "./client";

import { AptosClient } from "aptos";
import * as dotenv from "dotenv";
import _ from "lodash";
import os from "os";
import YAML from "yaml";

/**
 * Bootstrap an AuxEnv by reading environment variables
 *
 */
export class AuxEnv {
  readonly aptosNetwork: AptosNetwork;
  readonly aptosProfile: AptosProfile;
  readonly aptosClient: AptosClient;

  /**
   * First, the environment variable APTOS_PROFILE is checked, and if it is set to non empty value,
   * that profile will be read.
   *
   * Then, if will check if APTOS_PROFILE is set, and if it is set, use that profile for creating
   * an AptosClient.
   * @returns profile name
   */
  constructor() {
    dotenv.config();
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
    if (_.isUndefined(process.env["APTOS_NETWORK"])) {
      throw new Error("`APTOS_NETWORK` must be specified");
    }
    const aptosProfile = getAptosProfile(process.env["APTOS_NETWORK"]);
    const aptosClient = new AptosClient(aptosProfile.rest_url);

    this.aptosNetwork = aptosNetwork;
    this.aptosProfile = aptosProfile;
    this.aptosClient = aptosClient;
  }
}

/**
 * Returns a local Aptos profile by reading from `$HOME/.aptos/config.yaml`.
 *
 * Note this assumes you have ran `aptos set-global-config`.
 *
 * @param profileName
 * @param configPath
 * @returns
 */
export function getAptosProfile(
  aptosProfile: string,
  configPath: string = `${os.homedir()}/.aptos/config.yaml`
): AptosProfile {
  const profiles = YAML.parse(
    fs.readFileSync(configPath, { encoding: "utf-8" })
  );

  const profile = profiles.profiles[aptosProfile];
  if (_.isUndefined(profile)) {
    throw new Error(
      `Could not find profile for ${aptosProfile} in ~/.aptos/config.yaml`
    );
  }
  return profile;
}

export interface AptosProfile {
  private_key: string;
  public_key: string;
  account: string;
  rest_url: string;
  faucet_url: string;
}
