import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter, loginLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), controller.register);
authRouter.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);
authRouter.post('/refresh', authLimiter, controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.post('/logout-all', authenticate, controller.logoutAll);
authRouter.get('/me', authenticate, controller.me);
authRouter.get('/sessions', authenticate, controller.sessions);
authRouter.get('/google', authLimiter, controller.googleStart);
authRouter.get('/google/callback', authLimiter, controller.googleCallback);
