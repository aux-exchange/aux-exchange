import {
    ChainId,
    CHAIN_ID_APTOS,
    CHAIN_ID_ETH,
    getForeignAssetAptos,
    getAssetFullyQualifiedType,
    parse,
} from "@certusone/wormhole-sdk";
import {
    createSpyRPCServiceClient,
    subscribeSignedVAA,
} from "@certusone/wormhole-spydk";
import { AptosAccount, AptosClient, CoinClient } from "aptos";
import {
    APTOS_ADDRESS,
    APTOS_CONTRACT,
    APTOS_KEY,
    APTOS_TOKEN_BRIDGE_ADDRESS,
    APTOS_URL,
    ETH_CONTRACT,
    SPY,
} from "./consts";

const getAptosClient = () => new AptosClient(APTOS_URL);

(async () => {
    console.log(SPY);
    // set up the spy client
    const client = createSpyRPCServiceClient(SPY);
    // subscribe to the stream of signedVAAs from the network of token bridges
    const stream = await subscribeSignedVAA(client, {
        filters: [],
    });
    console.log("RELAY RUNNING");
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
            // TODO: Do not always automatically do this
            if (
                parsed.payload.type === "AttestMeta" &&
                parsed.payload.tokenChain === CHAIN_ID_ETH
            ) {
                console.log(parsed.payload);
                // export interface TokenBridgeAttestMeta {
                //     module: "TokenBridge";
                //     type: "AttestMeta";
                //     chain: 0;
                //     tokenAddress: string;
                //     tokenChain: number;
                //     decimals: number;
                //     symbol: string;
                //     name: string;
                // }
                const { tokenAddress, tokenChain } = parsed.payload;
                const aptosClient = getAptosClient();
                const relayAccount = new AptosAccount(
                    APTOS_KEY,
                    APTOS_ADDRESS
                );
                (async () => {
                    {
                        const createCoinTypeArgs = {
                            function: `${APTOS_TOKEN_BRIDGE_ADDRESS}::wrapped::create_wrapped_coin_type`,
                            type_arguments: [],
                            arguments: [vaaBytes],
                            type: "entry_function_payload"
                        };
                        const rawCreateCoinTypeTx = await aptosClient.generateTransaction(
                            APTOS_ADDRESS,
                            createCoinTypeArgs
                        );
                        const signedCreateCoinTypeTx = await aptosClient.signTransaction(
                            relayAccount,
                            rawCreateCoinTypeTx
                        );
                        const hash = (await aptosClient.submitTransaction(signedCreateCoinTypeTx))
                            .hash;
                        console.log("Sent create_wrapped_coin_type tx to Aptos: ", hash);
                        await aptosClient.waitForTransaction(hash);
                    }

                    {
                        const coinType = getAssetFullyQualifiedType(
                            APTOS_TOKEN_BRIDGE_ADDRESS,
                            CHAIN_ID_ETH,
                            tokenAddress
                        );
                        if (!coinType) {
                            throw "Could not determine the type";
                        }
                        const createCoinArgs = {
                            function: `${APTOS_TOKEN_BRIDGE_ADDRESS}::wrapped::create_wrapped_coin`,
                            type_arguments: [coinType],
                            arguments: [vaaBytes],
                            type: "entry_function_payload"
                        };
                        const rawCreateCoinTx = await aptosClient.generateTransaction(
                            APTOS_ADDRESS,
                            createCoinArgs
                        );
                        const signedCreateCoinTx = await aptosClient.signTransaction(
                            relayAccount,
                            rawCreateCoinTx
                        );
                        const hash = (await aptosClient.submitTransaction(signedCreateCoinTx)).hash;
                        console.log(`Sent create_wrapped_coin<${coinType}> to Aptos: `, hash);
                        await aptosClient.waitForTransaction(hash);
                    }
                })();
            }

            // check if this is a TransferWithPayload to Aptos
            if (
                parsed.payload.type === "TransferWithPayload" &&
                parsed.payload.chain === CHAIN_ID_APTOS &&
                parsed.payload.fromAddress.slice(-40).toLowerCase() === ETH_CONTRACT.slice(-40).toLowerCase()
            ) {
                // export interface TokenBridgeTransferWithPayload {
                console.log(parsed.payload);
                //     module: "TokenBridge";
                //     type: "TransferWithPayload";
                //     amount: bigint;
                //     tokenAddress: string;
                //     tokenChain: number;
                //     toAddress: string;
                //     chain: number;
                //     fromAddress: string;
                //     payload: string;
                // }
                console.log(parsed.payload);
                const { amount, toAddress, tokenAddress, tokenChain, payload } = parsed.payload;
                (async () => {
                    try {
                        // check if this user is registered to receive the token
                        const aptosClient = getAptosClient();
                        const coinType = await getForeignAssetAptos(
                            aptosClient,
                            APTOS_TOKEN_BRIDGE_ADDRESS,
                            tokenChain as ChainId,
                            tokenAddress
                        );
                        if (!coinType) {
                            throw "Could not find corresponding coinType on Aptos. Make sure the network is correct and coinType has been initialized.";
                        }
                        const coinStore = `0x1::coin::CoinStore<${coinType}>`;
                        const recipentAddress = toAddress;
                        let registered;
                        try {
                            await aptosClient.getAccountResource(recipentAddress, coinStore);
                            registered = true;
                        } catch (e: any) {
                            registered = false;
                            // the account is not registered for this token
                            if (e?.status === 404 && e?.errorCode === "resource_not_found") {
                                
                            } else {
                                console.error(e);
                            }
                        }

                        const relayAccount = new AptosAccount(
                            APTOS_KEY,
                            APTOS_ADDRESS
                        );

                        {
                            const redeemFunction = (registered ? "redeem_vaa" : "redeem_vaa_with_escrow");

                            const redeemVAAargs = {
                                function: `${APTOS_CONTRACT}::redeem_with_native_swap::${redeemFunction}`,
                                type_arguments: [coinType],
                                arguments: [vaaBytes],
                                type: "entry_function_payload"
                            };

                            const rawTx = await aptosClient.generateTransaction(
                                APTOS_ADDRESS,
                                redeemVAAargs
                            );

                            const signedTx = await aptosClient.signTransaction(
                                relayAccount,
                                rawTx
                            );
                            const hash = (await aptosClient.submitTransaction(signedTx)).hash;
                            console.log(`Sent ${redeemFunction} tx to Aptos: `, hash);
                            await aptosClient.waitForTransaction(hash);
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
