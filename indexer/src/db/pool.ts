import { Pool, PoolClient } from 'pg';
import Database from 'better-sqlite3';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';

let pool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

const isSQLite = (): boolean => {
  return appConfig.DATABASE_URL.startsWith('sqlite:');
};

export const getPool = (): Pool => {
  if (isSQLite()) {
    throw new Error('SQLite mode - use getSQLiteDb() instead');
  }
  
  if (!pool) {
    pool = new Pool({
      connectionString: appConfig.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected database pool error');
    });

    logger.info('✅ Database pool initialized');
  }

  return pool;
};

export const getSQLiteDb = (): Database.Database => {
  if (!sqliteDb) {
    const dbPath = appConfig.DATABASE_URL.replace('sqlite:', '');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    logger.info({ dbPath }, '✅ SQLite database initialized');
  }
  return sqliteDb;
};

export const closePool = async (): Promise<void> => {
  if (isSQLite()) {
    if (sqliteDb) {
      sqliteDb.close();
      sqliteDb = null;
      logger.info('SQLite database closed');
    }
    return;
  }
  
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
};

export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (isSQLite()) {
      const result = getSQLiteDb().prepare('SELECT datetime("now") as now').get();
      logger.info({ time: result }, 'Database connection successful');
      return true;
    } else {
      const result = await getPool().query('SELECT NOW()');
      logger.info({ time: result.rows[0].now }, 'Database connection successful');
      return true;
    }
  } catch (error) {
    logger.error({ 
      error,
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    }, 'Database connection failed');
    return false;
  }
};
