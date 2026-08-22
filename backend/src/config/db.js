import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export const connectDatabase = async (uri = env.MONGODB_URI, options = {}) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
    autoIndex: true,
    ...options,
  });
  logger.info({ database: mongoose.connection.name }, 'MongoDB connected');
  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

export const databaseHealth = async () => {
  if (mongoose.connection.readyState !== 1) {
    return { status: 'down', readyState: mongoose.connection.readyState };
  }
  await mongoose.connection.db.admin().command({ ping: 1 });
  return { status: 'up', name: mongoose.connection.name };
};
