// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.17;

import "./AptosRelayState.sol";

contract AptosRelaySetters is AptosRelayState {
    function setOwner(address owner_) internal {
        _state.owner = owner_;
    }

    function setTokenBridgeAddress(address tokenBridgeAddress_) internal {
        _state.tokenBridgeAddress = tokenBridgeAddress_;
    }

    function setChainId(uint16 chainId_) internal {
        _state.chainId = chainId_;
    }

    function setTargetContractAddress(bytes32 targetContractAddress_) internal {
        _state.targetContractAddress = targetContractAddress_;
    }
}