// Entity types matching database schema

export type Tribe = 'milk' | 'cacao';

export interface Round {
  id: string;
  roundNumber: bigint;
  commitEnd: bigint;
  revealEnd: bigint;
  stakeLamports: bigint;
  milkCount: number;
  cacaoCount: number;
  milkPool: bigint;
  cacaoPool: bigint;
  winnerSide: Tribe | null;
  settled: boolean;
  createdAt: Date;
  slot: bigint;
  txSig: string;
  blockTime: bigint;
}

export interface PlayerRound {
  id: string;
  roundId: string;
  player: string;
  side: Tribe | null;
  commitment: string;
  stakeLamports: bigint;
  revealed: boolean;
  claimed: boolean;
  createdAt: Date;
  revealedAt: Date | null;
  slot: bigint;
  txSig: string;
  blockTime: bigint;
}

export interface Claim {
  id: string;
  roundId: string;
  player: string;
  amountLamports: bigint;
  claimedAt: Date;
  slot: bigint;
  txSig: string;
  logIndex: number;
  blockTime: bigint;
}

export interface TreasuryFee {
  id: string;
  roundId: string;
  amountLamports: bigint;
  collectedAt: Date;
  slot: bigint;
  txSig: string;
  logIndex: number;
  blockTime: bigint;
}

export interface IndexerState {
  lastProcessedSlot: bigint;
  lastProcessedSignature: string | null;
  updatedAt: Date;
}

// Event types from Anchor program
export interface RoundCreatedEvent {
  roundId: string;
  roundNumber: bigint;
  commitDeadline: bigint;
  revealDeadline: bigint;
  stakeLamports: bigint;
}

export interface MeowCommittedEvent {
  roundId: string;
  player: string;
  commitment: string;
  stakeLamports: bigint;
}

export interface MeowRevealedEvent {
  roundId: string;
  player: string;
  tribe: Tribe;
}

export interface RoundMeowedEvent {
  roundId: string;
  winnerSide: Tribe | null;
  milkCount: number;
  cacaoCount: number;
  milkPool: bigint;
  cacaoPool: bigint;
}

export interface TreatClaimedEvent {
  roundId: string;
  player: string;
  amount: bigint;
}

export interface FeeCollectedEvent {
  roundId: string;
  amount: bigint;
}

// API response types
export interface LeaderboardEntry {
  player: string;
  totalPayout: string; // bigint as string for JSON
  totalClaims: number;
  lastClaim: string; // ISO timestamp
}

export interface WeeklyWinRateEntry {
  player: string;
  wins: number;
  total: number;
  rate: number; // Percentage
}

export interface RoundWithStats extends Round {
  totalPlayers: number;
  revealedPlayers: number;
  totalPool: string; // bigint as string
}
