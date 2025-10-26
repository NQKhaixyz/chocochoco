import Database from 'better-sqlite3';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';

let db: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (!db) {
    const dbPath = appConfig.DATABASE_URL.replace('sqlite:', '');
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    logger.info({ dbPath }, '✅ SQLite database initialized');
  }

  return db;
};

export const closeDb = (): void => {
  if (db) {
    db.close();
    db = null;
    logger.info('SQLite database closed');
  }
};

export const testConnection = (): boolean => {
  try {
    const result = getDb().prepare('SELECT datetime("now") as now').get();
    logger.info({ time: result }, 'Database connection successful');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    return false;
  }
};
