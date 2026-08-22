import { Task } from '../../models/Task.js';
import { User } from '../../models/User.js';
import { AppError } from '../../utils/AppError.js';
import {
  defaultWeekRange,
  escapeRegex,
  resolveTimeZone,
  startOfWeek,
  weekBounds,
  weekEndFor,
  weekLabel,
} from '../../utils/week.js';

const ACTIVE = { isDeleted: false };

const baseFilter = (scopeFilter, extra = {}) => ({ ...ACTIVE, ...extra, ...scopeFilter });

const resolveOwner = async (actor, ownerId) => {
  if (!ownerId || String(ownerId) === String(actor._id)) return actor._id;

  if (actor.role !== 'admin') {
    throw AppError.forbidden('Only an admin can create tasks for another user', 'OWNER_NOT_ALLOWED');
  }

  const owner = await User.findById(ownerId).lean();
  if (!owner) throw AppError.notFound('Target owner does not exist', 'OWNER_NOT_FOUND');
  return owner._id;
};

export const createTask = async ({ actor, payload }) => {
  const owner = await resolveOwner(actor, payload.ownerId);

  const task = await Task.create({
    title: payload.title,
    description: payload.description ?? '',
    dueAt: payload.dueAt,
    startAt: payload.startAt ?? null,
    endAt: payload.endAt ?? null,
    priority: payload.priority ?? 'medium',
    status: payload.status ?? 'in_progress',
    completedAt: payload.status === 'completed' ? new Date() : null,
    owner,
  });

  return task;
};

export const listTasks = async ({ scopeFilter, query }) => {
  const zone = resolveTimeZone(query.tz);
  const filter = baseFilter(scopeFilter);

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.ownerId) filter.owner = query.ownerId;

  if (query.weekStart) {
    const week = weekBounds(query.weekStart, zone);
    filter.dueAt = { $gte: week.weekStart, $lt: week.nextWeekStart };
  } else if (query.from || query.to) {
    filter.dueAt = {};
    if (query.from) filter.dueAt.$gte = query.from;
    if (query.to) filter.dueAt.$lte = query.to;
  }

  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const skip = (query.page - 1) * query.limit;
  const sort = query.sort.startsWith('-')
    ? { [query.sort.slice(1)]: -1 }
    : { [query.sort]: 1 };

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ ...sort, _id: 1 })
      .skip(skip)
      .limit(query.limit)
      .populate('owner', 'name email avatarUrl')
      .lean(),
    Task.countDocuments(filter),
  ]);

  return { items, total, page: query.page, limit: query.limit, timeZone: zone };
};

export const weekOverview = async ({ scopeFilter, query }) => {
  const zone = resolveTimeZone(query.tz);
  const fallback = defaultWeekRange(zone, {
    weeksBack: query.weeksBack,
    weeksAhead: query.weeksAhead,
  });
  const from = query.from ?? fallback.from;
  const to = query.to ?? fallback.to;

  const match = baseFilter(scopeFilter, { dueAt: { $gte: from, $lte: to } });
  if (query.ownerId) match.owner = query.ownerId;

  const grouped = await Task.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$dueAt', unit: 'week', startOfWeek: 'monday', timezone: zone },
        },
        openCount: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalCount: { $sum: 1 },
        highPriorityOpen: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$priority', 'high'] }, { $eq: ['$status', 'in_progress'] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const currentWeekStart = startOfWeek(new Date(), zone).toISO();

  return {
    timeZone: zone,
    range: { from, to },
    weeks: grouped.map((week) => ({
      weekStart: week._id,
      weekEnd: weekEndFor(week._id, zone),
      label: weekLabel(week._id, zone),
      isCurrentWeek: startOfWeek(week._id, zone).toISO() === currentWeekStart,
      openCount: week.openCount,
      completedCount: week.completedCount,
      totalCount: week.totalCount,
      highPriorityOpen: week.highPriorityOpen,
    })),
  };
};

export const getTaskOrFail = async ({ scopeFilter, id }) => {
  const task = await Task.findOne({ _id: id, ...ACTIVE, ...scopeFilter });
  if (!task) throw AppError.notFound('Task not found', 'TASK_NOT_FOUND');
  return task;
};

export const getTaskDetail = async ({ scopeFilter, id }) => {
  const task = await getTaskOrFail({ scopeFilter, id });
  await task.populate('owner', 'name email avatarUrl');
  return task;
};

export const updateTask = async ({ scopeFilter, id, updates }) => {
  const task = await getTaskOrFail({ scopeFilter, id });

  Object.assign(task, updates);
  await task.save();

  return task;
};

export const updateTaskStatus = async ({ scopeFilter, id, status }) => {
  const task = await getTaskOrFail({ scopeFilter, id });
  task.status = status;
  await task.save();

  return task;
};

export const softDeleteTask = async ({ scopeFilter, id }) => {
  const task = await getTaskOrFail({ scopeFilter, id });

  task.isDeleted = true;
  task.deletedAt = new Date();
  await task.save();

  return { id: String(task._id), deletedAt: task.deletedAt };
};
