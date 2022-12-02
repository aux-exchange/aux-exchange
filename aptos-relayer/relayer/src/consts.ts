import {
  CHAIN_ID_ACALA,
  CHAIN_ID_ALGORAND,
  CHAIN_ID_APTOS,
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AURORA,
  CHAIN_ID_AVAX,
  CHAIN_ID_BSC,
  CHAIN_ID_CELO,
  CHAIN_ID_ETH,
  CHAIN_ID_FANTOM,
  CHAIN_ID_KARURA,
  CHAIN_ID_KLAYTN,
  CHAIN_ID_MOONBEAM,
  CHAIN_ID_NEAR,
  CHAIN_ID_NEON,
  CHAIN_ID_OASIS,
  CHAIN_ID_POLYGON,
  CHAIN_ID_SOLANA,
  CHAIN_ID_TERRA,
  CHAIN_ID_TERRA2,
  CHAIN_ID_XPLA,
  CONTRACTS,
} from "@certusone/wormhole-sdk";
import { FilterEntry } from "@certusone/wormhole-spydk/lib/cjs/proto/spy/v1/spy";

const strip0x = (str: string) =>
  str.startsWith("0x") ? str.substring(2) : str;

const spy = process.env.SPY;
if (!spy) {
  console.error("SPY is required!");
  process.exit(1);
}
export const SPY = spy;

const aptosUrl = process.env.APTOS_URL;
if (!aptosUrl) {
  console.error("APTOS_URL is required!");
  process.exit(1);
}
export const APTOS_URL = aptosUrl;

const aptosKey = process.env.APTOS_KEY;
if (!aptosKey) {
  console.error("APTOS_KEY is required!");
  process.exit(1);
}
export const APTOS_KEY = new Uint8Array(Buffer.from(strip0x(aptosKey), "hex"));

const aptosAddress = process.env.APTOS_ADDRESS;
if (!aptosAddress) {
  console.error("APTOS_ADDRESS is required!");
  process.exit(1);
}
export const APTOS_ADDRESS = aptosAddress;

export const network = process.env.NETWORK;
if (network !== "testnet" && network !== "mainnet") {
  console.error("NETWORK must be testnet or mainnet");
  process.exit(1);
}
export const NETWORK = network;

export const APTOS_TOKEN_BRIDGE_ADDRESS =
  CONTRACTS[NETWORK === "testnet" ? "TESTNET" : "MAINNET"].aptos.token_bridge;

// export const generateAirdropPayload = (recipientAddress: string) => ({
//   function: "0x1::aptos_account::transfer",
//   type_arguments: [],
//   arguments: [recipientAddress, AIRDROP_AMOUNT],
//   type: "entry_function_payload",
// });

const ethContract = process.env.ETH_CONTRACT;
if (!ethContract) {
  console.error("ETH_CONTRACT is required!");
  process.exit(1);
}
export const ETH_CONTRACT = ethContract;

const aptosContract = process.env.APTOS_CONTRACT;
if (!aptosContract) {
  console.error("APTOS_CONTRACT is required!");
  process.exit(1);
}
export const APTOS_CONTRACT = aptosContract;