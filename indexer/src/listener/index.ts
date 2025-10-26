import { Connection, PublicKey, Logs, Context } from '@solana/web3.js';
import { EventDecoder, loadIdl } from '../decoder/index.js';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';
import { processEvent } from './processor.js';

export class EventListener {
  private connection: Connection;
  private decoder: EventDecoder | null = null;
  private subscriptionId: number | null = null;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(appConfig.RPC_HTTP_URL, {
      wsEndpoint: appConfig.RPC_WS_URL,
      commitment: 'confirmed',
    });
    this.programId = new PublicKey(appConfig.PROGRAM_ID);
  }

  async initialize(): Promise<void> {
    const idl = await loadIdl();
    this.decoder = new EventDecoder(idl);
    logger.info('✅ Event decoder initialized');
  }

  async start(): Promise<void> {
    if (!this.decoder) {
      throw new Error('Decoder not initialized. Call initialize() first');
    }

    logger.info({ programId: this.programId.toString() }, 'Starting event listener...');

    this.subscriptionId = this.connection.onLogs(
      this.programId,
      async (logs: Logs, ctx: Context) => {
        try {
          await this.handleLogs(logs, ctx);
        } catch (error) {
          logger.error({ error, signature: logs.signature }, 'Error processing logs');
        }
      },
      'confirmed'
    );

    logger.info({ subscriptionId: this.subscriptionId }, '✅ Event listener started');
  }

  async stop(): Promise<void> {
    if (this.subscriptionId !== null) {
      await this.connection.removeOnLogsListener(this.subscriptionId);
      this.subscriptionId = null;
      logger.info('Event listener stopped');
    }
  }

  private async handleLogs(logs: Logs, ctx: Context): Promise<void> {
    if (!this.decoder) return;

    const { signature, err } = logs;

    if (err) {
      logger.warn({ signature, err }, 'Transaction failed, skipping');
      return;
    }

    logger.debug({ signature, slot: ctx.slot }, 'Processing transaction');

    // Fetch full transaction to decode events
    const tx = await this.connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      logger.warn({ signature }, 'Could not fetch transaction');
      return;
    }

    // Decode all events from transaction
    const events = this.decoder.decodeTransaction(tx);

    for (const event of events) {
      await processEvent(event, tx, BigInt(ctx.slot));
    }

    logger.info(
      { signature, slot: ctx.slot, eventCount: events.length },
      'Processed transaction'
    );
  }
}
