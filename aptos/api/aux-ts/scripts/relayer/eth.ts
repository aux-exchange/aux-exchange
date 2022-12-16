
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  EthClient,
  GOERLI_WETH,
  MAINNET_WETH
} from "../../src/eth/client";
import { ethers, Wallet } from "ethers";
import { AU } from "../../src/units";


(async () => {


  const network = process.env['ETH_NETWORK'];
  if (network != "goerli" && network != "mainnet") {
    console.error("NETWORK is invalid!");
    process.exit(1);
  }
  const chainId = (network === "goerli" ? 5 : 1);
  const native = (network === "goerli" ? GOERLI_WETH : MAINNET_WETH);

  const providerUrl = process.env['PROVIDER_URL'];
  if (!providerUrl) {
    console.error("PROVIDER_URL is required!");
    process.exit(1);
  }

  const receiverAddress = process.env['APTOS_RECEIVER'];
  if (!receiverAddress) {
    console.error("APTOS_RECEIVER is required!");
    process.exit(1);
  }

  const relayAddress = process.env['RELAY_ADDRESS'];
  if (!relayAddress) {
    console.error("APTOS_RECEIVER is required!");
    process.exit(1);
  }

  const mnemoic = process.env['MNEMONIC'];
  if (!mnemoic) {
    console.error("MNEMONIC is required!");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(providerUrl);
  const account = ethers.utils.HDNode.fromMnemonic(mnemoic).derivePath(`m/44'/60'/0'/0/0`);
  const signer = new Wallet(account, provider);
  const myAddress = await signer.getAddress();

  const amount = ethers.utils.parseUnits("0.0001", 18);

  const client = new EthClient("RELAY", relayAddress, provider, chainId, network);

  const wrappedTx = {
    from: myAddress,
    to: native,
    value: amount
  };
  console.log("----------SENDING WRAPPED NATIVE TX-------------");
  await (await signer.sendTransaction(wrappedTx)).wait(2);

  console.log("----------SENDING APPROVE TX------------");
  const approveInput = {
    tokenAddress: native,
    tokenAmount: AU(amount.toString()),
    spender: relayAddress
  };
  const approveResult = await client.generateApprovePayload(approveInput, signer)
  console.log(approveResult);

  console.log("---------------Sending Main TX------------------");
  const input = await client.generateNativeSwapTokenTransferPayloadInput({
    tokenAddress: native,
    tokenAmount: AU(amount.toString()),
    receiverAddress,
  }, myAddress);
  const transferResult = await client.generateNativeSwapTokenTransfer(input, signer);
  console.log(transferResult);
})();