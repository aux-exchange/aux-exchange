// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.17;
pragma abicoder v2;

interface TokenBridge {
  function transferTokensWithPayload(
      address token,
      uint256 amount,
      uint16 recipientChain,
      bytes32 recipient,
      uint32 nonce,
      bytes memory payload
    ) external payable returns (uint64);
    function transferTokens(
        address token,
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint256 arbiterFee,
        uint32 nonce
    ) external payable returns (uint64 sequence);
    function attestToken(
        address tokenAddress,
        uint32 nonce
    ) external payable returns (uint64 sequence);
}