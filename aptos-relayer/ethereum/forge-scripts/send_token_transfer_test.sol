// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {IWormhole} from "../src/interfaces/IWormhole.sol";
import {AptosRelay} from "../src/aptos-relay/AptosRelay.sol";
import {TestToken} from "../src/test-token/TestToken.sol";

import "forge-std/console.sol";

contract ContractScript is Script {
    AptosRelay aptosRelay;
    TestToken testToken;
    bytes32 receiver;

    function setUp() public {
        aptosRelay = AptosRelay(vm.envAddress("RELAY_ADDRESS"));
        testToken = TestToken(vm.envAddress("TEST_TOKEN_ADDRESS"));
        receiver = vm.envBytes32("APTOS_RECEIVER");
    }

    function sendTransfer() public {
        testToken.approve(
            address(aptosRelay),
            type(uint256).max
        );
        aptosRelay.transferTokens(
            address(testToken),
            1e18,
            1e16,
            receiver,
            1e4,
            0
        );
    }

    function run() public {
        string memory seedPhrase = vm.readFile(".secret");
        uint256 privateKey = vm.deriveKey(seedPhrase, 0);
        vm.startBroadcast(privateKey);

        sendTransfer();

        vm.stopBroadcast();
    }
}