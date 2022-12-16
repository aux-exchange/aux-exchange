// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {IWormhole} from "../src/interfaces/IWormhole.sol";
import {AptosRelay} from "../src/aptos-relay/AptosRelay.sol";
import {TestToken} from "../src/test-token/TestToken.sol";

import "forge-std/console.sol";

contract ContractScript is Script {
    IWormhole wormhole;
    address tokenBridgeAddress;
    bytes32 aptosContractAddress;
    AptosRelay aptosRelay;
    TestToken testToken;

    uint16 immutable APTOS_CHAIN_ID = 22;

    function setUp() public {
        aptosContractAddress = vm.envBytes32("TEST_RELAY_APTOS_CONTRACT_ADDRESS");
        tokenBridgeAddress = vm.envAddress("TEST_TOKEN_BRIDGE_ADDRESS");
        console.logBytes32(aptosContractAddress);
    }

    function deployAptosRelay() public {
        testToken = new TestToken();
        aptosRelay = new AptosRelay(
            tokenBridgeAddress,
            APTOS_CHAIN_ID
        );
        aptosRelay.changeContractAddress(aptosContractAddress);
    }

    function run() public {
        string memory seedPhrase = vm.readFile(".secret");
        uint256 privateKey = vm.deriveKey(seedPhrase, 0);
        vm.startBroadcast(privateKey);

        deployAptosRelay();

        vm.stopBroadcast();
    }
}