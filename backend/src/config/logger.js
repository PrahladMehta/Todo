import pino from 'pino';
import { env } from './env.js';

const transport =
  env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined;

export const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  transport,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'accessToken',
      'refreshToken',
    ],
    censor: '[redacted]',
  },
});
