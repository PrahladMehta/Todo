import { buildScopeFilter, resolveScope } from '../config/permissions.js';
import { AppError } from '../utils/AppError.js';

export const authorize = (permission) => (req, _res, next) => {
  if (!req.user) {
    next(AppError.unauthorized());
    return;
  }

  const scope = resolveScope(req.user.role, permission);
  if (!scope) {
    next(
      AppError.forbidden(
        `Role "${req.user.role}" is not allowed to ${permission}`,
        'PERMISSION_DENIED',
      ),
    );
    return;
  }

  req.permission = permission;
  req.scope = scope;
  req.scopeFilter = buildScopeFilter(req.user, permission);
  next();
};

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden(`This action requires one of: ${roles.join(', ')}`, 'ROLE_REQUIRED'));
      return;
    }
    next();
  };
