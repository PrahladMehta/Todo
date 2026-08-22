import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

const assignQuery = (req, value) => {
  Object.defineProperty(req, 'query', {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

const formatIssues = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));

export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) assignQuery(req, schemas.query.parse(req.query));
    if (schemas.body) req.body = schemas.body.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(AppError.badRequest('Request validation failed', formatIssues(error), 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
};
