// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ChocoChocoGame} from "src/ChocoChocoGame.sol";

contract ChocoChocoGameTest is Test {
    ChocoChocoGame game;
    address treasury = address(uint160(0x1234000000000000000000000000000000000001));
    address alice = address(uint160(0x1234000000000000000000000000000000000002));
    address bob = address(uint160(0x1234000000000000000000000000000000000003));
    address carol = address(uint160(0x1234000000000000000000000000000000000004));

    uint96 constant STAKE = 0.01 ether;
    uint64 constant COMMIT = 1 hours;
    uint64 constant REVEAL = 1 hours;
    uint16 constant FEE_BPS = 300; // 3%

    function setUp() public {
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(treasury, 0);
        game = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS);
    }

    function _commit(address p, uint8 tribe, bytes32 salt) internal {
        bytes32 c = game.makeCommitment(tribe, salt);
        vm.prank(p);
        game.commitMeow{value: STAKE}(c);
    }

    function _reveal(address p, uint8 tribe, bytes32 salt) internal {
        vm.prank(p);
        game.revealMeow(tribe, salt);
    }

    function _warpToReveal() internal {
        uint256 roundId = game.currentRoundId();
        (, uint64 commitDeadline,, , , , , ,) = _roundData(roundId);
        vm.warp(commitDeadline + 1);
    }

    function _warpToAfterReveal() internal {
        uint256 roundId = game.currentRoundId();
        (, , uint64 revealDeadline,, , , , ,) = _roundData(roundId);
        vm.warp(revealDeadline + 1);
    }

    function _roundData(uint256 id) internal view returns (
        ChocoChocoGame.Status status,
        uint64 commitDl,
        uint64 revealDl,
        uint96 stake,
        uint16 fee,
        uint128 poolMilk,
        uint128 poolCacao,
        uint64 countMilk,
        uint64 countCacao
    ) {
        return game.rounds(id);
    }

    function testCommitRevealSettle_Payout_MilkMinority() public {
        // Alice (Milk), Bob & Carol (Cacao)
        bytes32 saltA = keccak256("saltA");
        bytes32 saltB = keccak256("saltB");
        bytes32 saltC = keccak256("saltC");

        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _commit(carol, uint8(ChocoChocoGame.Tribe.Cacao), saltC);

        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _reveal(carol, uint8(ChocoChocoGame.Tribe.Cacao), saltC);

        _warpToAfterReveal();
        vm.prank(alice);
        game.settleRound();

        // Alice should claim payout
        uint256 treasuryBefore = treasury.balance;
        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        game.claimTreat(1);

        // Fee = 3% of totalPool (3*stake) = 0.09 stake
        // Distributable = 2.91 stake. MinorityPool = 1*stake → payout = 2.91 stake
        assertEq(alice.balance, aliceBefore + (STAKE * 291 / 100));
        // Fee sent once at settle
        assertEq(treasury.balance, treasuryBefore + (STAKE * 9 / 100));
    }

    function testTieRefund() public {
        bytes32 saltA = keccak256("saltA");
        bytes32 saltB = keccak256("saltB");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);

        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);

        _warpToAfterReveal();
        game.settleRound();

        uint256 aBefore = alice.balance;
        uint256 bBefore = bob.balance;

        vm.prank(alice);
        game.claimTreat(1);
        vm.prank(bob);
        game.claimTreat(1);

        assertEq(alice.balance, aBefore + STAKE);
        assertEq(bob.balance, bBefore + STAKE);
    }

    function testNonRevealRefund_ForfeitOff() public {
        bytes32 saltA = keccak256("saltA");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);

        // Bob commits but never reveals
        bytes32 saltB = keccak256("saltB");
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);

        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);

        _warpToAfterReveal();
        game.settleRound();

        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        game.claimTreat(1);
        assertEq(bob.balance, bobBefore + STAKE);
    }

    function testDoubleCommitReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.expectRevert(ChocoChocoGame.AlreadyCommitted.selector);
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
    }

    function testBadRevealReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        _warpToReveal();
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.BadReveal.selector);
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), keccak256("wrong"));
    }

    function testClaimOnlyOnce() public {
        bytes32 saltA = keccak256("A");
        bytes32 saltB = keccak256("B");
        bytes32 saltC = keccak256("C");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _commit(carol, uint8(ChocoChocoGame.Tribe.Cacao), saltC);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _reveal(carol, uint8(ChocoChocoGame.Tribe.Cacao), saltC);
        _warpToAfterReveal();
        game.settleRound();
        vm.prank(alice);
        game.claimTreat(1);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.AlreadyClaimed.selector);
        game.claimTreat(1);
    }
}
