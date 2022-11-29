// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.13;

import "./AptosRelaySetters.sol";

contract AptosRelayGetters is AptosRelaySetters {
    function owner() public view returns (address) {
        return _state.owner;
    }

    function tokenBridgeAddress() public view returns (address) {
        return _state.tokenBridgeAddress;
    }

    function chainId() public view returns (uint16) {
        return _state.chainId;
    }

    function targetContractAddress() public view returns (bytes32) {
        return _state.targetContractAddress;
    }

    function isTokenRegistered(address tokenAddress) public view returns (bool) {
        return _state.registeredTokens[tokenAddress];
    }
}