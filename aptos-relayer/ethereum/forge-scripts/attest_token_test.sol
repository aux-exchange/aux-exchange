// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {TokenBridge} from "../src/interfaces/ITokenBridge.sol";
import {IWormhole} from "../src/interfaces/IWormhole.sol";
import {AptosRelay} from "../src/aptos-relay/AptosRelay.sol";
import {TestToken} from "../src/test-token/TestToken.sol";

import "forge-std/console.sol";

contract ContractScript is Script {
    TokenBridge tokenBridge;
    TestToken testToken;

    function setUp() public {
        tokenBridge = TokenBridge(vm.envAddress("TEST_TOKEN_BRIDGE_ADDRESS"));
        testToken = TestToken(vm.envAddress("TEST_TOKEN_ADDRESS"));
    }

    function sendAttestMeta() public {
        tokenBridge.attestToken(address(testToken), 0);
    }

    function run() public {
        string memory seedPhrase = vm.readFile(".secret");
        uint256 privateKey = vm.deriveKey(seedPhrase, 0);
        vm.startBroadcast(privateKey);

        sendAttestMeta();

        vm.stopBroadcast();
    }
}