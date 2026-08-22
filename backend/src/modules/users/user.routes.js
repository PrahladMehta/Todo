import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requireRole } from '../../middleware/authorize.js';
import { writeLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './user.controller.js';
import {
  assignRoleSchema,
  listUsersQuery,
  setActiveSchema,
  updateProfileSchema,
  userIdParams,
} from './user.validation.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.patch(
  '/me',
  writeLimiter,
  validate({ body: updateProfileSchema }),
  controller.updateMe,
);

userRouter.get(
  '/',
  authorize('user:read'),
  validate({ query: listUsersQuery }),
  controller.list,
);

userRouter.get(
  '/:id',
  authorize('user:read'),
  validate({ params: userIdParams }),
  controller.detail,
);

userRouter.patch(
  '/:id/role',
  writeLimiter,
  requireRole('admin'),
  authorize('role:assign'),
  validate({ params: userIdParams, body: assignRoleSchema }),
  controller.assignRole,
);

userRouter.patch(
  '/:id/status',
  writeLimiter,
  requireRole('admin'),
  authorize('user:update'),
  validate({ params: userIdParams, body: setActiveSchema }),
  controller.setActive,
);
