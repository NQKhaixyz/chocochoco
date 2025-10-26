import { config } from 'dotenv';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';

// Load environment variables
config();

const envSchema = z.object({
  // Solana
  CLUSTER: z.enum(['devnet', 'testnet', 'mainnet-beta']).default('devnet'),
  PROGRAM_ID: z.string().refine((val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid Solana public key'),
  RPC_WS_URL: z.string().url(),
  RPC_HTTP_URL: z.string().url(),
  HELIUS_API_KEY: z.string().optional(),

  // Database
  DATABASE_URL: z.string(),

  // API Server
  PORT: z.string().default('3001').transform(Number),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Indexer Behavior
  BACKFILL_SLOTS: z.string().default('1000').transform(Number),
  AUTO_BACKFILL: z.string().default('true').transform((val) => val === 'true'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  MAX_RETRIES: z.string().default('5').transform(Number),
  RETRY_DELAY_MS: z.string().default('1000').transform(Number),

  // Helius Webhook
  WEBHOOK_PATH: z.string().default('/webhook/helius'),
  HELIUS_WEBHOOK_SECRET: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

export const loadConfig = (): Config => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const appConfig = loadConfig();
