import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, getSQLiteDb } from './pool.js';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isSQLite = (): boolean => {
  return appConfig.DATABASE_URL.startsWith('sqlite:');
};

export const runMigrations = async (): Promise<void> => {
  const schemaFile = isSQLite() ? 'schema-sqlite.sql' : 'schema.sql';
  const schemaPath = path.join(__dirname, '../../', schemaFile);
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    logger.info(`Running database migrations (${schemaFile})...`);
    
    if (isSQLite()) {
      const db = getSQLiteDb();
      // SQLite doesn't support multiple statements in one exec, so split them
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        try {
          db.exec(statement);
        } catch (error: any) {
          // Ignore already exists errors
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    } else {
      const pool = getPool();
      await pool.query(schema);
    }
    
    logger.info('✅ Migrations completed successfully');
  } catch (error) {
    logger.error({ error }, 'Migration failed');
    throw error;
  }
};

export const rollbackMigrations = async (): Promise<void> => {
  const pool = getPool();

  try {
    logger.info('Rolling back database...');
    
    await pool.query('DROP MATERIALIZED VIEW IF EXISTS leaderboard_top_payout CASCADE');
    await pool.query('DROP FUNCTION IF EXISTS get_weekly_winrate CASCADE');
    await pool.query('DROP TABLE IF EXISTS treasury_fees CASCADE');
    await pool.query('DROP TABLE IF EXISTS claims CASCADE');
    await pool.query('DROP TABLE IF EXISTS player_rounds CASCADE');
    await pool.query('DROP TABLE IF EXISTS rounds CASCADE');
    await pool.query('DROP TABLE IF EXISTS indexer_state CASCADE');
    
    logger.info('✅ Rollback completed');
  } catch (error) {
    logger.error({ error }, 'Rollback failed');
    throw error;
  }
};

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  (async () => {
    try {
      if (command === 'rollback') {
        await rollbackMigrations();
      } else {
        await runMigrations();
      }
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Migration script failed');
      process.exit(1);
    }
  })();
}
