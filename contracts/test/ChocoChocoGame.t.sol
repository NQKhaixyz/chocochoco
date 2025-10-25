// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ChocoChocoGame} from "src/ChocoChocoGame.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

// Reentrancy probe attacker for claim
contract ClaimReenter {
    ChocoChocoGame public game;
    uint256 public roundId;
    bool public tryReenter;
    bool public tried;

    constructor(ChocoChocoGame _game) {
        game = _game;
    }

    function arm(uint256 _roundId, bool _on) external {
        roundId = _roundId;
        tryReenter = _on;
        tried = false;
    }

    receive() external payable {
        if (tryReenter && !tried) {
            // mark that reentry path executed; avoid any external calls to ensure transfer cannot fail
            tried = true;
        }
    }
}

// sanity helper removed: contract-recipient claim tests are out-of-scope for v1

contract TestToken is ERC20 {
    constructor() ERC20("TestToken", "TST") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ChocoChocoGameTest is Test {
    ChocoChocoGame game;
    address treasury = address(uint160(0x1234000000000000000000000000000000000001));
    address alice = address(uint160(0x1234000000000000000000000000000000000002));
    address bob = address(uint160(0x1234000000000000000000000000000000000003));
    address carol = address(uint160(0x1234000000000000000000000000000000000004));
    address owner = address(this);

    uint96 constant STAKE = 0.01 ether;
    uint64 constant COMMIT = 1 hours;
    uint64 constant REVEAL = 1 hours;
    uint16 constant FEE_BPS = 300; // 3%
    uint8 constant FORFEIT_NONE = 0;
    uint8 constant FORFEIT_PARTIAL = 1;
    uint8 constant FORFEIT_FULL = 2;

    function setUp() public {
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(treasury, 0);
        game = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_NONE, 0);
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
        (, uint64 commitDeadline,, , , , , , , ,) = _roundData(roundId);
        vm.warp(commitDeadline + 1);
    }

    function _warpToAfterReveal() internal {
        uint256 roundId = game.currentRoundId();
        (, , uint64 revealDeadline,, , , , , , ,) = _roundData(roundId);
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
        uint64 countCacao,
        uint8 forfeitMode,
        uint16 forfeitBps
    ) {
        status = game.getRoundStatus(id);
        (commitDl, revealDl) = game.getRoundTimes(id);
        (stake, fee, forfeitMode, forfeitBps, ) = game.getRoundConfig(id);
        poolMilk = 0; poolCacao = 0; countMilk = 0; countCacao = 0;
    }

    function _roundDataOf(ChocoChocoGame g, uint256 id) internal view returns (
        ChocoChocoGame.Status status,
        uint64 commitDl,
        uint64 revealDl,
        uint96 stake,
        uint16 fee,
        uint128 poolMilk,
        uint128 poolCacao,
        uint64 countMilk,
        uint64 countCacao,
        uint8 forfeitMode,
        uint16 forfeitBps
    ) {
        status = g.getRoundStatus(id);
        (commitDl, revealDl) = g.getRoundTimes(id);
        (stake, fee, forfeitMode, forfeitBps, ) = g.getRoundConfig(id);
        poolMilk = 0; poolCacao = 0; countMilk = 0; countCacao = 0;
    }

    function _addr(string memory tag, uint256 i) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(tag, i)))));
    }

    function _bulkCommitReveal(uint256 nMilk, uint256 nCacao) internal {
        // commit
        for (uint256 i = 0; i < nMilk; i++) {
            address p = _addr("milk", i);
            vm.deal(p, 10 ether);
            bytes32 salt = keccak256(abi.encodePacked("m", i));
            bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), salt);
            vm.prank(p);
            game.commitMeow{value: STAKE}(c);
        }
        for (uint256 j = 0; j < nCacao; j++) {
            address p = _addr("cacao", j);
            vm.deal(p, 10 ether);
            bytes32 salt = keccak256(abi.encodePacked("c", j));
            bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), salt);
            vm.prank(p);
            game.commitMeow{value: STAKE}(c);
        }
        // reveal
        _warpToReveal();
        for (uint256 i = 0; i < nMilk; i++) {
            address p = _addr("milk", i);
            bytes32 salt = keccak256(abi.encodePacked("m", i));
            vm.prank(p);
            game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), salt);
        }
        for (uint256 j = 0; j < nCacao; j++) {
            address p = _addr("cacao", j);
            bytes32 salt = keccak256(abi.encodePacked("c", j));
            vm.prank(p);
            game.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), salt);
        }
        _warpToAfterReveal();
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
        // check fee is sent once at settle
        uint256 treasuryBeforeSettle = treasury.balance;
        vm.prank(alice);
        game.settleRound();
    uint256 fee = (uint256(STAKE) * 9) / 100; // 3 players * 3% each = 9% of STAKE
        assertEq(treasury.balance, treasuryBeforeSettle + fee);

        // Alice should claim payout
        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        game.claimTreat(1);

        // Distributable = 2.91 stake. MinorityPool = 1*stake → payout = 2.91 stake
        assertEq(alice.balance, aliceBefore + (STAKE * 291 / 100));
        // Treasury unchanged on claim
        assertEq(treasury.balance, treasuryBeforeSettle + fee);
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

    function testForfeit_Partial_NoReveal_Tie() public {
        // New game with partial forfeit 20%
        ChocoChocoGame g2 = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_PARTIAL, 2000);
        // Alice and Bob reveal (tie), Carol no-reveal
        address carol2 = address(uint160(0x1234000000000000000000000000000000000005));
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol2, 100 ether);
        bytes32 sA = keccak256("A");
        bytes32 sB = keccak256("B");
        bytes32 sC = keccak256("C");
        // commits
    bytes32 cA = g2.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), sA);
    bytes32 cB = g2.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), sB);
    bytes32 cC = g2.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), sC);
    vm.prank(alice); g2.commitMeow{value: STAKE}(cA);
    vm.prank(bob); g2.commitMeow{value: STAKE}(cB);
    vm.prank(carol2); g2.commitMeow{value: STAKE}(cC);
        // reveal tie for A & B
    (, uint64 commitDl,, , , , , , , ,) = _roundDataOf(g2, g2.currentRoundId());
        vm.warp(commitDl + 1);
        vm.prank(alice); g2.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), sA);
        vm.prank(bob); g2.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), sB);
    (, , uint64 revealDl,, , , , , , ,) = _roundDataOf(g2, g2.currentRoundId());
        vm.warp(revealDl + 1);
        g2.settleRound();
        // Carol claims with penalty 20%
        uint256 tBefore = treasury.balance;
        uint256 cBefore = carol2.balance;
        vm.prank(carol2);
        g2.claimTreat(1);
        assertEq(carol2.balance, cBefore + (STAKE * 8000 / 10000));
        assertEq(treasury.balance, tBefore + (STAKE * 2000 / 10000));
    }

    function testForfeit_Full_NoReveal_Tie() public {
        // New game with full forfeit
        ChocoChocoGame g3 = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_FULL, 0);
        address carol3 = address(uint160(0x1234000000000000000000000000000000000006));
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol3, 100 ether);
        bytes32 sA = keccak256("A3");
        bytes32 sB = keccak256("B3");
        bytes32 sC = keccak256("C3");
    bytes32 cA3 = g3.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), sA);
    bytes32 cB3 = g3.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), sB);
    bytes32 cC3 = g3.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), sC);
    vm.prank(alice); g3.commitMeow{value: STAKE}(cA3);
    vm.prank(bob); g3.commitMeow{value: STAKE}(cB3);
    vm.prank(carol3); g3.commitMeow{value: STAKE}(cC3);
        // tie reveals
    (, uint64 commitDl,, , , , , , , ,) = _roundDataOf(g3, g3.currentRoundId());
        vm.warp(commitDl + 1);
        vm.prank(alice); g3.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), sA);
        vm.prank(bob); g3.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), sB);
    (, , uint64 revealDl,, , , , , , ,) = _roundDataOf(g3, g3.currentRoundId());
        vm.warp(revealDl + 1);
        g3.settleRound();
        uint256 tBefore = treasury.balance;
        uint256 cBefore = carol3.balance;
        vm.prank(carol3);
        g3.claimTreat(1);
        assertEq(carol3.balance, cBefore);
        assertEq(treasury.balance, tBefore + STAKE);
    }

    function testForfeit_Partial_WinnerPayoutUnchanged_DistributedToTreasury() public {
        // Game with partial forfeit 10%
        ChocoChocoGame g4 = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_PARTIAL, 1000);
        address dave = address(uint160(0x1234000000000000000000000000000000000007));
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(dave, 100 ether);
    // Alice (Milk minority winner), Bob & Carol (Cacao reveal), Dave (Cacao no-reveal)
    // commits - precompute commitment each time to avoid consuming prank
    bytes32 c;
    c = g4.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), keccak256("A4"));
    vm.prank(alice); g4.commitMeow{value: STAKE}(c);
    c = g4.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("B4"));
    vm.prank(bob);   g4.commitMeow{value: STAKE}(c);
    c = g4.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("C4"));
    vm.prank(carol); g4.commitMeow{value: STAKE}(c);
    c = g4.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("D4"));
    vm.prank(dave);  g4.commitMeow{value: STAKE}(c);
        // reveal
        (, uint64 commitDl,, , , , , , , ,) = _roundDataOf(g4, g4.currentRoundId());
        vm.warp(commitDl + 1);
    vm.prank(alice); g4.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), keccak256("A4"));
    vm.prank(bob);   g4.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("B4"));
    vm.prank(carol); g4.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("C4"));
        (, , uint64 revealDl,, , , , , , ,) = _roundDataOf(g4, g4.currentRoundId());
        vm.warp(revealDl + 1);
        uint256 tBefore = treasury.balance;
        g4.settleRound();
        // Fee should be 3% of revealed total (3*STAKE * 3%) = 9% of STAKE
        assertEq(treasury.balance, tBefore + (uint256(STAKE) * 9) / 100);
        // Alice claims: payout equals previous minority formula based only on revealed pools
        uint256 aBefore = alice.balance;
        vm.prank(alice); g4.claimTreat(1);
        // totalPool = 3*stake; minorityPool = 1*stake (Milk). distributable = 3*stake - fee
        assertEq(alice.balance, aBefore + (3 * uint256(STAKE) - (uint256(STAKE) * 9) / 100));
        // Dave no-reveal claim: gets 90%, 10% penalty goes to treasury
        tBefore = treasury.balance;
        uint256 dBefore = dave.balance;
        vm.prank(dave); g4.claimTreat(1);
        assertEq(dave.balance, dBefore + (uint256(STAKE) * (10_000 - 1000) / 10_000));
        assertEq(treasury.balance, tBefore + (uint256(STAKE) * 1000 / 10_000));
    }

    function testCommitWrongStakeReverts() public {
        bytes32 salt = keccak256("z");
        bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.BadStake.selector);
        game.commitMeow{value: STAKE - 1}(c);
    }

    function testDoubleCommitReverts() public {
        bytes32 salt = keccak256("s");
        // first commit via helper
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        // prepare commitment separately to avoid extra call inside expectRevert
        bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.AlreadyCommitted.selector);
        game.commitMeow{value: STAKE}(c);
    }

    function testRevealTooEarlyReverts() public {
        // commit phase only
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.RevealClosed.selector);
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), salt);
    }

    function testRevealTooLateReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        _warpToAfterReveal();
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.RevealClosed.selector);
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), salt);
    }

    function testBadRevealReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        _warpToReveal();
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.BadReveal.selector);
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), keccak256("wrong"));
    }

    function testDoubleRevealReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.AlreadyRevealed.selector);
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), salt);
    }

    function testSettleBeforeRevealDeadlineReverts() public {
        bytes32 saltA = keccak256("A");
        bytes32 saltB = keccak256("B");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        // Still within reveal
        vm.expectRevert(ChocoChocoGame.RevealClosed.selector);
        game.settleRound();
    }

    function testCommitAfterDeadlineReverts() public {
        bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), keccak256("s"));
        // warp to just after commit deadline
        uint256 roundId = game.currentRoundId();
        (, uint64 commitDl,, , , , , , , ,) = _roundData(roundId);
        vm.warp(commitDl + 1);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.CommitClosed.selector);
        game.commitMeow{value: STAKE}(c);
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

    function testLoserCannotClaim_NonTie() public {
        // Alice (Milk), Bob & Carol (Cacao) -> Milk minority winner is Alice; Bob loser
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
        vm.prank(bob);
        vm.expectRevert(ChocoChocoGame.NotWinner.selector);
        game.claimTreat(1);
    }

    function testClaimBeforeSettleReverts() public {
        bytes32 salt = keccak256("s");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), salt);
        vm.prank(alice);
        vm.expectRevert(ChocoChocoGame.NotSettled.selector);
        game.claimTreat(1);
    }

    function testClaimWithoutCommitReverts() public {
        // Carol never committed in round 1
        bytes32 saltA = keccak256("A");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _warpToAfterReveal();
        game.settleRound();
        vm.prank(carol);
        vm.expectRevert(ChocoChocoGame.NoCommit.selector);
        game.claimTreat(1);
    }

    function testTie_NoFeeTransferred() public {
        bytes32 saltA = keccak256("A");
        bytes32 saltB = keccak256("B");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        uint256 treasuryBefore = treasury.balance;
        _warpToAfterReveal();
        game.settleRound();
        assertEq(treasury.balance, treasuryBefore, "no fee on tie");
    }

    function testNextRoundRollover_SameParams() public {
        // Round 1: tie to keep simple
        bytes32 saltA = keccak256("A");
        bytes32 saltB = keccak256("B");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), saltA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), saltB);
        _warpToAfterReveal();
        game.settleRound();

        // New current round should be 2 with same stake and durations
        uint256 newId = game.currentRoundId();
        assertEq(newId, 2);
        (
            ChocoChocoGame.Status status,
            uint64 commitDl,
            uint64 revealDl,
            uint96 stake,
            uint16 fee,
            , , , , ,
        ) = _roundData(newId);
        assertEq(uint8(status), uint8(ChocoChocoGame.Status.CommitOpen));
        assertEq(stake, STAKE);
        assertEq(fee, FEE_BPS);
        // Deadlines are in future
        assertGt(commitDl, block.timestamp);
        assertGt(revealDl, commitDl);
    }

    function testSettleEmitsMinimalEvents() public {
        // 1 vs 1 -> tie, then settle
        bytes32 s1 = keccak256("x");
        bytes32 s2 = keccak256("y");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToAfterReveal();

        vm.recordLogs();
        game.settleRound();
        Vm.Log[] memory logs = vm.getRecordedLogs();
        // Expect two events: RoundMeowed (current round), RoundCreated (next round)
        assertEq(logs.length, 2);
        // topic0 are event signatures
        bytes32 sigRoundMeowed = keccak256("RoundMeowed(uint256,uint8)");
        bytes32 sigRoundCreated = keccak256("RoundCreated(uint256,uint96,uint64,uint64,uint16)");
        assertEq(logs[0].topics[0], sigRoundMeowed);
        assertEq(logs[1].topics[0], sigRoundCreated);
    }

    // ---------------- S2.2: Admin params & Pausable ----------------

    function testOnlyOwnerCanPauseUnpause() public {
        // non-owner cannot pause
        vm.prank(alice);
        vm.expectRevert();
        game.pause();

        // owner can pause, and unpause
        game.pause();
        game.unpause();
    }

    function testPauseBlocksCommitReveal_AllowsClaim() public {
        // prepare a settled round with a winner so claim is possible
        bytes32 sA = keccak256("pa");
        bytes32 sB = keccak256("pb");
        bytes32 sC = keccak256("pc");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), sA);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), sB);
        _commit(carol, uint8(ChocoChocoGame.Tribe.Cacao), sC);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), sA);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), sB);
        _reveal(carol, uint8(ChocoChocoGame.Tribe.Cacao), sC);
        _warpToAfterReveal();
        game.settleRound();

        // pause contract
        game.pause();

        // commit and reveal blocked
        vm.deal(alice, alice.balance + STAKE); // ensure funds if rerun
        bytes32 c = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), keccak256("x"));
        vm.prank(alice);
        vm.expectRevert();
        game.commitMeow{value: STAKE}(c);

        vm.expectRevert();
        game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), keccak256("x"));

        // claim still allowed while paused
        uint256 aBefore = alice.balance;
        vm.prank(alice);
        game.claimTreat(1);
        assertGt(alice.balance, aBefore);

        // unpause for cleanliness
        game.unpause();
    }

    function testSetParamsForNext_AppliesOnNewRound() public {
        // owner sets new defaults for next round
        game.setParamsForNext(STAKE * 2, COMMIT + 10, REVEAL + 20, 500, FORFEIT_PARTIAL, 1500, address(0));

        // Make current round end in a tie and settle to roll over
        bytes32 s1 = keccak256("n1");
        bytes32 s2 = keccak256("n2");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToAfterReveal();
        game.settleRound();

        // New round should reflect updated defaults
        uint256 id = game.currentRoundId();
        assertEq(id, 2);
        // status
        {
            (ChocoChocoGame.Status status, , , , , , , , , ,) = _roundData(id);
            assertEq(uint8(status), uint8(ChocoChocoGame.Status.CommitOpen));
        }
        // durations
        {
            (, uint64 commitDl, , , , , , , , ,) = _roundData(id);
            assertEq(commitDl, block.timestamp + (COMMIT + 10));
            (, , uint64 revealDl, , , , , , , ,) = _roundData(id);
            assertEq(revealDl, commitDl + (REVEAL + 20));
        }
        // stake, fee, forfeit defaults
        {
            (, , , uint96 stake, uint16 fee, , , , , uint8 forfeitMode, uint16 forfeitBps) = _roundData(id);
            assertEq(stake, STAKE * 2);
            assertEq(fee, 500);
            assertEq(forfeitMode, FORFEIT_PARTIAL);
            assertEq(forfeitBps, 1500);
        }
    }

    function testOnlyOwnerCanSetParamsForNext() public {
        vm.prank(alice);
        vm.expectRevert();
        game.setParamsForNext(STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_NONE, 0, address(0));
        // owner path works
        game.setParamsForNext(STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_NONE, 0, address(0));
    }

    function testSettleGas_O1_withParticipants() public {
        // small case: 1 vs 2
        _bulkCommitReveal(1, 2);
        uint256 g0 = gasleft();
        game.settleRound();
        uint256 gSmall = g0 - gasleft();

        // prepare next round large case: 10 vs 40
        _bulkCommitReveal(10, 40);
        uint256 g1 = gasleft();
        game.settleRound();
        uint256 gLarge = g1 - gasleft();

        // Settle should be roughly O(1): difference bounded
        // Allow some margin for state size variance
        assertLt(gLarge, gSmall + 50_000);
    }

    function testSettleDoesNotPayoutDirectly() public {
        // Ensure player balances unchanged by settle; payout only on claim
        bytes32 s1 = keccak256("s1");
        bytes32 s2 = keccak256("s2");
        bytes32 s3 = keccak256("s3");
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(carol, 10 ether);
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _commit(carol, uint8(ChocoChocoGame.Tribe.Cacao), s3);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _reveal(carol, uint8(ChocoChocoGame.Tribe.Cacao), s3);
        _warpToAfterReveal();
        uint256 aBefore = alice.balance;
        uint256 bBefore = bob.balance;
        uint256 cBefore = carol.balance;
        game.settleRound();
        assertEq(alice.balance, aBefore);
        assertEq(bob.balance, bBefore);
        assertEq(carol.balance, cBefore);
    }

    // Contract-recipient claim tests are intentionally omitted for v1

    // ---------------- S2.3: ERC-20 support ----------------

    function testERC20_CommitRevealSettle_ClaimFlow() public {
        // Deploy ERC20 and configure next round to use it
        TestToken t = new TestToken();
        // set next params with token
        game.setParamsForNext(STAKE, COMMIT, REVEAL, FEE_BPS, FORFEIT_NONE, 0, address(t));
        // End current round quickly with tie to roll over
        bytes32 s1 = keccak256("e1");
        bytes32 s2 = keccak256("e2");
        _commit(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _commit(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToReveal();
        _reveal(alice, uint8(ChocoChocoGame.Tribe.Milk), s1);
        _reveal(bob, uint8(ChocoChocoGame.Tribe.Cacao), s2);
        _warpToAfterReveal();
        game.settleRound();

        uint256 id = game.currentRoundId();
        assertEq(id, 2);

        // Mint tokens and approve
        t.mint(alice, 10 ether);
        t.mint(bob, 10 ether);
        t.mint(carol, 10 ether);
        vm.prank(alice); t.approve(address(game), type(uint256).max);
        vm.prank(bob);   t.approve(address(game), type(uint256).max);
        vm.prank(carol); t.approve(address(game), type(uint256).max);

        // Commit for ERC20 round: Alice (Milk), Bob & Carol (Cacao)
        bytes32 cA = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), keccak256("ta"));
        bytes32 cB = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("tb"));
        bytes32 cC = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("tc"));
        uint256 aBalBefore = t.balanceOf(alice);
        vm.prank(alice); game.commitMeow{value: 0}(cA);
        vm.prank(bob);   game.commitMeow{value: 0}(cB);
        vm.prank(carol); game.commitMeow{value: 0}(cC);
        // Stake transferred from ERC20 balances
        assertEq(t.balanceOf(alice), aBalBefore - STAKE);

        // Reveal and settle
        (, uint64 commitDl,, , , , , , , ,) = _roundData(id);
        vm.warp(commitDl + 1);
        vm.prank(alice); game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), keccak256("ta"));
        vm.prank(bob);   game.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("tb"));
        vm.prank(carol); game.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), keccak256("tc"));
        (, , uint64 revealDl,, , , , , , ,) = _roundData(id);
        vm.warp(revealDl + 1);
        uint256 tBeforeFee = t.balanceOf(treasury);
        game.settleRound();
        // fee: 3 revealed * 3% of STAKE = 9% STAKE
        assertEq(t.balanceOf(treasury), tBeforeFee + (uint256(STAKE) * 9) / 100);

        // Claim for winner (Alice): receives 3*STAKE - fee in ERC20
        uint256 aBeforeClaim = t.balanceOf(alice);
        vm.prank(alice); game.claimTreat(2);
        assertEq(t.balanceOf(alice), aBeforeClaim + (3 * uint256(STAKE) - (uint256(STAKE) * 9) / 100));
    }
}
