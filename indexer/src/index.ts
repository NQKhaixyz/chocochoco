import { appConfig } from './config.js';
import { logger } from './logger.js';
import { testConnection, closePool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';
import { EventListener } from './listener/index.js';
import { createApiServer, startApiServer } from './api/server.js';

let listener: EventListener | null = null;
let isShuttingDown = false;

async function main() {
  logger.info('🚀 Starting ChocoChoco Indexer...');
  logger.info({ config: { cluster: appConfig.CLUSTER, programId: appConfig.PROGRAM_ID } });

  try {
    // 1. Test database connection
    logger.info('Testing database connection...');
    const dbOk = await testConnection();
    if (!dbOk) {
      logger.warn('⚠️ Database connection failed - running in API-only mode');
      // throw new Error('Database connection failed');
    } else {
      // 2. Run migrations
      if (appConfig.AUTO_BACKFILL) {
        logger.info('Running database migrations...');
        await runMigrations();
      }
    }

    // 3. Initialize event listener
    logger.info('Initializing event listener...');
    listener = new EventListener();
    try {
      await listener.initialize();
    } catch (initError) {
      logger.error({ initError, stack: (initError as Error).stack }, 'Failed to initialize listener');
      throw initError;
    }

    // 4. Start API server
    logger.info('Starting API server...');
    const app = createApiServer();
    await startApiServer(app);

    // 5. Start listening to events
    logger.info('Starting event listener...');
    await listener.start();

    logger.info('✅ ChocoChoco Indexer is running!');
    logger.info(`📊 API: http://localhost:${appConfig.PORT}`);
    logger.info(`🔗 Cluster: ${appConfig.CLUSTER}`);
    logger.info(`🎯 Program: ${appConfig.PROGRAM_ID}`);

  } catch (error) {
    logger.fatal({ 
      error,
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    }, 'Failed to start indexer');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Shutting down...');

  try {
    // Stop listener
    if (listener) {
      await listener.stop();
    }

    // Close database pool
    await closePool();

    logger.info('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

// Signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  shutdown('unhandledRejection');
});

// Start
main();
 
