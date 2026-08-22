import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, _res, next) => {
  next(
    AppError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`, 'ROUTE_NOT_FOUND'),
  );
};

const mapError = (error) => {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      code: 'INVALID_IDENTIFIER',
      message: `Value provided for "${error.path}" is not a valid ${error.kind}`,
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
    return {
      status: 409,
      code: 'DUPLICATE_KEY',
      message: `A record with this ${field} already exists`,
    };
  }

  if (error.type === 'entity.too.large') {
    return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' };
  }

  if (error.type === 'entity.parse.failed') {
    return { status: 400, code: 'INVALID_JSON', message: 'Request body is not valid JSON' };
  }

  return { status: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong' };
};

export const errorHandler = (error, req, res, _next) => {
  const mapped = mapError(error);

  const context = { err: error, requestId: req.id, path: req.originalUrl, method: req.method };
  if (mapped.status >= 500) logger.error(context, mapped.message);
  else logger.warn(context, mapped.message);

  if (mapped.status >= 500 && !env.isProduction) {
    mapped.details = { name: error.name, message: error.message };
  }

  sendError(res, mapped);
};
