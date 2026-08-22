import { Task } from '../../models/Task.js';
import { User } from '../../models/User.js';
import { AppError } from '../../utils/AppError.js';
import { escapeRegex } from '../../utils/week.js';
import { revokeAllSessions } from '../auth/auth.service.js';

export const EMPTY_STATS = {
  totalCount: 0,
  openCount: 0,
  completedCount: 0,
  highPriorityOpen: 0,
  completionRate: 0,
  lastDueAt: null,
};

export const taskStatsFor = async (userIds) => {
  if (userIds.length === 0) return new Map();

  const grouped = await Task.aggregate([
    { $match: { owner: { $in: userIds }, isDeleted: false } },
    {
      $group: {
        _id: '$owner',
        totalCount: { $sum: 1 },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        openCount: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        highPriorityOpen: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$priority', 'high'] }, { $eq: ['$status', 'in_progress'] }] },
              1,
              0,
            ],
          },
        },
        lastDueAt: { $max: '$dueAt' },
      },
    },
  ]);

  return new Map(
    grouped.map((entry) => [
      String(entry._id),
      {
        totalCount: entry.totalCount,
        openCount: entry.openCount,
        completedCount: entry.completedCount,
        highPriorityOpen: entry.highPriorityOpen,
        lastDueAt: entry.lastDueAt ?? null,
        completionRate:
          entry.totalCount === 0 ? 0 : Math.round((entry.completedCount / entry.totalCount) * 100),
      },
    ]),
  );
};

export const listUsers = async ({ scopeFilter, query }) => {
  const filter = { ...scopeFilter };

  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(query.limit).lean(),
    User.countDocuments(filter),
  ]);

  const stats = await taskStatsFor(items.map((item) => item._id));

  return { items, stats, total, page: query.page, limit: query.limit };
};

export const getUserOrFail = async ({ scopeFilter, id }) => {
  const user = await User.findOne({ _id: id, ...scopeFilter });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
};

export const getUserWithStats = async ({ scopeFilter, id }) => {
  const user = await getUserOrFail({ scopeFilter, id });
  const stats = await taskStatsFor([user._id]);
  return { user, stats: stats.get(String(user._id)) ?? EMPTY_STATS };
};

export const updateOwnProfile = async ({ userId, updates }) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  if (updates.name !== undefined) user.name = updates.name;
  await user.save();

  return user;
};

export const assignRole = async ({ actor, targetId, role }) => {
  if (String(actor._id) === String(targetId)) {
    throw AppError.badRequest(
      'You cannot change your own role',
      undefined,
      'SELF_ROLE_CHANGE_BLOCKED',
    );
  }

  const user = await User.findById(targetId);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  user.role = role;
  await user.save();
  await revokeAllSessions(user._id);

  return user;
};

export const setActiveState = async ({ actor, targetId, isActive }) => {
  if (String(actor._id) === String(targetId)) {
    throw AppError.badRequest(
      'You cannot change your own account state',
      undefined,
      'SELF_DEACTIVATION_BLOCKED',
    );
  }

  const user = await User.findById(targetId);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  user.isActive = isActive;
  await user.save();
  if (!isActive) await revokeAllSessions(user._id);

  return user;
};
