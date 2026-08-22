import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiError } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useToast } from '../components/ui/useToast.js';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const { notify, notifyError } = useToast();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    queryClient.invalidateQueries({ queryKey: queryKeys.weeks });
  };

  const reportFailure = (error, fallback) => {
    notifyError(apiError(error).message || fallback);
  };

  const createTask = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/tasks', payload);
      return response.data.data.task;
    },
    onSuccess: () => {
      notify('Task created');
      invalidateAll();
    },
    onError: (error) => reportFailure(error, 'Could not create the task'),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await api.patch(`/tasks/${id}`, updates);
      return response.data.data.task;
    },
    onSuccess: () => {
      notify('Task updated');
      invalidateAll();
    },
    onError: (error) => reportFailure(error, 'Could not update the task'),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return response.data.data.task;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });
      const snapshot = queryClient.getQueriesData({ queryKey: queryKeys.tasks });

      queryClient.setQueriesData({ queryKey: queryKeys.tasks }, (current) => {
        if (!current?.tasks) return current;
        return {
          ...current,
          tasks: current.tasks.map((task) =>
            task._id === id
              ? { ...task, status, completedAt: status === 'completed' ? new Date().toISOString() : null }
              : task,
          ),
        };
      });

      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      reportFailure(error, 'Could not update the task status');
    },
    onSettled: invalidateAll,
  });

  const deleteTask = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });
      const snapshot = queryClient.getQueriesData({ queryKey: queryKeys.tasks });

      queryClient.setQueriesData({ queryKey: queryKeys.tasks }, (current) => {
        if (!current?.tasks) return current;
        return {
          ...current,
          tasks: current.tasks.filter((task) => task._id !== id),
          meta: current.meta ? { ...current.meta, total: Math.max(0, current.meta.total - 1) } : current.meta,
        };
      });

      return { snapshot };
    },
    onSuccess: () => notify('Task deleted'),
    onError: (error, _variables, context) => {
      context?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      reportFailure(error, 'Could not delete the task');
    },
    onSettled: invalidateAll,
  });

  return { createTask, updateTask, toggleStatus, deleteTask };
};
