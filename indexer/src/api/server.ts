import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Connection } from '@solana/web3.js';
import { appConfig } from '../config.js';
import { logger } from '../logger.js';
import { testConnection } from '../db/pool.js';
import {
  getTopPayout,
  getWeeklyWinRate,
  getRoundById,
  getRecentRounds,
  getPlayerRounds,
} from '../db/repository.js';

export const createApiServer = (): express.Application => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: appConfig.CORS_ORIGINS.split(','),
    credentials: true,
  }));
  app.use(express.json());

  // Request logging
  app.use((_req, _res, next) => {
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Readiness check
  app.get('/ready', async (_req, res) => {
    try {
      // DB connectivity
      const dbOk = await testConnection();
      // RPC connectivity
      const conn = new Connection(appConfig.RPC_HTTP_URL, 'confirmed');
      await conn.getSlot();

      if (!dbOk) {
        return res.status(503).json({ status: 'not ready', database: 'disconnected', rpc: 'connected' });
      }

      return res.json({ status: 'ready', database: 'connected', rpc: 'connected' });
    } catch (error: any) {
      return res.status(503).json({ status: 'not ready', error: error?.message || 'unknown' });
    }
  });

  // GET /leaderboard/top-payout
  app.get('/leaderboard/top-payout', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await getTopPayout(limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  });

  // GET /leaderboard/weekly-winrate
  app.get('/leaderboard/weekly-winrate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = req.query.from ? parseInt(req.query.from as string) : undefined;
      const leaderboard = await getWeeklyWinRate(from);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  });

  // GET /rounds (recent rounds)
  app.get('/rounds', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const rounds = await getRecentRounds(limit);
      
      // Convert bigints to strings for JSON
      const serialized = rounds.map(r => ({
        ...r,
        roundNumber: r.roundNumber.toString(),
        commitEnd: r.commitEnd.toString(),
        revealEnd: r.revealEnd.toString(),
        stakeLamports: r.stakeLamports.toString(),
        milkPool: r.milkPool.toString(),
        cacaoPool: r.cacaoPool.toString(),
        slot: r.slot.toString(),
        blockTime: r.blockTime.toString(),
      }));
      
      res.json(serialized);
    } catch (error) {
      next(error);
    }
  });

  // GET /rounds/:id
  app.get('/rounds/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const round = await getRoundById(req.params.id);
      
      if (!round) {
        return res.status(404).json({ error: 'Round not found' });
      }
      
      // Convert bigints to strings
      const serialized = {
        ...round,
        roundNumber: round.roundNumber.toString(),
        commitEnd: round.commitEnd.toString(),
        revealEnd: round.revealEnd.toString(),
        stakeLamports: round.stakeLamports.toString(),
        milkPool: round.milkPool.toString(),
        cacaoPool: round.cacaoPool.toString(),
        slot: round.slot.toString(),
        blockTime: round.blockTime.toString(),
      };
      
      return res.json(serialized);
    } catch (error) {
      return next(error);
    }
  });

  // GET /player/:address/rounds
  app.get('/player/:address/rounds', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const playerRounds = await getPlayerRounds(req.params.address, limit);
      
      // Convert bigints to strings
      const serialized = playerRounds.map(pr => ({
        ...pr,
        stakeLamports: pr.stakeLamports.toString(),
        slot: pr.slot.toString(),
        blockTime: pr.blockTime.toString(),
      }));
      
      res.json(serialized);
    } catch (error) {
      next(error);
    }
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'API error');
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
};

export const startApiServer = (app: express.Application): Promise<void> => {
  return new Promise((resolve) => {
    app.listen(appConfig.PORT, () => {
      logger.info({ port: appConfig.PORT }, '✅ API server started');
      resolve();
    });
  });
};
