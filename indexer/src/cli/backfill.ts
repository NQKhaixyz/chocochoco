import { Connection, PublicKey } from '@solana/web3.js';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';
import { EventDecoder, loadIdl } from '../decoder/index.js';
import { processEvent } from '../listener/processor.js';
import { updateIndexerState } from '../db/repository.js';

export async function backfill(slotsToBackfill?: number): Promise<void> {
  const slots = slotsToBackfill || appConfig.BACKFILL_SLOTS;
  
  logger.info({ slots }, 'Starting backfill...');

  const connection = new Connection(appConfig.RPC_HTTP_URL, 'confirmed');
  const programId = new PublicKey(appConfig.PROGRAM_ID);
  
  // Load IDL and create decoder
  const idl = await loadIdl();
  const decoder = new EventDecoder(idl);

  // Get current slot
  const currentSlot = await connection.getSlot();
  const startSlot = currentSlot - slots;

  logger.info({ startSlot, currentSlot }, 'Fetching signatures...');

  // Fetch all signatures for program
  const signatures = await connection.getSignaturesForAddress(programId, {
    limit: 1000,
    until: startSlot.toString(),
  });

  logger.info({ count: signatures.length }, 'Processing transactions...');

  let processed = 0;
  let errors = 0;

  for (const sigInfo of signatures) {
    try {
      const tx = await connection.getParsedTransaction(sigInfo.signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || tx.meta?.err) {
        continue;
      }

      const events = decoder.decodeTransaction(tx);
      
      for (const event of events) {
        await processEvent(event, tx, BigInt(sigInfo.slot));
      }

      await updateIndexerState(BigInt(sigInfo.slot), sigInfo.signature);
      processed++;

      if (processed % 10 === 0) {
        logger.info({ processed, total: signatures.length }, 'Backfill progress');
      }
    } catch (error) {
      logger.error({ error, signature: sigInfo.signature }, 'Backfill error');
      errors++;
    }
  }

  logger.info({ processed, errors }, '✅ Backfill complete');
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const slots = process.argv[2] ? parseInt(process.argv[2]) : undefined;

  (async () => {
    try {
      await backfill(slots);
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Backfill failed');
      process.exit(1);
    }
  })();
}
