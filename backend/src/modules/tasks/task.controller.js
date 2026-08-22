import { buildPageMeta, sendCreated, sendSuccess } from '../../utils/apiResponse.js';
import * as service from './task.service.js';

export const create = async (req, res) => {
  const task = await service.createTask({ actor: req.user, payload: req.body });
  sendCreated(res, { task });
};

export const list = async (req, res) => {
  const result = await service.listTasks({ scopeFilter: req.scopeFilter, query: req.query });
  sendSuccess(res, {
    data: { tasks: result.items, timeZone: result.timeZone },
    meta: buildPageMeta({ page: result.page, limit: result.limit, total: result.total }),
  });
};

export const weeks = async (req, res) => {
  const overview = await service.weekOverview({
    scopeFilter: req.scopeFilter,
    query: req.query,
  });
  sendSuccess(res, { data: overview });
};

export const detail = async (req, res) => {
  const task = await service.getTaskDetail({ scopeFilter: req.scopeFilter, id: req.params.id });
  sendSuccess(res, { data: { task } });
};

export const update = async (req, res) => {
  const task = await service.updateTask({
    scopeFilter: req.scopeFilter,
    id: req.params.id,
    updates: req.body,
  });
  sendSuccess(res, { data: { task } });
};

export const updateStatus = async (req, res) => {
  const task = await service.updateTaskStatus({
    scopeFilter: req.scopeFilter,
    id: req.params.id,
    status: req.body.status,
  });
  sendSuccess(res, { data: { task } });
};

export const remove = async (req, res) => {
  const result = await service.softDeleteTask({ scopeFilter: req.scopeFilter, id: req.params.id });
  sendSuccess(res, { data: result });
};
