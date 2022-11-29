import {
  ChainId,
  CHAIN_ID_APTOS,
  getForeignAssetAptos,
  parse,
} from "@certusone/wormhole-sdk";
import {
  createSpyRPCServiceClient,
  subscribeSignedVAA,
} from "@certusone/wormhole-spydk";
import { AptosAccount, AptosClient, CoinClient } from "aptos";
import {
  AIRDROP_AMOUNT,
  APTOS_ADDRESS,
  APTOS_KEY,
  APTOS_TOKEN_BRIDGE_ADDRESS,
  APTOS_URL,
  filters,
  generateAirdropPayload,
  SPY,
} from "./consts";

const getAptosClient = () => new AptosClient(APTOS_URL);

(async () => {
  // set up the spy client
  const client = createSpyRPCServiceClient(SPY);
  // subscribe to the stream of signedVAAs from the network of token bridges
  const stream = await subscribeSignedVAA(client, {
    filters,
  });
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
  stream.addListener("data", ({ vaaBytes }: { vaaBytes: Uint8Array }) => {
    try {
      const parsed = parse(Buffer.from(vaaBytes));
      // check if this is a transfer to Aptos
      if (
        parsed.payload.type === "Transfer" &&
        parsed.payload.chain === CHAIN_ID_APTOS
      ) {
        const { toAddress, tokenAddress, tokenChain } = parsed.payload;
        (async () => {
          try {
            // check if this user is registered to receive the token
            const aptosClient = getAptosClient();
            const lookupAsset = await getForeignAssetAptos(
              aptosClient,
              APTOS_TOKEN_BRIDGE_ADDRESS,
              tokenChain as ChainId,
              tokenAddress
            );
            const coinStore = `0x1::coin::CoinStore<${lookupAsset}>`;
            try {
              await aptosClient.getAccountResource(toAddress, coinStore);
              // TODO: optionally perform the redeem
            } catch (e: any) {
              // the account is not registered for this token
              if (e?.status === 404 && e?.errorCode === "resource_not_found") {
                const recipientAccount = new AptosAccount(undefined, toAddress);
                const coinClient = new CoinClient(aptosClient);
                try {
                  await coinClient.checkBalance(recipientAccount);
                  // do nothing, the account has funds but hasn't registered
                } catch (e: any) {
                  if (
                    e?.status === 404 &&
                    e?.errorCode === "account_not_found"
                  ) {
                    const airdropAccount = new AptosAccount(
                      APTOS_KEY,
                      APTOS_ADDRESS
                    );
                    const rawTx = await aptosClient.generateTransaction(
                      APTOS_ADDRESS,
                      generateAirdropPayload(toAddress)
                    );
                    const signedTx = await aptosClient.signTransaction(
                      airdropAccount,
                      rawTx
                    );
                    const hash = (await aptosClient.submitTransaction(signedTx))
                      .hash;
                    console.log(
                      toAddress,
                      "has no APT, airdropped",
                      AIRDROP_AMOUNT.toString(),
                      "in tx",
                      hash
                    );
                  } else {
                    console.error(e);
                  }
                }
              } else {
                console.error(e);
              }
            }
          } catch (e) {
            console.error(e);
          }
        })();
      }
    } catch (e) {
      console.error(e);
    }
  });
})();
