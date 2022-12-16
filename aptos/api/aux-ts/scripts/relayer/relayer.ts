import {
  parse,
} from "@certusone/wormhole-sdk";
import {
  createSpyRPCServiceClient,
  subscribeSignedVAA,
} from "@certusone/wormhole-spydk";
import {
  AuxClient,
} from "../../src/client";
import { AptosClient, AptosAccount } from "aptos";
import { RelayClient } from "../../src/relay/client";

const strip0x = (str: string) =>
  str.startsWith("0x") ? str.substring(2) : str;


(async () => {
  const spy = process.env['SPY'];
  if (!spy) {
    console.error("SPY is required!");
    process.exit(1);
  }
  const SPY = spy;

  const aptosUrl = process.env['APTOS_URL'];
  if (!aptosUrl) {
    console.error("APTOS_URL is required!");
    process.exit(1);
  }
  const APTOS_URL = aptosUrl;

  const aptosKey = process.env['APTOS_KEY'];
  if (!aptosKey) {
    console.error("APTOS_KEY is required!");
    process.exit(1);
  }
  const APTOS_KEY = new Uint8Array(Buffer.from(strip0x(aptosKey), "hex"));

  const aptosAddress = process.env['APTOS_ADDRESS'];
  if (!aptosAddress) {
    console.error("APTOS_ADDRESS is required!");
    process.exit(1);
  }
  const APTOS_ADDRESS = aptosAddress;

  const network = process.env['NETWORK'];
  if (network !== "testnet" && network !== "mainnet") {
    console.error("NETWORK must be testnet or mainnet");
    process.exit(1);
  }

  const ethContract = process.env['ETH_CONTRACT'];
  if (!ethContract) {
    console.error("ETH_CONTRACT is required!");
    process.exit(1);
  }
  const ETH_CONTRACT = ethContract;

  const aptosContract = process.env['APTOS_CONTRACT'];
  if (!aptosContract) {
    console.error("APTOS_CONTRACT is required!");
    process.exit(1);
  }
  const APTOS_CONTRACT = aptosContract;


  const relayAccount = new AptosAccount(
    APTOS_KEY,
    APTOS_ADDRESS
  );
  const getAptosClient = () => new AptosClient(APTOS_URL);
  const aptosClient = getAptosClient();
  const auxClient = new AuxClient(network, aptosClient);
  auxClient.sender = relayAccount;
  const relayClient = new RelayClient(auxClient, ETH_CONTRACT, APTOS_CONTRACT);

  // set up the spy client
  const client = createSpyRPCServiceClient(SPY);
  // subscribe to the stream of signedVAAs from the network of token bridges
  const stream = await subscribeSignedVAA(client, {
      filters: [],
  });

  console.log("-------------RELAYER RUNNING-----------");

  // register error callback to avoid crashing on .cancel()
  stream.addListener("error", (error: any) => {
    if (error.code === 1) {
        // Cancelled on client
        return;
    } else {
        process.exit(1);
    }
  });

  // register data callback
  stream.addListener("data", async ({ vaaBytes }: { vaaBytes: Uint8Array }) => {
    try {
      const vaa = parse(Buffer.from(vaaBytes));
      if (vaa.payload.type === "TransferWithPayload") {
        console.log(vaa);
      }
      const tx = await relayClient.redeemVaa(
        {
          vaaBytes
        }
      );
      if (tx) {
        console.log(tx);
      }
    } catch (e) {
      console.error(e);
    }
  });
})();