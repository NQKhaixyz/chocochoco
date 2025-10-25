// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "forge-std/StdCheats.sol";
import {ChocoChocoGame} from "src/ChocoChocoGame.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract TestTokenInv is ERC20 {
    constructor() ERC20("TestTokenInv", "TSTI") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract NativeHandler is Test {
    ChocoChocoGame public game;
    address public treasury;
    uint96 public stake;
    uint8 public constant MILK = uint8(ChocoChocoGame.Tribe.Milk);
    uint8 public constant CACAO = uint8(ChocoChocoGame.Tribe.Cacao);

    address[] public actors;
    mapping(uint256 => mapping(address => bool)) public hasCommitted;
    mapping(uint256 => mapping(address => bool)) public hasRevealed;
    mapping(uint256 => uint256) public sumWinnerClaims;
    mapping(uint256 => uint256) public distributable;

    constructor(ChocoChocoGame _game, address _treasury, uint96 _stake) {
        game = _game;
        treasury = _treasury;
        stake = _stake;
        // create 8 actors
        for (uint256 i = 0; i < 8; i++) {
            actors.push(address(uint160(uint256(keccak256(abi.encodePacked("actor", i))))));
        }
    }

    function _salt(address a, uint256 rid) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, rid));
    }

    function _minority(uint256 id) internal view returns (uint8) {
        (, , , , , uint128 poolMilk, uint128 poolCacao, uint64 countMilk, uint64 countCacao, , ) = _roundData(id);
        if (countMilk == countCacao) return 0; // None
        return countMilk < countCacao ? MILK : CACAO;
    }

    function _roundData(uint256 id) internal view returns (
        ChocoChocoGame.Status status,
        uint64 commitDl,
        uint64 revealDl,
        uint96 rStake,
        uint16 feeBps,
        uint128 poolMilk,
        uint128 poolCacao,
        uint64 countMilk,
        uint64 countCacao,
        uint8 forfeitMode,
        uint16 forfeitBps
    ) {
        status = game.getRoundStatus(id);
        (commitDl, revealDl) = game.getRoundTimes(id);
        (rStake, feeBps, forfeitMode, forfeitBps, ) = game.getRoundConfig(id);
        (poolMilk, poolCacao, countMilk, countCacao) = game.getRoundPools(id);
    }

    function commit(uint256 actorIndex, uint8 tribe) external virtual {
        actorIndex = actorIndex % actors.length;
        tribe = tribe % 2 == 0 ? MILK : CACAO;
        address a = actors[actorIndex];
        uint256 rid = game.currentRoundId();
        if (hasCommitted[rid][a]) return;
        // fund and commit
        vm.deal(a, a.balance + stake);
        bytes32 c = game.makeCommitment(tribe, _salt(a, rid));
        vm.prank(a);
        try game.commitMeow{value: stake}(c) {
            hasCommitted[rid][a] = true;
        } catch {}
    }

    function reveal(uint256 actorIndex) external {
        actorIndex = actorIndex % actors.length;
        address a = actors[actorIndex];
        uint256 rid = game.currentRoundId();
        if (!hasCommitted[rid][a] || hasRevealed[rid][a]) return;
        // guess tribe both ways, try milk then cacao
        vm.prank(a);
        try game.revealMeow(MILK, _salt(a, rid)) {
            hasRevealed[rid][a] = true;
            return;
        } catch {}
        vm.prank(a);
        try game.revealMeow(CACAO, _salt(a, rid)) {
            hasRevealed[rid][a] = true;
        } catch {}
    }

    function warpToCommitEnd() external {
        uint256 rid = game.currentRoundId();
        (, uint64 commitDl, , , , , , , , ,) = _roundData(rid);
        if (block.timestamp <= commitDl) vm.warp(commitDl + 1);
    }

    function warpToRevealEnd() external {
        uint256 rid = game.currentRoundId();
        (, , uint64 revealDl, , , , , , , ,) = _roundData(rid);
        if (block.timestamp <= revealDl) vm.warp(revealDl + 1);
    }

    function settle() external {
        uint256 rid = game.currentRoundId();
        (ChocoChocoGame.Status status, , uint64 revealDl, , uint16 feeBps, uint128 poolMilk, uint128 poolCacao, , , , ) = _roundData(rid);
        if (block.timestamp <= revealDl) return;
        if (status == ChocoChocoGame.Status.Settled) return;
        game.settleRound();
        uint256 totalPool = uint256(poolMilk) + uint256(poolCacao);
        uint256 fee = (totalPool * feeBps) / 10_000;
        distributable[rid] = totalPool - fee;
    }

    function claim(uint256 actorIndex) external {
        actorIndex = actorIndex % actors.length;
        address a = actors[actorIndex];
        uint256 rid = game.currentRoundId();
        // try also previous round as it's settled
        if (rid > 0) {
            _claimRound(a, rid - 1);
        }
        _claimRound(a, rid);
    }

    function _claimRound(address a, uint256 rid) internal virtual {
        if (rid == 0) return;
        if (game.claimed(rid, a)) return;
        if (game.commitments(rid, a) == bytes32(0)) return;
    if (game.getRoundStatus(rid) != ChocoChocoGame.Status.Settled) return;
        // determine if winner
        uint8 tribe = uint8(game.revealed(rid, a));
        uint8 minority = _minority(rid);
        uint256 beforeBal = a.balance;
        vm.prank(a);
        try game.claimTreat(rid) {
            uint256 delta = a.balance - beforeBal;
            if (minority != 0 && tribe == minority) {
                sumWinnerClaims[rid] += delta;
            }
        } catch {}
    }
}

contract InvariantNative is StdInvariant, Test {
    ChocoChocoGame public game;
    NativeHandler public handler;
    address treasury;
    uint96 constant STAKE = 0.01 ether;
    uint64 constant COMMIT = 1 hours;
    uint64 constant REVEAL = 1 hours;
    uint16 constant FEE_BPS = 300;

    function setUp() public {
    treasury = address(uint160(uint256(keccak256("treasury_native"))));
        game = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, 0, 0);
        handler = new NativeHandler(game, treasury, STAKE);
        targetContract(address(handler));
    }

    function invariant_WinnerClaimsLTE_Distributable() public {
        uint256 curr = game.currentRoundId();
        // check previous settled round if any
        if (curr > 0) {
            uint256 rid = curr - 1;
            if (game.getRoundStatus(rid) == ChocoChocoGame.Status.Settled) {
                assertLe(handler.sumWinnerClaims(rid), handler.distributable(rid));
            }
        }
    }
}

contract TokenHandler is NativeHandler {
    ERC20 public token;
    constructor(ChocoChocoGame _game, address _treasury, uint96 _stake, ERC20 _token)
        NativeHandler(_game, _treasury, _stake)
    { token = _token; }

    function commit(uint256 actorIndex, uint8 tribe) external override {
        actorIndex = actorIndex % actors.length;
        tribe = tribe % 2 == 0 ? MILK : CACAO;
        address a = actors[actorIndex];
        uint256 rid = game.currentRoundId();
        if (hasCommitted[rid][a]) return;
        // mint & approve, then commit with ERC20
        TestTokenInv(address(token)).mint(a, stake);
        vm.prank(a); token.approve(address(game), type(uint256).max);
        bytes32 c = game.makeCommitment(tribe, _salt(a, rid));
        vm.prank(a);
        try game.commitMeow{value: 0}(c) {
            hasCommitted[rid][a] = true;
        } catch {}
    }

    function _claimRound(address a, uint256 rid) internal virtual override {
        if (rid == 0) return;
        if (game.claimed(rid, a)) return;
        if (game.commitments(rid, a) == bytes32(0)) return;
    if (game.getRoundStatus(rid) != ChocoChocoGame.Status.Settled) return;
        uint8 tribe = uint8(game.revealed(rid, a));
        uint8 minority = _minority(rid);
        uint256 beforeBal = token.balanceOf(a);
        vm.prank(a);
        try game.claimTreat(rid) {
            uint256 delta = token.balanceOf(a) - beforeBal;
            if (minority != 0 && tribe == minority) {
                sumWinnerClaims[rid] += delta;
            }
        } catch {}
    }
}

contract InvariantERC20 is StdInvariant, Test {
    ChocoChocoGame public game;
    TokenHandler public handler;
    TestTokenInv public token;
    address treasury;
    uint96 constant STAKE = 10_000; // use raw units for token to simplify minting
    uint64 constant COMMIT = 1 hours;
    uint64 constant REVEAL = 1 hours;
    uint16 constant FEE_BPS = 250; // 2.5%

    function setUp() public {
    treasury = address(uint160(uint256(keccak256("treasury_token"))));
        game = new ChocoChocoGame(treasury, STAKE, COMMIT, REVEAL, FEE_BPS, 0, 0);
        token = new TestTokenInv();
        // configure next round to use token and roll current immediately
        game.setParamsForNext(STAKE, COMMIT, REVEAL, FEE_BPS, 0, 0, address(token));
        // end current round with tie to advance
        bytes32 s1 = keccak256("inv1");
        bytes32 s2 = keccak256("inv2");
        address a1 = address(0x1001);
        address a2 = address(0x1002);
        vm.deal(a1, 1 ether);
        vm.deal(a2, 1 ether);
    bytes32 c1 = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Milk), s1);
    bytes32 c2 = game.makeCommitment(uint8(ChocoChocoGame.Tribe.Cacao), s2);
    vm.prank(a1); game.commitMeow{value: STAKE}(c1);
    vm.prank(a2); game.commitMeow{value: STAKE}(c2);
    (uint64 commitDl, ) = game.getRoundTimes(game.currentRoundId());
        vm.warp(commitDl + 1);
        vm.prank(a1); game.revealMeow(uint8(ChocoChocoGame.Tribe.Milk), s1);
        vm.prank(a2); game.revealMeow(uint8(ChocoChocoGame.Tribe.Cacao), s2);
    (, uint64 revealDl) = game.getRoundTimes(game.currentRoundId());
        vm.warp(revealDl + 1);
        game.settleRound();

        handler = new TokenHandler(game, treasury, STAKE, token);
        targetContract(address(handler));
    }

    function invariant_WinnerClaimsLTE_Distributable_Token() public {
        uint256 curr = game.currentRoundId();
        if (curr > 0) {
            uint256 rid = curr - 1;
            if (game.getRoundStatus(rid) == ChocoChocoGame.Status.Settled) {
                assertLe(handler.sumWinnerClaims(rid), handler.distributable(rid));
            }
        }
    }
}
