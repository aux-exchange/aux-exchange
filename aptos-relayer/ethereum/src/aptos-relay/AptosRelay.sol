// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.13;

import '../interfaces/ITokenBridge.sol';
import "./AptosRelayGetters.sol";

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract AptosRelay is AptosRelayGetters {
    using SafeERC20 for IERC20;

    constructor(
        address tokenBridgeAddress_,
        uint16 chainId_
    ) {
        setTokenBridgeAddress(tokenBridgeAddress_);
        setChainId(chainId_);
    }

    function transferTokens(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 relayerFee,
        bytes32 receiverAddress,
        uint256 maxSwapIn,
        uint64 nativeSwapAmount,
        uint32 nonce
    ) external {
        require(
            tokenAmount >= relayerFee + maxSwapIn,
            "insufficient tokenAmount to pay relayer and for swap"
        );
        require(
            isTokenRegistered(tokenAddress),
            "token is not registered"
        );

        (,bytes memory queriedDecimals) = tokenAddress.staticcall(abi.encodeWithSignature("decimals()"));
        uint8 decimals = abi.decode(queriedDecimals, (uint8));

        uint256 normalizedRelayerFee = normalizeAmount(relayerFee, decimals);
        uint256 normalizedMaxSwapIn = normalizeAmount(maxSwapIn, decimals);


        bytes memory payload = abi.encodePacked(
            normalizedRelayerFee,
            receiverAddress,
            normalizedMaxSwapIn,
            nativeSwapAmount
        );

        IERC20(tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenAmount
        );

        IERC20(tokenAddress).safeApprove(
            tokenBridgeAddress(),
            tokenAmount
        );

        TokenBridge(tokenBridgeAddress()).transferTokensWithPayload(
            tokenAddress,
            tokenAmount,
            chainId(),
            targetContractAddress(),
            nonce,
            payload
        );
    }

    function normalizeAmount(uint256 amount, uint8 decimals) internal pure returns(uint256){
        if (decimals > 8) {
            amount /= 10 ** (decimals - 8);
        }
        return amount;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "not owner");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        setOwner(newOwner);
    }

    function changeContractAddress(bytes32 newTargetContractAddress) external onlyOwner {
        setTargetContractAddress(newTargetContractAddress);
    }

    function registerToken(address tokenAddress) external onlyOwner {
        setTokenRegistry(tokenAddress, true);
    }

    function unregisterToken(address tokenAddress) external onlyOwner {
        setTokenRegistry(tokenAddress, false);
    }
}