-- SQLite Schema for ChocoChoco Indexer
-- Simplified version without PostgreSQL-specific features

-- Indexer state tracking
CREATE TABLE IF NOT EXISTS indexer_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_processed_slot INTEGER NOT NULL DEFAULT 0,
  last_processed_signature TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize indexer state
INSERT OR IGNORE INTO indexer_state (id, last_processed_slot) VALUES (1, 0);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  round_number INTEGER NOT NULL,
  commit_end INTEGER NOT NULL,
  reveal_end INTEGER NOT NULL,
  stake_lamports INTEGER NOT NULL DEFAULT 0,
  milk_count INTEGER NOT NULL DEFAULT 0,
  cacao_count INTEGER NOT NULL DEFAULT 0,
  milk_pool INTEGER NOT NULL DEFAULT 0,
  cacao_pool INTEGER NOT NULL DEFAULT 0,
  winner_side TEXT CHECK(winner_side IN ('milk', 'cacao')),
  settled INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  slot INTEGER NOT NULL,
  tx_sig TEXT NOT NULL,
  block_time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rounds_number ON rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_rounds_settled ON rounds(settled);

-- Player rounds (commitments and reveals)
CREATE TABLE IF NOT EXISTS player_rounds (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  player TEXT NOT NULL,
  side TEXT CHECK(side IN ('milk', 'cacao')),
  commitment TEXT,
  stake_lamports INTEGER NOT NULL DEFAULT 0,
  revealed INTEGER NOT NULL DEFAULT 0,
  claimed INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revealed_at DATETIME,
  slot INTEGER NOT NULL,
  tx_sig TEXT NOT NULL,
  block_time INTEGER NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id)
);

CREATE INDEX IF NOT EXISTS idx_player_rounds_round ON player_rounds(round_id);
CREATE INDEX IF NOT EXISTS idx_player_rounds_player ON player_rounds(player);
CREATE INDEX IF NOT EXISTS idx_player_rounds_revealed ON player_rounds(revealed);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  player TEXT NOT NULL,
  amount_lamports INTEGER NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  slot INTEGER NOT NULL,
  tx_sig TEXT NOT NULL,
  log_index INTEGER NOT NULL DEFAULT 0,
  block_time INTEGER NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id),
  UNIQUE(tx_sig, log_index)
);

CREATE INDEX IF NOT EXISTS idx_claims_round ON claims(round_id);
CREATE INDEX IF NOT EXISTS idx_claims_player ON claims(player);

-- Treasury fees table
CREATE TABLE IF NOT EXISTS treasury_fees (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL,
  amount_lamports INTEGER NOT NULL,
  collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  slot INTEGER NOT NULL,
  tx_sig TEXT NOT NULL,
  log_index INTEGER NOT NULL DEFAULT 0,
  block_time INTEGER NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id),
  UNIQUE(tx_sig, log_index)
);

CREATE INDEX IF NOT EXISTS idx_treasury_fees_round ON treasury_fees(round_id);
