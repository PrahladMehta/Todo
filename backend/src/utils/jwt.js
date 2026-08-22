import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL, jwtid: crypto.randomUUID() },
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

export const createRefreshToken = () => {
  const raw = crypto.randomBytes(48).toString('base64url');
  return { raw, hash: hashRefreshToken(raw) };
};

export const hashRefreshToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

export const signOauthState = (payload = {}) =>
  jwt.sign({ ...payload, nonce: crypto.randomUUID() }, env.OAUTH_STATE_SECRET, {
    expiresIn: '5m',
  });

export const verifyOauthState = (state) => jwt.verify(state, env.OAUTH_STATE_SECRET);
