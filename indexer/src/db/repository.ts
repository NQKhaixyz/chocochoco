import { getPool } from './pool.js';
import {
  Round,
  PlayerRound,
  Claim,
  TreasuryFee,
  IndexerState,
  LeaderboardEntry,
  WeeklyWinRateEntry,
  RoundWithStats,
  Tribe,
} from '../types.js';

// ================================
// ROUNDS REPOSITORY
// ================================

export const upsertRound = async (round: Omit<Round, 'createdAt'> & { createdAt: number }): Promise<void> => {
  const query = `
    INSERT INTO rounds (
      id, round_number, commit_end, reveal_end, stake_lamports,
      milk_count, cacao_count, milk_pool, cacao_pool, winner_side,
      settled, created_at, slot, tx_sig, block_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12), $13, $14, $15)
    ON CONFLICT (id) DO UPDATE SET
      milk_count = EXCLUDED.milk_count,
      cacao_count = EXCLUDED.cacao_count,
      milk_pool = EXCLUDED.milk_pool,
      cacao_pool = EXCLUDED.cacao_pool,
      winner_side = EXCLUDED.winner_side,
      settled = EXCLUDED.settled
  `;

  const values = [
    round.id,
    round.roundNumber.toString(),
    round.commitEnd.toString(),
    round.revealEnd.toString(),
    round.stakeLamports.toString(),
    round.milkCount,
    round.cacaoCount,
    round.milkPool.toString(),
    round.cacaoPool.toString(),
    round.winnerSide,
    round.settled,
    round.createdAt,
    round.slot.toString(),
    round.txSig,
    round.blockTime.toString(),
  ];

  await getPool().query(query, values);
};

export const getRoundById = async (id: string): Promise<RoundWithStats | null> => {
  const query = `
    SELECT 
      r.*,
      COUNT(pr.id) as total_players,
      COUNT(pr.id) FILTER (WHERE pr.revealed = TRUE) as revealed_players,
      (r.milk_pool + r.cacao_pool) as total_pool
    FROM rounds r
    LEFT JOIN player_rounds pr ON pr.round_id = r.id
    WHERE r.id = $1
    GROUP BY r.id
  `;

  const result = await getPool().query(query, [id]);
  
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    roundNumber: BigInt(row.round_number),
    commitEnd: BigInt(row.commit_end),
    revealEnd: BigInt(row.reveal_end),
    stakeLamports: BigInt(row.stake_lamports),
    milkCount: row.milk_count,
    cacaoCount: row.cacao_count,
    milkPool: BigInt(row.milk_pool),
    cacaoPool: BigInt(row.cacao_pool),
    winnerSide: row.winner_side,
    settled: row.settled,
    createdAt: row.created_at,
    slot: BigInt(row.slot),
    txSig: row.tx_sig,
    blockTime: BigInt(row.block_time),
    totalPlayers: parseInt(row.total_players),
    revealedPlayers: parseInt(row.revealed_players),
    totalPool: row.total_pool.toString(),
  };
};

export const getRecentRounds = async (limit: number = 50): Promise<Round[]> => {
  const query = `
    SELECT * FROM rounds
    ORDER BY created_at DESC
    LIMIT $1
  `;

  const result = await getPool().query(query, [limit]);
  
  return result.rows.map((row) => ({
    id: row.id,
    roundNumber: BigInt(row.round_number),
    commitEnd: BigInt(row.commit_end),
    revealEnd: BigInt(row.reveal_end),
    stakeLamports: BigInt(row.stake_lamports),
    milkCount: row.milk_count,
    cacaoCount: row.cacao_count,
    milkPool: BigInt(row.milk_pool),
    cacaoPool: BigInt(row.cacao_pool),
    winnerSide: row.winner_side,
    settled: row.settled,
    createdAt: row.created_at,
    slot: BigInt(row.slot),
    txSig: row.tx_sig,
    blockTime: BigInt(row.block_time),
  }));
};

// ================================
// PLAYER_ROUNDS REPOSITORY
// ================================

export const upsertPlayerRound = async (
  pr: Omit<PlayerRound, 'createdAt' | 'revealedAt'> & { createdAt: number; revealedAt?: number }
): Promise<void> => {
  const query = `
    INSERT INTO player_rounds (
      id, round_id, player, side, commitment, stake_lamports,
      revealed, claimed, created_at, revealed_at, slot, tx_sig, block_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9), $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      side = EXCLUDED.side,
      revealed = EXCLUDED.revealed,
      claimed = EXCLUDED.claimed,
      revealed_at = EXCLUDED.revealed_at
  `;

  const values = [
    pr.id,
    pr.roundId,
    pr.player,
    pr.side,
    pr.commitment,
    pr.stakeLamports.toString(),
    pr.revealed,
    pr.claimed,
    pr.createdAt,
    pr.revealedAt ? `to_timestamp(${pr.revealedAt})` : null,
    pr.slot.toString(),
    pr.txSig,
    pr.blockTime.toString(),
  ];

  await getPool().query(query, values);
};

export const getPlayerRounds = async (player: string, limit: number = 50): Promise<PlayerRound[]> => {
  const query = `
    SELECT * FROM player_rounds
    WHERE player = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const result = await getPool().query(query, [player, limit]);
  
  return result.rows.map((row) => ({
    id: row.id,
    roundId: row.round_id,
    player: row.player,
    side: row.side as Tribe | null,
    commitment: row.commitment,
    stakeLamports: BigInt(row.stake_lamports),
    revealed: row.revealed,
    claimed: row.claimed,
    createdAt: row.created_at,
    revealedAt: row.revealed_at,
    slot: BigInt(row.slot),
    txSig: row.tx_sig,
    blockTime: BigInt(row.block_time),
  }));
};

// ================================
// CLAIMS REPOSITORY
// ================================

export const upsertClaim = async (
  claim: Omit<Claim, 'claimedAt'> & { claimedAt: number }
): Promise<void> => {
  const query = `
    INSERT INTO claims (
      id, round_id, player, amount_lamports, claimed_at,
      slot, tx_sig, log_index, block_time
    ) VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9)
    ON CONFLICT (tx_sig, log_index) DO NOTHING
  `;

  const values = [
    claim.id,
    claim.roundId,
    claim.player,
    claim.amountLamports.toString(),
    claim.claimedAt,
    claim.slot.toString(),
    claim.txSig,
    claim.logIndex,
    claim.blockTime.toString(),
  ];

  await getPool().query(query, values);
};

// ================================
// TREASURY_FEES REPOSITORY
// ================================

export const upsertTreasuryFee = async (
  fee: Omit<TreasuryFee, 'collectedAt'> & { collectedAt: number }
): Promise<void> => {
  const query = `
    INSERT INTO treasury_fees (
      id, round_id, amount_lamports, collected_at,
      slot, tx_sig, log_index, block_time
    ) VALUES ($1, $2, $3, to_timestamp($4), $5, $6, $7, $8)
    ON CONFLICT (tx_sig, log_index) DO NOTHING
  `;

  const values = [
    fee.id,
    fee.roundId,
    fee.amountLamports.toString(),
    fee.collectedAt,
    fee.slot.toString(),
    fee.txSig,
    fee.logIndex,
    fee.blockTime.toString(),
  ];

  await getPool().query(query, values);
};

// ================================
// LEADERBOARD QUERIES
// ================================

export const getTopPayout = async (limit: number = 50): Promise<LeaderboardEntry[]> => {
  const query = `
    SELECT 
      player,
      COUNT(*) as total_claims,
      SUM(amount_lamports) as total_payout,
      MAX(claimed_at) as last_claim
    FROM claims
    GROUP BY player
    ORDER BY total_payout DESC
    LIMIT $1
  `;

  const result = await getPool().query(query, [limit]);
  
  return result.rows.map((row) => ({
    player: row.player,
    totalPayout: row.total_payout.toString(),
    totalClaims: parseInt(row.total_claims),
    lastClaim: row.last_claim.toISOString(),
  }));
};

export const getWeeklyWinRate = async (fromTimestamp?: number): Promise<WeeklyWinRateEntry[]> => {
  const from = fromTimestamp || Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // 7 days ago

  const query = `
    SELECT 
      pr.player,
      COUNT(*) FILTER (WHERE r.winner_side = pr.side) as wins,
      COUNT(*) as total,
      ROUND(
        COUNT(*) FILTER (WHERE r.winner_side = pr.side)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
      ) as rate
    FROM player_rounds pr
    INNER JOIN rounds r ON pr.round_id = r.id
    WHERE pr.revealed = TRUE
      AND r.settled = TRUE
      AND EXTRACT(EPOCH FROM pr.created_at) >= $1
    GROUP BY pr.player
    HAVING COUNT(*) >= 3
    ORDER BY rate DESC, wins DESC
    LIMIT 50
  `;

  const result = await getPool().query(query, [from]);
  
  return result.rows.map((row) => ({
    player: row.player,
    wins: parseInt(row.wins),
    total: parseInt(row.total),
    rate: parseFloat(row.rate),
  }));
};

// ================================
// INDEXER STATE
// ================================

export const getIndexerState = async (): Promise<IndexerState> => {
  const query = 'SELECT * FROM indexer_state WHERE id = 1';
  const result = await getPool().query(query);
  
  if (result.rows.length === 0) {
    return {
      lastProcessedSlot: BigInt(0),
      lastProcessedSignature: null,
      updatedAt: new Date(),
    };
  }

  const row = result.rows[0];
  return {
    lastProcessedSlot: BigInt(row.last_processed_slot),
    lastProcessedSignature: row.last_processed_signature,
    updatedAt: row.updated_at,
  };
};

export const updateIndexerState = async (
  slot: bigint,
  signature: string | null
): Promise<void> => {
  const query = `
    UPDATE indexer_state
    SET last_processed_slot = $1,
        last_processed_signature = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `;

  await getPool().query(query, [slot.toString(), signature]);
};
