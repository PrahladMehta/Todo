export const queryKeys = {
  tasks: ['tasks'],
  taskList: (filters) => ['tasks', 'list', filters],
  task: (id) => ['tasks', 'detail', id],
  weeks: ['weeks'],
  weekSummary: (params) => ['weeks', 'summary', params],
  users: ['users'],
  userList: (filters) => ['users', 'list', filters],
  me: ['me'],
};
