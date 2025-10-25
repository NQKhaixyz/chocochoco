// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ChocoChocoGame} from "src/ChocoChocoGame.sol";
import {Script} from "forge-std/Script.sol";

/// @notice Deployment script for ChocoChocoGame using Foundry.
/// @dev Expects constructor params via env vars:
///      TREASURY_ADDRESS, STAKE_WEI, COMMIT_SEC, REVEAL_SEC, FEE_BPS
///
/// Examples:
///  BASE Sepolia
///   forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
///     --chain base_sepolia --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify \
///     --etherscan-api-key $BASESCAN_API_KEY -vv
///
///  Polygon Amoy
///   forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
///     --chain polygon_amoy --rpc-url $POLYGON_AMOY_RPC --broadcast --verify \
///     --etherscan-api-key $POLYGONSCAN_API_KEY -vv
contract DeployChocoChocoGame is Script {
    function run() external returns (ChocoChocoGame deployed) {
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        uint96 stake = uint96(vm.envUint("STAKE_WEI"));
        uint64 commitDur = uint64(vm.envUint("COMMIT_SEC"));
        uint64 revealDur = uint64(vm.envUint("REVEAL_SEC"));
        uint16 feeBps = uint16(vm.envUint("FEE_BPS"));

        vm.startBroadcast();
        deployed = new ChocoChocoGame(treasury, stake, commitDur, revealDur, feeBps);
        vm.stopBroadcast();
    }
}
