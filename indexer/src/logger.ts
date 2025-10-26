import pino from 'pino';
import { appConfig } from './config.js';

export const logger = pino({
  level: appConfig.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});
