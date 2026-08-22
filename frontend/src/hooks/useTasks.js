import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { timeZone } from '../lib/week.js';

const clean = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  );

export const useTasks = (filters = {}, options = {}) => {
  const params = clean({ tz: timeZone, ...filters });

  return useQuery({
    queryKey: queryKeys.taskList(params),
    queryFn: async ({ signal }) => {
      const response = await api.get('/tasks', { params, signal });
      return { tasks: response.data.data.tasks, meta: response.data.meta };
    },
    ...options,
  });
};

export const useWeekSummary = (params = {}, options = {}) => {
  const query = clean({ tz: timeZone, ...params });

  return useQuery({
    queryKey: queryKeys.weekSummary(query),
    queryFn: async ({ signal }) => {
      const response = await api.get('/tasks/weeks', { params: query, signal });
      return response.data.data;
    },
    ...options,
  });
};
