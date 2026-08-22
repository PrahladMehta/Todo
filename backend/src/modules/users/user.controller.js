import { buildPageMeta, sendSuccess } from '../../utils/apiResponse.js';
import { publicUser } from '../auth/auth.service.js';
import * as service from './user.service.js';

const withStats = (user, stats) => ({
  ...publicUser(user),
  stats: stats.get(String(user._id)) ?? service.EMPTY_STATS,
});

export const list = async (req, res) => {
  const result = await service.listUsers({ scopeFilter: req.scopeFilter, query: req.query });
  sendSuccess(res, {
    data: { users: result.items.map((user) => withStats(user, result.stats)) },
    meta: buildPageMeta({ page: result.page, limit: result.limit, total: result.total }),
  });
};

export const detail = async (req, res) => {
  const { user, stats } = await service.getUserWithStats({
    scopeFilter: req.scopeFilter,
    id: req.params.id,
  });
  sendSuccess(res, { data: { user: { ...publicUser(user), stats } } });
};

export const updateMe = async (req, res) => {
  const user = await service.updateOwnProfile({ userId: req.user._id, updates: req.body });
  sendSuccess(res, { data: { user: publicUser(user) } });
};

export const assignRole = async (req, res) => {
  const user = await service.assignRole({
    actor: req.user,
    targetId: req.params.id,
    role: req.body.role,
  });
  sendSuccess(res, { data: { user: publicUser(user) } });
};

export const setActive = async (req, res) => {
  const user = await service.setActiveState({
    actor: req.user,
    targetId: req.params.id,
    isActive: req.body.isActive,
  });
  sendSuccess(res, { data: { user: publicUser(user) } });
};
