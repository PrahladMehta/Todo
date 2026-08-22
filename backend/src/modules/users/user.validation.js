import { z } from 'zod';
import { ROLES } from '../../config/permissions.js';
import { objectId } from '../tasks/task.validation.js';

export const userIdParams = z.object({ id: objectId });

export const listUsersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().trim().min(1).max(120).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

export const assignRoleSchema = z.object({ role: z.enum(ROLES) });

export const setActiveSchema = z.object({ isActive: z.boolean() });
