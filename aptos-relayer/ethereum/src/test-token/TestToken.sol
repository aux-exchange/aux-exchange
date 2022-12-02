// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.13;
import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol';

contract TestToken is ERC20PresetFixedSupply {
    constructor () ERC20PresetFixedSupply("myTestToken", "TEST", 1e20, msg.sender) {
    }

     function decimals() public pure override returns (uint8) {
        return 18;
    }
}