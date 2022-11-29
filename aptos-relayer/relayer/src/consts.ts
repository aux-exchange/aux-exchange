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

const airdropAmount = process.env.AIRDROP_AMOUNT;
if (!airdropAmount) {
  console.error("AIRDROP_AMOUNT is required!");
  process.exit(1);
}
export const AIRDROP_AMOUNT = airdropAmount;

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

export const generateAirdropPayload = (recipientAddress: string) => ({
  function: "0x1::aptos_account::transfer",
  type_arguments: [],
  arguments: [recipientAddress, AIRDROP_AMOUNT],
  type: "entry_function_payload",
});

const KNOWN_TOKEN_BRIDGE_EMITTERS = {
  testnet: {
    [CHAIN_ID_SOLANA]:
      "3b26409f8aaded3f5ddca184695aa6a0fa829b0c85caf84856324896d214ca98",
    [CHAIN_ID_ETH]:
      "000000000000000000000000f890982f9310df57d00f659cf4fd87e65aded8d7",
    [CHAIN_ID_TERRA]:
      "0000000000000000000000000c32d68d8f22613f6b9511872dad35a59bfdf7f0",
    [CHAIN_ID_TERRA2]:
      "c3d4c6c2bcba163de1defb7e8f505cdb40619eee4fa618678955e8790ae1448d",
    [CHAIN_ID_BSC]:
      "0000000000000000000000009dcf9d205c9de35334d646bee44b2d2859712a09",
    [CHAIN_ID_POLYGON]:
      "000000000000000000000000377D55a7928c046E18eEbb61977e714d2a76472a",
    [CHAIN_ID_AVAX]:
      "00000000000000000000000061e44e506ca5659e6c0bba9b678586fa2d729756",
    [CHAIN_ID_OASIS]:
      "00000000000000000000000088d8004a9bdbfd9d28090a02010c19897a29605c",
    [CHAIN_ID_ALGORAND]:
      "6241ffdc032b693bfb8544858f0403dec86f2e1720af9f34f8d65fe574b6238c",
    [CHAIN_ID_APTOS]:
      "0000000000000000000000000000000000000000000000000000000000000001",
    [CHAIN_ID_AURORA]:
      "000000000000000000000000d05ed3ad637b890d68a854d607eeaf11af456fba",
    [CHAIN_ID_FANTOM]:
      "000000000000000000000000599cea2204b4faecd584ab1f2b6aca137a0afbe8",
    [CHAIN_ID_KARURA]:
      "000000000000000000000000d11de1f930ea1f7dd0290fe3a2e35b9c91aefb37",
    [CHAIN_ID_ACALA]:
      "000000000000000000000000eba00cbe08992edd08ed7793e07ad6063c807004",
    [CHAIN_ID_KLAYTN]:
      "000000000000000000000000c7a13be098720840dea132d860fdfa030884b09a",
    [CHAIN_ID_CELO]:
      "00000000000000000000000005ca6037ec51f8b712ed2e6fa72219feae74e153",
    [CHAIN_ID_NEAR]:
      "c2c0b6ecbbe9ecf91b2b7999f0264018ba68126c2e83bf413f59f712f3a1df55",
    [CHAIN_ID_MOONBEAM]:
      "000000000000000000000000bc976d4b9d57e57c3ca52e1fd136c45ff7955a96",
    [CHAIN_ID_ARBITRUM]:
      "00000000000000000000000023908A62110e21C04F3A4e011d24F901F911744A",
    [CHAIN_ID_NEON]:
      "000000000000000000000000c7a204bdbfe983fcd8d8e61d02b475d4073ff97e",
    [CHAIN_ID_XPLA]:
      "b66da121bd3621c8d2604c08c82965640fe682d606af26a302ee09094f5e62cf",
  },
  mainnet: {
    [CHAIN_ID_SOLANA]:
      "ec7372995d5cc8732397fb0ad35c0121e0eaa90d26f828a534cab54391b3a4f5",
    [CHAIN_ID_ETH]:
      "0000000000000000000000003ee18b2214aff97000d974cf647e7c347e8fa585",
    [CHAIN_ID_TERRA]:
      "0000000000000000000000007cf7b764e38a0a5e967972c1df77d432510564e2",
    [CHAIN_ID_TERRA2]:
      "a463ad028fb79679cfc8ce1efba35ac0e77b35080a1abe9bebe83461f176b0a3",
    [CHAIN_ID_BSC]:
      "000000000000000000000000b6f6d86a8f9879a9c87f643768d9efc38c1da6e7",
    [CHAIN_ID_POLYGON]:
      "0000000000000000000000005a58505a96d1dbf8df91cb21b54419fc36e93fde",
    [CHAIN_ID_AVAX]:
      "0000000000000000000000000e082f06ff657d94310cb8ce8b0d9a04541d8052",
    [CHAIN_ID_OASIS]:
      "0000000000000000000000005848c791e09901b40a9ef749f2a6735b418d7564",
    [CHAIN_ID_ALGORAND]:
      "67e93fa6c8ac5c819990aa7340c0c16b508abb1178be9b30d024b8ac25193d45",
    [CHAIN_ID_APTOS]:
      "0000000000000000000000000000000000000000000000000000000000000001",
    [CHAIN_ID_AURORA]:
      "00000000000000000000000051b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
    [CHAIN_ID_FANTOM]:
      "0000000000000000000000007C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
    [CHAIN_ID_KARURA]:
      "000000000000000000000000ae9d7fe007b3327AA64A32824Aaac52C42a6E624",
    [CHAIN_ID_ACALA]:
      "000000000000000000000000ae9d7fe007b3327AA64A32824Aaac52C42a6E624",
    [CHAIN_ID_KLAYTN]:
      "0000000000000000000000005b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
    [CHAIN_ID_CELO]:
      "000000000000000000000000796Dff6D74F3E27060B71255Fe517BFb23C93eed",
    [CHAIN_ID_NEAR]:
      "148410499d3fcda4dcfd68a1ebfcdddda16ab28326448d4aae4d2f0465cdfcb7",
    [CHAIN_ID_MOONBEAM]:
      "000000000000000000000000B1731c586ca89a23809861c6103F0b96B3F57D92",
    [CHAIN_ID_ARBITRUM]:
      "0000000000000000000000000b2402144Bb366A632D14B83F244D2e0e21bD39c",
    [CHAIN_ID_XPLA]:
      "8f9cf727175353b17a5f574270e370776123d90fd74956ae4277962b4fdee24c",
  },
};

export const filters: FilterEntry[] = Object.entries(
  KNOWN_TOKEN_BRIDGE_EMITTERS[NETWORK]
).map(
  ([chainId, emitterAddress]) =>
    ({
      emitterFilter: {
        chainId: Number(chainId),
        emitterAddress,
      },
    } as FilterEntry)
);
