// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChocoChocoGame v1 (native) — Commit–Reveal Minority Game
/// @notice Core mechanics: commit, reveal, settle, claim. Fee to treasury. Tie refunds.
/// @dev v1: native token only; forfeit OFF (non-revealers can refund after settle).
contract ChocoChocoGame {
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
    }

    address public immutable treasury;
    uint64 public immutable commitDurDefault;
    uint64 public immutable revealDurDefault;
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;

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

    constructor(
        address _treasury,
        uint96 stake,
        uint64 commitDur,
        uint64 revealDur,
        uint16 feeBps
    ) {
        require(_treasury != address(0), "treasury=0");
        require(stake > 0, "stake=0");
        require(commitDur > 0 && revealDur > 0, "dur=0");
        require(feeBps <= 2_000, "fee too high"); // safety cap: 20%
    treasury = _treasury;
    commitDurDefault = commitDur;
    revealDurDefault = revealDur;
    _createNewRound(stake, commitDurDefault, revealDurDefault, feeBps);
    }

    // helper: keccak(choice (1|2), salt)
    function makeCommitment(uint8 tribe, bytes32 salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(tribe, salt));
    }

    function commitMeow(bytes32 commitment) external payable {
        Round storage r = rounds[currentRoundId];
        if (r.status != Status.CommitOpen || block.timestamp > r.commitDeadline) revert CommitClosed();
        if (msg.value != r.stake) revert BadStake();
        if (commitments[currentRoundId][msg.sender] != bytes32(0)) revert AlreadyCommitted();
        commitments[currentRoundId][msg.sender] = commitment;
        emit MeowCommitted(currentRoundId, msg.sender);
    }

    function revealMeow(uint8 tribeValue, bytes32 salt) external {
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

    function settleRound() external {
        Round storage r = rounds[currentRoundId];
        if (block.timestamp <= r.revealDeadline) revert RevealClosed();
        if (r.status == Status.Settled) revert AlreadyClaimed(); // reuse as "already settled"
        r.status = Status.Settled;

        Tribe minority = _minorityChoice(r);
        // transfer fee once on settle when there is a winner
        if (minority != Tribe.None) {
            uint256 totalPool = uint256(r.poolMilk) + uint256(r.poolCacao);
            uint256 fee = (totalPool * r.feeBps) / 10_000;
            if (fee > 0) {
                // send fee to treasury
                (bool ok, ) = payable(treasury).call{value: fee}("");
                require(ok, "treasury xfer fail");
            }
        }
        emit RoundMeowed(currentRoundId, minority);

    // open next round with same params
    _createNewRound(r.stake, commitDurDefault, revealDurDefault, r.feeBps);
    }

    function claimTreat(uint256 roundId) external {
        Round storage r = rounds[roundId];
        if (r.status != Status.Settled) revert NotSettled();
        if (claimed[roundId][msg.sender]) revert AlreadyClaimed();
        bytes32 cHash = commitments[roundId][msg.sender];
        if (cHash == bytes32(0)) revert NoCommit();

        Tribe userTribe = revealed[roundId][msg.sender];
        (Tribe minority, uint256 totalPool, uint256 minorityPool) = _settleData(r);

        uint256 amount;
        if (minority == Tribe.None) {
            // Tie: refund stake to anyone who committed
            amount = r.stake;
        } else if (userTribe == Tribe.None) {
            // Forfeit OFF v1: non-revealers can refund their stake
            amount = r.stake;
        } else if (userTribe == minority) {
            // Winner payout proportional to stake (stake is fixed, simplifies to distributable * stake / minorityPool)
            uint256 fee = (totalPool * r.feeBps) / 10_000;
            uint256 distributable = totalPool - fee; // fee was already transferred in settle
            amount = (distributable * r.stake) / minorityPool;
        } else {
            revert NotWinner();
        }

        claimed[roundId][msg.sender] = true;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "payout xfer fail");
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
        emit RoundCreated(currentRoundId, stake, r.commitDeadline, r.revealDeadline, feeBps);
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

    // receive Ether from commits
    receive() external payable {}
}
