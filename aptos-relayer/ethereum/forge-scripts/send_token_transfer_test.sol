// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {IWormhole} from "../src/interfaces/IWormhole.sol";
import {AptosRelay} from "../src/aptos-relay/AptosRelay.sol";
import {TestToken} from "../src/test-token/TestToken.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';


import "forge-std/console.sol";

contract ContractScript is Script {
    using SafeERC20 for IERC20;
    AptosRelay aptosRelay;
    address wrappedNativeAddress;
    bytes32 receiver;

    function setUp() public {
        aptosRelay = AptosRelay(vm.envAddress("RELAY_ADDRESS"));
        wrappedNativeAddress = vm.envAddress("TEST_WRAPPED_NATIVE_ADDRESS");
        receiver = vm.envBytes32("APTOS_RECEIVER");
        
        console.logBytes32(receiver);
    }

    function sendTransfer() public {
        uint256 value = 1e15;
        (bool success, ) = wrappedNativeAddress.call{value: value}(new bytes(0));
        require(success, "native_transfer_failed");
        IERC20(wrappedNativeAddress).safeApprove(
            address(aptosRelay),
            value
        );
        aptosRelay.transferTokens(
            wrappedNativeAddress,
            value,
            0,
            receiver,
            100,
            0
        );
        aptosRelay.transferETH{value:value}(
            0,
            receiver,
            100,
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