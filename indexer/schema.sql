-- ChocoChoco Indexer Database Schema
-- PostgreSQL-compatible schema for indexing Solana program events

-- ================================
-- ROUNDS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,              -- Round PDA address (base58)
  round_number BIGINT NOT NULL,     -- Sequential round number
  commit_end BIGINT NOT NULL,       -- Unix timestamp (commit deadline)
  reveal_end BIGINT NOT NULL,       -- Unix timestamp (reveal deadline)
  stake_lamports BIGINT NOT NULL,   -- Stake amount in lamports
  milk_count INTEGER DEFAULT 0,     -- Number of Milk players
  cacao_count INTEGER DEFAULT 0,    -- Number of Cacao players
  milk_pool BIGINT DEFAULT 0,       -- Total lamports in Milk pool
  cacao_pool BIGINT DEFAULT 0,      -- Total lamports in Cacao pool
  winner_side TEXT,                 -- 'milk' | 'cacao' | NULL (tie or not settled)
  settled BOOLEAN DEFAULT FALSE,    -- Settlement status
  created_at TIMESTAMP NOT NULL,    -- Block timestamp
  slot BIGINT NOT NULL,             -- Solana slot number
  tx_sig TEXT NOT NULL,             -- Transaction signature
  block_time BIGINT NOT NULL,       -- Solana block time
  
  UNIQUE(round_number)
);

CREATE INDEX IF NOT EXISTS idx_rounds_settled ON rounds(settled);
CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_slot ON rounds(slot);

-- ================================
-- PLAYER_ROUNDS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS player_rounds (
  id TEXT PRIMARY KEY,              -- PlayerRound PDA address (base58)
  round_id TEXT NOT NULL,           -- Foreign key to rounds.id
  player TEXT NOT NULL,             -- Player wallet address (base58)
  side TEXT,                        -- 'milk' | 'cacao' | NULL (not revealed)
  commitment TEXT NOT NULL,         -- Commitment hash (hex)
  stake_lamports BIGINT NOT NULL,   -- Stake amount
  revealed BOOLEAN DEFAULT FALSE,   -- Reveal status
  claimed BOOLEAN DEFAULT FALSE,    -- Claim status
  created_at TIMESTAMP NOT NULL,    -- Commit timestamp
  revealed_at TIMESTAMP,            -- Reveal timestamp
  slot BIGINT NOT NULL,             -- Solana slot number
  tx_sig TEXT NOT NULL,             -- Transaction signature
  block_time BIGINT NOT NULL,       -- Solana block time
  
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
  UNIQUE(round_id, player)
);

CREATE INDEX IF NOT EXISTS idx_player_rounds_round_id ON player_rounds(round_id);
CREATE INDEX IF NOT EXISTS idx_player_rounds_player ON player_rounds(player);
CREATE INDEX IF NOT EXISTS idx_player_rounds_revealed ON player_rounds(revealed);
CREATE INDEX IF NOT EXISTS idx_player_rounds_created_at ON player_rounds(created_at DESC);

-- ================================
-- CLAIMS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,              -- Unique claim ID (tx_sig + log_index)
  round_id TEXT NOT NULL,           -- Foreign key to rounds.id
  player TEXT NOT NULL,             -- Player wallet address
  amount_lamports BIGINT NOT NULL,  -- Claimed amount
  claimed_at TIMESTAMP NOT NULL,    -- Claim timestamp
  slot BIGINT NOT NULL,             -- Solana slot number
  tx_sig TEXT NOT NULL,             -- Transaction signature
  log_index INTEGER NOT NULL,       -- Log index in transaction
  block_time BIGINT NOT NULL,       -- Solana block time
  
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
  UNIQUE(tx_sig, log_index)
);

CREATE INDEX IF NOT EXISTS idx_claims_round_id ON claims(round_id);
CREATE INDEX IF NOT EXISTS idx_claims_player ON claims(player);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_at ON claims(claimed_at DESC);

-- ================================
-- TREASURY_FEES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS treasury_fees (
  id TEXT PRIMARY KEY,              -- Unique fee ID (tx_sig + log_index)
  round_id TEXT NOT NULL,           -- Foreign key to rounds.id
  amount_lamports BIGINT NOT NULL,  -- Fee amount sent to treasury
  collected_at TIMESTAMP NOT NULL,  -- Collection timestamp
  slot BIGINT NOT NULL,             -- Solana slot number
  tx_sig TEXT NOT NULL,             -- Transaction signature
  log_index INTEGER NOT NULL,       -- Log index in transaction
  block_time BIGINT NOT NULL,       -- Solana block time
  
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
  UNIQUE(tx_sig, log_index)
);

CREATE INDEX IF NOT EXISTS idx_treasury_fees_round_id ON treasury_fees(round_id);
CREATE INDEX IF NOT EXISTS idx_treasury_fees_collected_at ON treasury_fees(collected_at DESC);

-- ================================
-- INDEXER_STATE TABLE
-- ================================
-- Tracks indexer progress for crash recovery
CREATE TABLE IF NOT EXISTS indexer_state (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Single row table
  last_processed_slot BIGINT NOT NULL DEFAULT 0,
  last_processed_signature TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (id = 1) -- Ensure only one row exists
);

-- Insert initial state
INSERT INTO indexer_state (id, last_processed_slot, updated_at)
VALUES (1, 0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ================================
-- MATERIALIZED VIEWS (Optional for Performance)
-- ================================

-- Leaderboard: Top Payout (aggregate claims per player)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_top_payout AS
SELECT 
  player,
  COUNT(*) as total_claims,
  SUM(amount_lamports) as total_payout,
  MAX(claimed_at) as last_claim
FROM claims
GROUP BY player
ORDER BY total_payout DESC;

CREATE INDEX IF NOT EXISTS idx_leaderboard_top_payout_player ON leaderboard_top_payout(player);

-- Refresh function (call periodically)
-- REFRESH MATERIALIZED VIEW leaderboard_top_payout;

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to calculate weekly win rate for a player
CREATE OR REPLACE FUNCTION get_weekly_winrate(
  p_player TEXT,
  p_from_timestamp BIGINT DEFAULT EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days')
)
RETURNS TABLE(
  player TEXT,
  wins BIGINT,
  total BIGINT,
  rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
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
  WHERE pr.player = p_player
    AND pr.revealed = TRUE
    AND r.settled = TRUE
    AND EXTRACT(EPOCH FROM pr.created_at) >= p_from_timestamp
  GROUP BY pr.player;
END;
$$ LANGUAGE plpgsql;
