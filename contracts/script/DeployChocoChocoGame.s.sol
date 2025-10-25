// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChocoChocoGame} from "src/ChocoChocoGame.sol";

/// @notice Minimal deployment script for Foundry users.
/// @dev Example:
/// forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame --rpc-url $BASE_SEPOLIA_RPC --broadcast
contract DeployChocoChocoGame {
    function run() external returns (ChocoChocoGame deployed) {
        address treasury = address(0x1234567890123456789012345678901234567890);
        uint96 stake = 0.01 ether;
        uint64 commitDur = 1 hours;
        uint64 revealDur = 1 hours;
        uint16 feeBps = 300; // 3%
        // v2 params: forfeit off by default
        uint8 forfeitMode = 0; // None
        uint16 forfeitBps = 0;
        deployed = new ChocoChocoGame(treasury, stake, commitDur, revealDur, feeBps, forfeitMode, forfeitBps);
    }
}
