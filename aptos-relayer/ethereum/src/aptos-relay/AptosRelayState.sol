// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.17;

contract AptosRelayStorage {
    struct State {
        // owner of this contract
        address owner;

        // address of the wormhole token bridge
        address tokenBridgeAddress;

        // chain id of Aptos
        uint16 chainId;

        // target Aptos contract address
        bytes32 targetContractAddress;

        // Returns true, if a registered token type for relaying
        mapping(address => bool) registeredTokens;
    }
}

contract AptosRelayState {
    AptosRelayStorage.State _state;
}