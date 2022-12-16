import Web3 from "web3";
import { ethers, Contract, ContractInterface, Signer, BigNumber} from "ethers";
import Relay from "./abi/Relay.json";
import type {
  NativeSwapTokenTransferPayloadInput,
  NativeSwapTokenTransferInput,
  ApproveInput,
  AuxEthTransaction,
  ApproveEvent,
  NativeSwapTokenTransferEvent,
} from "./schema";
import BN from "bn.js";
import { AtomicUnits, AU } from "../units";

const utils = Web3.utils;
const parseUnits = ethers.utils.parseUnits;

function convertAU(n: AtomicUnits) {
  return BigNumber.from(n.amount.toString());
}

export type EthNetwork =
  | "mainnet"
  | "goerli"
  | "local"
  | "custom";

export const ETH_NETWORKS = [
  "mainnet",
  "goeril",
  "local",
  "custom"
];

export const MAINNET_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const MAINNET_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const MAINNET_USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
export const GOERLI_WETH = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";

export const RELAY_WHITELIST = {
  "mainnet": {
    [MAINNET_WETH]: {
      fee: parseUnits("0.002", 18),
    },
    [MAINNET_USDC]: {
      fee: parseUnits("2", 6),
    },
    [MAINNET_USDT]: {
      fee: parseUnits("2", 6),
    },
  },
  "goerli": {
    [GOERLI_WETH]: {
      fee: parseUnits("2", 6),
    },
  }, 
  "local": {

  },
  "custom": {

  }
};

export const NATIVE_SWAP_AMOUNT = parseUnits("0.1", 8);

export type ETH_CONTRACTS = 
  | "RELAY";

export class EthClient {
  contractAddress: string;
  provider: ethers.providers.Provider;
  contract: Contract;
  chainId: number;
  network: EthNetwork;
  constructor(contractType: ETH_CONTRACTS, contractAddress: string, provider: ethers.providers.Provider, chainId: number, network: EthNetwork) {
    this.provider = provider;
    this.contractAddress = contractAddress;
    const ABI = EthClient.loadABI(contractType);
    this.contract = new Contract(contractAddress, ABI);
    this.chainId = chainId;
    this.network = network;
  }

  static createJSON(providerUrl: string, chainId: number): ethers.providers.Provider {
    return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
  }

  static loadABI(contractType: ETH_CONTRACTS): ContractInterface {
    switch (contractType) {
      case "RELAY": {
        return Relay.abi;
      }
      default: {
        throw new Error("No ABI found");
      }
    }
  }

  static strip0x = (str: string) =>
    str.startsWith("0x") ? str.substring(2) : str;

  async generateApprovePayload(input: ApproveInput, signer: Signer): Promise<AuxEthTransaction<ApproveEvent>> {
    const userAddress = await signer.getAddress();

    const abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"];
    const tokenContract = new ethers.Contract(input.tokenAddress, abi, signer);
    const tx = await tokenContract['approve'](input.spender, convertAU(input.tokenAmount));
    const receipt = await tx.wait(1);
    
    let event;
    const approvalTopic = ethers.utils.id("Approval(address,address,uint256)");
    receipt.logs.forEach((log: ethers.providers.Log) => {
      if (
        log.topics[0]?.slice(-64) === approvalTopic.slice(-64).toLowerCase() &&
        log.topics[1]?.slice(-40).toLowerCase() === userAddress.slice(-40).toLowerCase() &&
        log.topics[2]?.slice(-40).toLowerCase() == this.contractAddress.slice(-40).toLowerCase()
      ) {
        event = {
          userAddress,
          spender: this.contractAddress,
          tokenAmount: AU(new BN(EthClient.strip0x(log.data), "hex")),
        }
      }
    });

    return {
      transaction: receipt,
      result: event
    }
  }
  
  async generateNativeSwapTokenTransferPayloadInput(input: NativeSwapTokenTransferInput, sender: string): Promise<NativeSwapTokenTransferPayloadInput> {
    const whitelist = RELAY_WHITELIST[this.network] as any;
    const fee = whitelist["0x" + input.tokenAddress.slice(-40).toLowerCase()];
    if (fee !== undefined) {
      const nonce = await this.provider.getTransactionCount(sender);
      if (nonce === undefined) {
        throw new Error("Nonce is undefined");
      }
      return {
        ...input,
        nativeSwapAmount: AU(NATIVE_SWAP_AMOUNT.toString()),
        relayerFee: AU(fee.fee.toString()),
        nonce: AU(nonce.toString()),
      };
    } else {
      throw new Error("Invalid Token");
    }
  }

  async generateNativeSwapTokenTransfer(input: NativeSwapTokenTransferPayloadInput, signer: Signer): Promise<AuxEthTransaction<NativeSwapTokenTransferEvent>> {
    const userAddress = await signer.getAddress();
    const connectedContract = this.contract.connect(signer);
    const receiverBytes32 = utils.padLeft(input.receiverAddress, 64); // 64 hex characters in a 32 byte string
    const args = [input.tokenAddress, convertAU(input.tokenAmount), convertAU(input.relayerFee), receiverBytes32, convertAU(input.nativeSwapAmount), convertAU(input.nonce)];
    
    const response = await connectedContract['transferTokens'](...args);
    const receipt = await response.wait(1);

    let event;
    const depositTopic = ethers.utils.id("Deposit(address,address,uint256,uint256,bytes32,uint64,uint32)");
    receipt.logs.forEach((log: ethers.providers.Log) => {
      if (
        log.topics[0]?.slice(-64).toLowerCase() === depositTopic.slice(-64).toLowerCase() &&
        log.topics[1]?.slice(-40).toLowerCase() === userAddress.slice(-40).toLowerCase() &&
        log.topics[2]?.slice(-40).toLowerCase() === input.tokenAddress.slice(-40).toLowerCase()
      ) {
        let data = EthClient.strip0x(log.data);
        event = {
          sender: userAddress,
          tokenAddress: input.tokenAddress,
          tokenAmount: AU(new BN(data.slice(0, 64), "hex")),
          relayerFee: AU(new BN(data.slice(64, 128), "hex")),
          receiverAddress: data.slice(128, 192),
          nativeSwapAmount: AU(new BN(data.slice(192, 256), "hex")),
          nonce: AU(new BN(data.slice(256, 320), "hex")),
        }
      }
    });
    return {
      transaction: receipt,
      result: event
    }
  }
}