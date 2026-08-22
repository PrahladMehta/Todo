import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../models/Task.js';

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a 24 character hexadecimal id');

export const taskIdParams = z.object({ id: objectId });

const timeWindow = {
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
};

const endAfterStart = (value) =>
  !value.startAt || !value.endAt || value.endAt.getTime() > value.startAt.getTime();

const endAfterStartMessage = {
  message: 'endAt must be after startAt',
  path: ['endAt'],
};

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(2000).optional().default(''),
    dueAt: z.coerce.date({ invalid_type_error: 'dueAt must be a valid date-time' }),
    priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
    status: z.enum(TASK_STATUSES).optional().default('in_progress'),
    ownerId: objectId.optional(),
    ...timeWindow,
  })
  .refine(endAfterStart, endAfterStartMessage);

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    dueAt: z.coerce.date().optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    ...timeWindow,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })
  .refine(endAfterStart, endAfterStartMessage);

export const updateStatusSchema = z.object({ status: z.enum(TASK_STATUSES) });

export const listTasksQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().trim().min(1).max(120).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  weekStart: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ownerId: objectId.optional(),
  tz: z.string().optional(),
  sort: z.enum(['dueAt', '-dueAt', 'createdAt', '-createdAt', 'title', '-title']).default('dueAt'),
});

export const weekSummaryQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  weeksBack: z.coerce.number().int().min(0).max(52).default(4),
  weeksAhead: z.coerce.number().int().min(0).max(52).default(8),
  ownerId: objectId.optional(),
  tz: z.string().optional(),
});
