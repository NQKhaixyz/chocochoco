// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title ChocoChocoGame v1 (native) — Commit–Reveal Minority Game
/// @notice Core mechanics: commit, reveal, settle, claim. Fee to treasury. Tie refunds.
/// @dev v1: native token only; forfeit OFF (non-revealers can refund after settle).
contract ChocoChocoGame is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    enum Status {
        Created,
        CommitOpen,
        RevealOpen,
        Settled
    }

    enum Tribe {
        None,
        Milk,
        Cacao
    }

    enum ForfeitMode {
        NoneMode,
        Partial,
        Full
    }

    struct Round {
        Status status;
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint96 stake; // fixed per entry
        uint16 feeBps; // e.g., 300 = 3%
        uint128 poolMilk; // revealed stakes only
        uint128 poolCacao; // revealed stakes only
        uint64 countMilk; // revealed count
        uint64 countCacao; // revealed count
        uint8 forfeitMode; // 0=None,1=Partial,2=Full
        uint16 forfeitBps; // used when mode=Partial (0..10000)
        address stakeToken; // address(0) => native
    }

    address public immutable treasury;
    uint64 public commitDurDefault;
    uint64 public revealDurDefault;
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    // defaults for future rounds
    uint96 public defaultStake;
    uint16 public defaultFeeBps;
    uint8 public defaultForfeitMode; // 0=None,1=Partial,2=Full
    uint16 public defaultForfeitBps; // when Partial
    address public defaultStakeToken; // 0 => native, otherwise ERC20

    // per-round player data
    mapping(uint256 => mapping(address => bytes32)) public commitments;
    mapping(uint256 => mapping(address => Tribe)) public revealed;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event RoundCreated(uint256 id, uint96 stake, uint64 commitDeadline, uint64 revealDeadline, uint16 feeBps);
    event MeowCommitted(uint256 indexed id, address indexed player);
    event MeowRevealed(uint256 indexed id, address indexed player, Tribe tribe);
    event RoundMeowed(uint256 indexed id, Tribe minority);
    event TreatClaimed(uint256 indexed id, address indexed player, uint256 amount);

    error CommitClosed();
    error RevealClosed();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error AlreadyClaimed();
    error BadStake();
    error BadReveal();
    error NoCommit();
    error NotSettled();
    error NotWinner();
    error AlreadySettled();

    constructor(
        address _treasury,
        uint96 stake,
        uint64 commitDur,
        uint64 revealDur,
        uint16 feeBps,
        uint8 forfeitMode,
        uint16 forfeitBps
    ) Ownable(msg.sender) {
        require(_treasury != address(0), "treasury=0");
        require(stake > 0, "stake=0");
        require(commitDur > 0 && revealDur > 0, "dur=0");
        require(feeBps <= 2_000, "fee too high"); // safety cap: 20%
        require(forfeitMode <= uint8(ForfeitMode.Full), "bad forfeit mode");
        if (forfeitMode == uint8(ForfeitMode.Partial)) {
            require(forfeitBps <= 10_000, "forfeit bps");
        } else {
            // ignore bps for None/Full
            forfeitBps = 0;
        }
        treasury = _treasury;
        commitDurDefault = commitDur;
        revealDurDefault = revealDur;
        defaultStake = stake;
        defaultFeeBps = feeBps;
        defaultForfeitMode = forfeitMode;
        defaultForfeitBps = forfeitBps;
        defaultStakeToken = address(0);
        _createNewRound(stake, commitDurDefault, revealDurDefault, feeBps);
    }

    // helper: keccak(choice (1|2), salt)
    function makeCommitment(uint8 tribe, bytes32 salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(tribe, salt));
    }

    function commitMeow(bytes32 commitment) external payable whenNotPaused {
        Round storage r = rounds[currentRoundId];
        if (r.status != Status.CommitOpen || block.timestamp > r.commitDeadline) revert CommitClosed();
        if (r.stakeToken == address(0)) {
            if (msg.value != r.stake) revert BadStake();
        } else {
            if (msg.value != 0) revert BadStake();
            IERC20(r.stakeToken).safeTransferFrom(msg.sender, address(this), r.stake);
        }
        if (commitments[currentRoundId][msg.sender] != bytes32(0)) revert AlreadyCommitted();
        commitments[currentRoundId][msg.sender] = commitment;
        emit MeowCommitted(currentRoundId, msg.sender);
    }

    function revealMeow(uint8 tribeValue, bytes32 salt) external whenNotPaused {
        Round storage r = rounds[currentRoundId];
        if (r.status == Status.Settled) revert RevealClosed();
        if (!(block.timestamp > r.commitDeadline && block.timestamp <= r.revealDeadline)) revert RevealClosed();
        if (revealed[currentRoundId][msg.sender] != Tribe.None) revert AlreadyRevealed();

        bytes32 cHash = commitments[currentRoundId][msg.sender];
        if (cHash == bytes32(0)) revert NoCommit();
        if (keccak256(abi.encodePacked(tribeValue, salt)) != cHash) revert BadReveal();

        Tribe tribe = tribeValue == uint8(Tribe.Milk) ? Tribe.Milk : Tribe.Cacao;
        revealed[currentRoundId][msg.sender] = tribe;
        if (tribe == Tribe.Milk) {
            r.countMilk += 1;
            r.poolMilk += r.stake;
        } else {
            r.countCacao += 1;
            r.poolCacao += r.stake;
        }
        emit MeowRevealed(currentRoundId, msg.sender, tribe);
    }

    function settleRound() external nonReentrant {
        Round storage r = rounds[currentRoundId];
    if (block.timestamp <= r.revealDeadline) revert RevealClosed();
    if (r.status == Status.Settled) revert AlreadySettled();
        r.status = Status.Settled;

        Tribe minority = _minorityChoice(r);
        // transfer fee once on settle when there is a winner
        if (minority != Tribe.None) {
            uint256 totalPool = uint256(r.poolMilk) + uint256(r.poolCacao);
            uint256 fee = (totalPool * r.feeBps) / 10_000;
            if (fee > 0) {
                // send fee to treasury
                if (r.stakeToken == address(0)) {
                    (bool ok, ) = payable(treasury).call{value: fee}("");
                    require(ok, "treasury xfer fail");
                } else {
                    IERC20(r.stakeToken).safeTransfer(treasury, fee);
                }
            }
        }
        emit RoundMeowed(currentRoundId, minority);

        // open next round with default params (may be updated by admin)
        _createNewRound(defaultStake, commitDurDefault, revealDurDefault, defaultFeeBps);
    }

    function claimTreat(uint256 roundId) external nonReentrant {
        Round storage r = rounds[roundId];
        if (r.status != Status.Settled) revert NotSettled();
        if (claimed[roundId][msg.sender]) revert AlreadyClaimed();
        bytes32 cHash = commitments[roundId][msg.sender];
        if (cHash == bytes32(0)) revert NoCommit();

        Tribe userTribe = revealed[roundId][msg.sender];
        (Tribe minority, uint256 totalPool, uint256 minorityPool) = _settleData(r);

        uint256 amount;
        uint256 penalty;
        if (minority == Tribe.None) {
            // Tie: refund stake to anyone who committed
            if (userTribe == Tribe.None) {
                // apply forfeit on non-reveal if configured
                (amount, penalty) = _computeNoRevealRefund(r);
            } else {
                amount = r.stake;
            }
        } else if (userTribe == Tribe.None) {
            // Forfeit modes: apply penalty for non-revealers
            (amount, penalty) = _computeNoRevealRefund(r);
        } else if (userTribe == minority) {
            // Winner payout proportional to stake (stake is fixed, simplifies to distributable * stake / minorityPool)
            uint256 fee = (totalPool * r.feeBps) / 10_000;
            uint256 distributable = totalPool - fee; // fee was already transferred in settle
            amount = (distributable * r.stake) / minorityPool;
        } else {
            revert NotWinner();
        }

        claimed[roundId][msg.sender] = true;
        if (penalty > 0) {
            if (r.stakeToken == address(0)) {
                (bool okT, ) = payable(treasury).call{value: penalty}("");
                require(okT, "treasury xfer fail");
            } else {
                IERC20(r.stakeToken).safeTransfer(treasury, penalty);
            }
        }
        if (r.stakeToken == address(0)) {
            (bool ok, ) = payable(msg.sender).call{value: amount}("");
            require(ok, "payout xfer fail");
        } else {
            IERC20(r.stakeToken).safeTransfer(msg.sender, amount);
        }
        emit TreatClaimed(roundId, msg.sender, amount);
    }

    // -------------------------------- internal helpers --------------------------------

    function _createNewRound(uint96 stake, uint64 commitDur, uint64 revealDur, uint16 feeBps) internal {
        currentRoundId++;
        Round storage r = rounds[currentRoundId];
        r.status = Status.CommitOpen;
        r.commitDeadline = uint64(block.timestamp) + commitDur;
        r.revealDeadline = r.commitDeadline + revealDur;
        r.stake = stake;
        r.feeBps = feeBps;
        r.forfeitMode = defaultForfeitMode;
        r.forfeitBps = defaultForfeitBps;
        r.stakeToken = defaultStakeToken;
        emit RoundCreated(currentRoundId, stake, r.commitDeadline, r.revealDeadline, feeBps);
    }

    // ------------------------------ admin controls ------------------------------
    event NextParamsUpdated(uint96 stake, uint64 commitDur, uint64 revealDur, uint16 feeBps, uint8 forfeitMode, uint16 forfeitBps, address stakeToken);

    function setParamsForNext(
        uint96 stake,
        uint64 commitDur,
        uint64 revealDur,
        uint16 feeBps,
        uint8 forfeitMode,
        uint16 forfeitBps,
        address stakeToken
    ) external onlyOwner {
        require(stake > 0, "stake=0");
        require(commitDur > 0 && revealDur > 0, "dur=0");
        require(feeBps <= 2_000, "fee too high");
        require(forfeitMode <= uint8(ForfeitMode.Full), "bad forfeit mode");
        if (forfeitMode == uint8(ForfeitMode.Partial)) {
            require(forfeitBps <= 10_000, "forfeit bps");
        } else {
            forfeitBps = 0;
        }
        defaultStake = stake;
        commitDurDefault = commitDur;
        revealDurDefault = revealDur;
        defaultFeeBps = feeBps;
        defaultForfeitMode = forfeitMode;
        defaultForfeitBps = forfeitBps;
        defaultStakeToken = stakeToken;
        emit NextParamsUpdated(stake, commitDur, revealDur, feeBps, forfeitMode, forfeitBps, stakeToken);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Lightweight view for tests and offchain readers
    function getRoundMeta(uint256 id)
        external
        view
        returns (
            Status status,
            uint64 commitDl,
            uint64 revealDl,
            uint96 stake,
            uint16 fee,
            uint8 forfeitMode,
            uint16 forfeitBps,
            address stakeToken
        )
    {
        Round storage r = rounds[id];
        return (r.status, r.commitDeadline, r.revealDeadline, r.stake, r.feeBps, r.forfeitMode, r.forfeitBps, r.stakeToken);
    }

    function getRoundStatus(uint256 id) external view returns (Status) {
        return rounds[id].status;
    }

    function getRoundTimes(uint256 id) external view returns (uint64 commitDl, uint64 revealDl) {
        Round storage r = rounds[id];
        return (r.commitDeadline, r.revealDeadline);
    }

    function getRoundConfig(uint256 id)
        external
        view
        returns (uint96 stake, uint16 fee, uint8 forfeitMode, uint16 forfeitBps, address stakeToken)
    {
        Round storage r = rounds[id];
        return (r.stake, r.feeBps, r.forfeitMode, r.forfeitBps, r.stakeToken);
    }

    function getRoundPools(uint256 id)
        external
        view
        returns (uint128 poolMilk, uint128 poolCacao, uint64 countMilk, uint64 countCacao)
    {
        Round storage r = rounds[id];
        return (r.poolMilk, r.poolCacao, r.countMilk, r.countCacao);
    }

    function _minorityChoice(Round storage r) internal view returns (Tribe) {
        if (r.countMilk == r.countCacao) return Tribe.None; // tie
        return r.countMilk < r.countCacao ? Tribe.Milk : Tribe.Cacao;
    }

    function _settleData(Round storage r)
        internal
        view
        returns (Tribe minority, uint256 totalPool, uint256 minorityPool)
    {
        totalPool = uint256(r.poolMilk) + uint256(r.poolCacao);
        minority = _minorityChoice(r);
        if (minority == Tribe.Milk) {
            minorityPool = uint256(r.poolMilk);
        } else if (minority == Tribe.Cacao) {
            minorityPool = uint256(r.poolCacao);
        } else {
            minorityPool = 0;
        }
    }

    function _computeNoRevealRefund(Round storage r) internal view returns (uint256 amount, uint256 penalty) {
        if (r.forfeitMode == uint8(ForfeitMode.NoneMode)) {
            amount = r.stake;
            penalty = 0;
        } else if (r.forfeitMode == uint8(ForfeitMode.Partial)) {
            penalty = (uint256(r.stake) * uint256(r.forfeitBps)) / 10_000;
            amount = uint256(r.stake) - penalty;
        } else {
            // Full
            penalty = r.stake;
            amount = 0;
        }
    }

    // receive Ether from commits
    receive() external payable {}
}
