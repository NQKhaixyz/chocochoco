import { PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BorshCoder, Event } from '@coral-xyz/anchor';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';
import {
  RoundCreatedEvent,
  MeowCommittedEvent,
  MeowRevealedEvent,
  RoundMeowedEvent,
  TreatClaimedEvent,
  FeeCollectedEvent,
} from '../types.js';

export class EventDecoder {
  private coder: BorshCoder;

  constructor(idl: Idl) {
    this.coder = new BorshCoder(idl);
  }

  /**
   * Decode all events from a transaction
   */
  decodeTransaction(tx: ParsedTransactionWithMeta): Event[] {
    if (!tx.meta?.logMessages) return [];

    const events: Event[] = [];
    const logs = tx.meta.logMessages;

    for (const log of logs) {
      if (log.startsWith('Program data:')) {
        try {
          const dataStr = log.slice('Program data: '.length);
          const data = Buffer.from(dataStr, 'base64');
          
          const event = this.coder.events.decode(data.toString('base64'));
          if (event) {
            events.push(event);
          }
        } catch (error) {
          // Not an event log, skip
          continue;
        }
      }
    }

    return events;
  }

  /**
   * Decode specific event type
   */
  decodeEvent<T>(data: Buffer, eventName: string): T | null {
    try {
      const event = this.coder.events.decode(data.toString('base64'));
      if (event && event.name === eventName) {
        return event.data as T;
      }
      return null;
    } catch (error) {
      logger.warn({ error, eventName }, 'Failed to decode event');
      return null;
    }
  }

  /**
   * Parse RoundCreated event
   */
  parseRoundCreated(event: Event): RoundCreatedEvent | null {
    if (event.name !== 'RoundCreated') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      roundNumber: BigInt(data.roundNumber),
      commitDeadline: BigInt(data.commitDeadline),
      revealDeadline: BigInt(data.revealDeadline),
      stakeLamports: BigInt(data.stakeLamports),
    };
  }

  /**
   * Parse MeowCommitted event
   */
  parseMeowCommitted(event: Event): MeowCommittedEvent | null {
    if (event.name !== 'MeowCommitted') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      player: data.player.toString(),
      commitment: Buffer.from(data.commitment).toString('hex'),
      stakeLamports: BigInt(data.stakeLamports),
    };
  }

  /**
   * Parse MeowRevealed event
   */
  parseMeowRevealed(event: Event): MeowRevealedEvent | null {
    if (event.name !== 'MeowRevealed') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      player: data.player.toString(),
      tribe: data.tribe === 0 ? 'milk' : 'cacao',
    };
  }

  /**
   * Parse RoundMeowed event (settlement)
   */
  parseRoundMeowed(event: Event): RoundMeowedEvent | null {
    if (event.name !== 'RoundMeowed') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      winnerSide: data.winnerSide === null ? null : data.winnerSide === 0 ? 'milk' : 'cacao',
      milkCount: data.milkCount,
      cacaoCount: data.cacaoCount,
      milkPool: BigInt(data.milkPool),
      cacaoPool: BigInt(data.cacaoPool),
    };
  }

  /**
   * Parse TreatClaimed event
   */
  parseTreatClaimed(event: Event): TreatClaimedEvent | null {
    if (event.name !== 'TreatClaimed') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      player: data.player.toString(),
      amount: BigInt(data.amount),
    };
  }

  /**
   * Parse FeeCollected event
   */
  parseFeeCollected(event: Event): FeeCollectedEvent | null {
    if (event.name !== 'FeeCollected') return null;
    
    const data = event.data as any;
    return {
      roundId: data.roundId.toString(),
      amount: BigInt(data.amount),
    };
  }
}

/**
 * Load IDL from file or fetch from chain
 */
export const loadIdl = async (): Promise<Idl> => {
  // Try loading from local file first
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const idlPath = path.join(__dirname, '../../idl/chocochoco_game.json');
    
    if (fs.existsSync(idlPath)) {
      const idlJson = fs.readFileSync(idlPath, 'utf-8');
      logger.info('✅ Loaded IDL from local file');
      return JSON.parse(idlJson);
    }
  } catch (error) {
    logger.warn('Could not load IDL from file, fetching from chain...');
  }

  // Fallback: fetch from chain
  try {
    const programId = new PublicKey(appConfig.PROGRAM_ID);
    
    const idlAddress = await Program.fetchIdl(programId, {} as AnchorProvider);
    if (!idlAddress) {
      throw new Error('IDL not found on-chain');
    }
    
    logger.info('✅ Fetched IDL from chain');
    return idlAddress;
  } catch (error) {
    logger.error({ error }, 'Failed to load IDL');
    throw new Error('Could not load program IDL');
  }
};
