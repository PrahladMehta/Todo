import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { writeLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './task.controller.js';
import {
  createTaskSchema,
  listTasksQuery,
  taskIdParams,
  updateStatusSchema,
  updateTaskSchema,
  weekSummaryQuery,
} from './task.validation.js';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post(
  '/',
  writeLimiter,
  authorize('task:create'),
  validate({ body: createTaskSchema }),
  controller.create,
);

taskRouter.get(
  '/',
  authorize('task:read'),
  validate({ query: listTasksQuery }),
  controller.list,
);

taskRouter.get(
  '/weeks',
  authorize('task:read'),
  validate({ query: weekSummaryQuery }),
  controller.weeks,
);

taskRouter.get(
  '/:id',
  authorize('task:read'),
  validate({ params: taskIdParams }),
  controller.detail,
);

taskRouter.patch(
  '/:id',
  writeLimiter,
  authorize('task:update'),
  validate({ params: taskIdParams, body: updateTaskSchema }),
  controller.update,
);

taskRouter.patch(
  '/:id/status',
  writeLimiter,
  authorize('task:update'),
  validate({ params: taskIdParams, body: updateStatusSchema }),
  controller.updateStatus,
);

taskRouter.delete(
  '/:id',
  writeLimiter,
  authorize('task:delete'),
  validate({ params: taskIdParams }),
  controller.remove,
);
