// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChocoChocoGame} from "src/ChocoChocoGame.sol";

/// @notice Minimal deployment script for Foundry users.
/// @dev forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame --rpc-url $BASE_SEPOLIA_RPC --broadcast
contract DeployChocoChocoGame {
    function run() external returns (ChocoChocoGame deployed) {
        deployed = new ChocoChocoGame();
    }
}
