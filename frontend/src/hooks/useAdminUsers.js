import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiError } from '../lib/api.js';
import { queryKeys } from '../lib/queryKeys.js';
import { useToast } from '../components/ui/useToast.js';

const clean = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null,
    ),
  );

export const useAdminUsers = (filters = {}) => {
  const params = clean(filters);

  return useQuery({
    queryKey: queryKeys.userList(params),
    queryFn: async ({ signal }) => {
      const response = await api.get('/users', { params, signal });
      return { users: response.data.data.users, meta: response.data.meta };
    },
    placeholderData: (previous) => previous,
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const { notify, notifyError } = useToast();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
  };

  const onFailure = (error) => notifyError(apiError(error).message);

  const assignRole = useMutation({
    mutationFn: async ({ id, role }) => {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data.data.user;
    },
    onSuccess: (user) => {
      notify(`${user.name} is now ${user.role}`);
      refresh();
    },
    onError: onFailure,
  });

  const setActive = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      return response.data.data.user;
    },
    onSuccess: (user) => {
      notify(`${user.name} ${user.isActive ? 'reactivated' : 'deactivated'}`);
      refresh();
    },
    onError: onFailure,
  });

  return { assignRole, setActive };
};
