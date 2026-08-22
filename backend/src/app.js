import crypto from 'node:crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { API_PREFIX, env } from './config/env.js';
import { logger } from './config/logger.js';
import { databaseHealth } from './config/db.js';
import { configurePassport } from './config/passport.js';
import { permissionMatrix } from './config/permissions.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { sendSuccess } from './utils/apiResponse.js';
import { AppError } from './utils/AppError.js';

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(
      AppError.forbidden(
        `Origin ${origin} is not allowed by CORS`,
        'CORS_ORIGIN_NOT_ALLOWED',
      ),
    );
  },
  credentials: true,
  exposedHeaders: ['RateLimit', 'RateLimit-Policy', 'Retry-After'],
};

export const createApp = () => {
  const app = express();

  app.set('trust proxy', env.isProduction ? 1 : false);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id = existing ?? crypto.randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === '/health' },
    }),
  );

  app.use(sanitizeRequest);
  app.use(globalLimiter);
  app.use(configurePassport().initialize());

  app.get('/health', async (_req, res) => {
    const database = await databaseHealth().catch((error) => ({
      status: 'down',
      error: error.message,
    }));
    const healthy = database.status === 'up';
    sendSuccess(res, {
      status: healthy ? 200 : 503,
      data: {
        status: healthy ? 'ok' : 'degraded',
        uptimeSeconds: Math.round(process.uptime()),
        environment: env.NODE_ENV,
        database,
        features: {
          googleAuth: env.googleEnabled,
          rateLimiting: env.RATE_LIMIT_ENABLED,
        },
      },
    });
  });

  app.get(`${API_PREFIX}/permissions`, (_req, res) => {
    sendSuccess(res, { data: { roles: permissionMatrix() } });
  });

  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/tasks`, taskRouter);
  app.use(`${API_PREFIX}/users`, userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
