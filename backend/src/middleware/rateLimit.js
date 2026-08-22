import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

const ipKey = (req) => {
  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  if (ip.includes(':') && !ip.startsWith('::ffff:')) {
    return ip.split(':').slice(0, 4).join(':');
  }
  return ip.replace('::ffff:', '');
};

const retryAfterSeconds = (req) => {
  const resetTime = req.rateLimit?.resetTime;
  if (!resetTime) return Math.ceil(env.rateLimitWindowMs / 1000);
  return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
};

const buildLimiter = ({ max, message, code = 'RATE_LIMITED', keyGenerator, ...rest }) =>
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => !env.RATE_LIMIT_ENABLED,
    keyGenerator,
    handler: (req, res) => {
      const retryAfter = retryAfterSeconds(req);
      res.setHeader('Retry-After', retryAfter);
      sendError(res, { status: 429, code, message, details: { retryAfter } });
    },
    ...rest,
  });

export const globalLimiter = buildLimiter({
  max: env.RATE_LIMIT_GLOBAL_MAX,
  message: 'Too many requests from this IP. Please slow down and try again shortly.',
  skip: (req) => !env.RATE_LIMIT_ENABLED || req.path === '/health',
});

export const authLimiter = buildLimiter({
  max: env.RATE_LIMIT_AUTH_MAX,
  code: 'AUTH_RATE_LIMITED',
  message: 'Too many authentication attempts from this IP. Please try again later.',
});

export const loginLimiter = buildLimiter({
  max: env.RATE_LIMIT_LOGIN_MAX,
  code: 'LOGIN_RATE_LIMITED',
  message: 'Too many failed sign-in attempts for this account. Please try again later.',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = String(req.body?.email ?? '')
      .toLowerCase()
      .trim();
    return `${ipKey(req)}:${email}`;
  },
});

export const writeLimiter = buildLimiter({
  max: env.RATE_LIMIT_WRITE_MAX,
  code: 'WRITE_RATE_LIMITED',
  message: 'Too many write operations. Please slow down.',
  keyGenerator: (req) => (req.user ? `user:${req.user._id}` : ipKey(req)),
});
