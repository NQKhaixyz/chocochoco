import { Event } from '@coral-xyz/anchor';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import {
  upsertRound,
  upsertPlayerRound,
  upsertClaim,
  upsertTreasuryFee,
  updateIndexerState,
} from '../db/repository.js';
import { logger } from '../logger.js';

export const processEvent = async (
  event: Event,
  tx: ParsedTransactionWithMeta,
  slot: bigint
): Promise<void> => {
  const txSig = tx.transaction.signatures[0];
  const blockTime = tx.blockTime || Math.floor(Date.now() / 1000);

  try {
    switch (event.name) {
      case 'RoundCreated':
        await processRoundCreated(event, txSig, slot, blockTime);
        break;
      case 'MeowCommitted':
        await processMeowCommitted(event, txSig, slot, blockTime);
        break;
      case 'MeowRevealed':
        await processMeowRevealed(event, txSig, slot, blockTime);
        break;
      case 'RoundMeowed':
        await processRoundMeowed(event, txSig, slot, blockTime);
        break;
      case 'TreatClaimed':
        await processTreatClaimed(event, txSig, slot, blockTime);
        break;
      case 'FeeCollected':
        await processFeeCollected(event, txSig, slot, blockTime);
        break;
      default:
        logger.debug({ eventName: event.name }, 'Unknown event type');
    }

    // Update indexer state
    await updateIndexerState(slot, txSig);
  } catch (error) {
    logger.error({ error, event: event.name, txSig }, 'Failed to process event');
    throw error;
  }
};

// Event processors - these work directly with decoded event data
async function processRoundCreated(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  // Support both camelCase and snake_case from IDL
  const roundId = (data.roundId || data.round_id)?.toString?.() || String(data.round_id) || '0';
  const commitEndRaw = data.commitDeadline ?? data.commit_deadline;
  const revealEndRaw = data.revealDeadline ?? data.reveal_deadline;
  const stakeRaw = data.stakeLamports ?? data.stake_lamports ?? 0;

  await upsertRound({
    id: roundId,
    // No numeric round number in program; store 0 and rely on created_at ordering
    roundNumber: 0n,
    commitEnd: BigInt(commitEndRaw?.toString?.() ?? commitEndRaw ?? blockTime + 3600),
    revealEnd: BigInt(revealEndRaw?.toString?.() ?? revealEndRaw ?? blockTime + 7200),
    stakeLamports: BigInt(stakeRaw?.toString?.() ?? stakeRaw ?? 0),
    milkCount: 0,
    cacaoCount: 0,
    milkPool: 0n,
    cacaoPool: 0n,
    winnerSide: null,
    settled: false,
    createdAt: blockTime,
    slot,
    txSig,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId }, 'Round created');
}

async function processMeowCommitted(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  const roundId = data.roundId?.toString() || '0';
  const player = data.player?.toString() || '';
  const playerRoundId = `${roundId}-${player}`;

  await upsertPlayerRound({
    id: playerRoundId,
    roundId,
    player,
    side: null,
    commitment: Buffer.isBuffer(data.commitmentHash)
      ? data.commitmentHash.toString('hex')
      : Array.isArray(data.commitmentHash)
      ? Buffer.from(data.commitmentHash).toString('hex')
      : '',
    stakeLamports: BigInt(data.amount || 0),
    revealed: false,
    claimed: false,
    createdAt: blockTime,
    slot,
    txSig,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId, player }, 'Meow committed');
}

async function processMeowRevealed(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  const roundId = data.roundId?.toString() || '0';
  const player = data.player?.toString() || '';
  const playerRoundId = `${roundId}-${player}`;
  const side = data.choice === 0 ? 'milk' : data.choice === 1 ? 'cacao' : null;

  await upsertPlayerRound({
    id: playerRoundId,
    roundId,
    player,
    side,
    commitment: '',
    stakeLamports: BigInt(0),
    revealed: true,
    claimed: false,
    createdAt: blockTime,
    slot,
    txSig,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId, player, side }, 'Meow revealed');
}

async function processRoundMeowed(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  const roundId = (data.roundId || data.round_id)?.toString?.() || String(data.round_id) || '0';
  // Program emits Option<Tribe>; decode flexible
  let winnerSide: 'milk' | 'cacao' | null = null;
  const ws = data.winnerSide ?? data.winner_side;
  if (ws != null) {
    if (typeof ws === 'object') {
      if (ws.milk != null) winnerSide = 'milk';
      if (ws.cacao != null) winnerSide = 'cacao';
    } else if (typeof ws === 'number') {
      winnerSide = ws === 0 ? 'milk' : ws === 1 ? 'cacao' : null;
    } else if (typeof ws === 'string') {
      winnerSide = ws as any;
    }
  }

  await upsertRound({
    id: roundId,
    roundNumber: 0n,
    commitEnd: BigInt(blockTime),
    revealEnd: BigInt(blockTime),
    stakeLamports: 0n,
    milkCount: 0,
    cacaoCount: 0,
    milkPool: 0n,
    cacaoPool: 0n,
    winnerSide,
    settled: true,
    createdAt: blockTime,
    slot,
    txSig,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId, winnerSide, totalPool: data.totalPool }, 'Round meowed');
}

async function processTreatClaimed(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  const roundId = data.roundId?.toString() || '0';
  const player = data.player?.toString() || '';
  const amountLamports = BigInt(data.payout || 0);

  await upsertClaim({
    id: `${txSig}-0`,
    roundId,
    player,
    amountLamports,
    claimedAt: blockTime,
    slot,
    txSig,
    logIndex: 0,
    blockTime: BigInt(blockTime),
  });

  // Update player_round as claimed
  const playerRoundId = `${roundId}-${player}`;
  await upsertPlayerRound({
    id: playerRoundId,
    roundId,
    player,
    side: null,
    commitment: '',
    stakeLamports: BigInt(0),
    revealed: false,
    claimed: true,
    createdAt: blockTime,
    slot,
    txSig,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId, player, amountLamports: amountLamports.toString() }, 'Treat claimed');
}

async function processFeeCollected(
  event: Event,
  txSig: string,
  slot: bigint,
  blockTime: number
): Promise<void> {
  const data = event.data as any;
  if (!data) return;

  const roundId = data.roundId?.toString() || '0';
  const amountLamports = BigInt(data.feeAmount || 0);

  await upsertTreasuryFee({
    id: `${txSig}-0`,
    roundId,
    amountLamports,
    collectedAt: blockTime,
    slot,
    txSig,
    logIndex: 0,
    blockTime: BigInt(blockTime),
  });

  logger.info({ roundId, amountLamports: amountLamports.toString() }, 'Fee collected');
}
