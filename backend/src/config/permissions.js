export const ROLES = ['user', 'admin'];

export const SCOPES = { OWN: 'own', ANY: 'any' };

export const PERMISSIONS = {
  user: {
    'task:read': SCOPES.OWN,
    'task:create': SCOPES.OWN,
    'task:update': SCOPES.OWN,
    'task:delete': SCOPES.OWN,
    'task:upload': SCOPES.OWN,
    'user:read': SCOPES.OWN,
    'user:update': SCOPES.OWN,
  },
  admin: {
    'task:read': SCOPES.ANY,
    'task:create': SCOPES.ANY,
    'task:update': SCOPES.ANY,
    'task:delete': SCOPES.ANY,
    'task:upload': SCOPES.ANY,
    'user:read': SCOPES.ANY,
    'user:update': SCOPES.ANY,
    'user:delete': SCOPES.ANY,
    'user:stats': SCOPES.ANY,
    'role:assign': SCOPES.ANY,
  },
};

const RESOURCE_FILTERS = {
  task: {
    [SCOPES.OWN]: (user) => ({ owner: user._id }),
    [SCOPES.ANY]: () => ({}),
  },
  user: {
    [SCOPES.OWN]: (user) => ({ _id: user._id }),
    [SCOPES.ANY]: () => ({}),
  },
  role: {
    [SCOPES.ANY]: () => ({}),
  },
};

export const resolveScope = (role, permission) => PERMISSIONS[role]?.[permission] ?? null;

export const hasPermission = (role, permission) => Boolean(resolveScope(role, permission));

export const buildScopeFilter = (user, permission) => {
  const scope = resolveScope(user.role, permission);
  if (!scope) return null;
  const resource = permission.split(':')[0];
  const builder = RESOURCE_FILTERS[resource]?.[scope];
  if (!builder) return null;
  return builder(user);
};

export const permissionMatrix = () =>
  ROLES.map((role) => ({ role, permissions: PERMISSIONS[role] }));
