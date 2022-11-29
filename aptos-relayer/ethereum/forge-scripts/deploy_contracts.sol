// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {IWormhole} from "../src/interfaces/IWormhole.sol";
import {AptosRelay} from "../src/aptos-relay/AptosRelay.sol";

import "forge-std/console.sol";

contract ContractScript is Script {
    IWormhole wormhole;
    address tokenBridgeAddress;
    AptosRelay aptosRelay;

    function setUp() public {
        wormhole = IWormhole(vm.envAddress("TESTING_WORMHOLE_ADDRESS"));
        tokenBridgeAddress = vm.envAddress("TESTING_TOKEN_BRIDGE_ADDRESS");
    }

    function deployAptosRelay() public {
        // deploy the HelloWorld contract
        aptosRelay = new AptosRelay(
            address(wormhole),
            wormhole.chainId()
        );
    }

    function run() public {
        // begin sending transactions
        vm.startBroadcast();

        // HelloWorld.sol
        deployAptosRelay();

        // finished
        vm.stopBroadcast();
    }
}