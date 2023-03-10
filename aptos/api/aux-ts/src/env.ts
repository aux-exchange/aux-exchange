import * as fs from "fs";

import { AptosClient, FaucetClient } from "aptos";
import * as dotenv from "dotenv";
import _ from "lodash";
import os from "os";
import YAML from "yaml";

interface urlType {
  [key: string]: string;
}

const defaultUrls: urlType = {
  mainnet: "https://fullnode.mainnet.aptoslabs.com/v1",
  testnet: "https://fullnode.testnet.aptoslabs.com/v1",
  devnet: "https://fullnode.devnet.aptoslabs.com/v1",
  local: "http://0.0.0.0:8080/v1",
  custom: "http://0.0.0.0:8080/v1",
};

/**
 * Bootstrap an AuxEnv by reading environment variables
 *
 */
export class AuxEnv {
  readonly aptosNetwork: AptosNetwork;
  readonly aptosProfile: AptosProfile;
  readonly aptosClient: AptosClient;
  readonly faucetClient: FaucetClient | undefined;

  /**
   * Check if APTOS_PROFILE is set, and if it is set, use that profile for creating an AptosClient.
   * Otherwise, use defaults for the specified APTOS_NETWORK.
   *
   * This will look in your `~/.aptos/config.yaml` file for Full Node REST urls.
   *
   * For example:
   *
   * mainnet:
   *     rest_url: http://localhost:8080
   *
   * `new AuxClient("mainnet")` will use "http://localhost:8080"
   */
  constructor(aptosNetwork?: AptosNetwork, aptosProfile?: AptosProfile) {
    dotenv.config();
    const aptosNetworkEnv = process.env["APTOS_NETWORK"];
    if (_.isUndefined(aptosNetwork) && _.isUndefined(aptosNetworkEnv)) {
      throw new Error(
        `Either pass in aptosNetwork or \`APTOS_NETWORK\` envvar must be set to ${APTOS_NETWORKS}`
      );
    } else if (
      !(
        aptosNetworkEnv === "mainnet" ||
        aptosNetworkEnv === "testnet" ||
        aptosNetworkEnv === "devnet" ||
        aptosNetworkEnv === "local"
      )
    ) {
      throw new Error(
        `Invalid network \`${aptosNetworkEnv}\`: must be one of ${APTOS_NETWORKS}`
      );
    }
    aptosNetwork = aptosNetwork ?? aptosNetworkEnv;
    aptosProfile =
      aptosProfile ??
      getAptosProfile(
        process.env["APTOS_PROFILE"] ??
          process.env["APTOS_NETWORK"] ??
          "default"
      );

    const restUrls = {
      mainnet: "https://fullnode.mainnet.aptoslabs.com/v1",
      testnet: "https://fullnode.testnet.aptoslabs.com/v1",
      devnet: "https://fullnode.devnet.aptoslabs.com/v1",
      local: "http://0.0.0.0:8080/v1",
      custom: "http://0.0.0.0:8080/v1",
    };
    const faucetUrls: Record<string, string> = {
      devnet: "https://fullnode.devnet.aptoslabs.com/v1",
      local: "http://0.0.0.0:8081",
    };
    if (aptosProfile.rest_url === "") {
      delete aptosProfile["rest_url"];
    }
    if (aptosProfile.faucet_url === "") {
      delete aptosProfile["faucet_url"];
    }
    const restUrl = aptosProfile.rest_url ?? restUrls[aptosNetwork];
    const faucetUrl = aptosProfile.faucet_url ?? faucetUrls[aptosNetwork];

    this.aptosNetwork = aptosNetwork;
    this.aptosProfile = aptosProfile;
    this.aptosClient = new AptosClient(restUrl);
    this.faucetClient = _.isUndefined(faucetUrl)
      ? undefined
      : new FaucetClient(restUrl, faucetUrl);
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
  if (!fs.existsSync(configPath)) {
    if (defaultUrls[aptosProfile] !== undefined) {
      return {
        rest_url: defaultUrls[aptosProfile]!,
      };
    }
    throw new Error(`cannot get default url`);
  } else {
    const profiles = YAML.parse(
      fs.readFileSync(configPath, { encoding: "utf-8" })
    );
    const profile = profiles.profiles[aptosProfile];
    if (_.isUndefined(profile)) {
      throw new Error(
        `Could not find profile \`${aptosProfile}\` in ~/.aptos/config.yaml`
      );
    }
    return profile;
  }
}

export type AptosNetwork =
  | "mainnet"
  | "testnet"
  | "devnet"
  | "local"
  | "custom";

export const APTOS_NETWORKS = [
  "mainnet",
  "testnet",
  "devnet",
  "local",
  "custom",
];

/**
 * These values are intentionally not typed as `string | undefined`.
 *
 * Either the key will be set, or it will not be present (vs. explicitly set to undefined).
 */
export interface AptosProfile {
  private_key?: string;
  public_key?: string;
  account?: string;
  rest_url?: string;
  faucet_url?: string;
}
