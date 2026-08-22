import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';

const app = createApp();

let connecting;

const ensureDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = connectDatabase(undefined, { maxPoolSize: 5 }).catch((error) => {
      connecting = undefined;
      throw error;
    });
  }
  await connecting;
};

export default async (req, res) => {
  await ensureDatabase();
  return app(req, res);
};
