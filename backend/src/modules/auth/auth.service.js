import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { RefreshToken } from '../../models/RefreshToken.js';
import { User } from '../../models/User.js';
import { AppError } from '../../utils/AppError.js';
import { createRefreshToken, hashRefreshToken, signAccessToken } from '../../utils/jwt.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl ?? null,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt ?? null,
  createdAt: user.createdAt,
});

const persistRefreshToken = async ({ user, family, context }) => {
  const { raw, hash } = createRefreshToken();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hash,
    family: family ?? crypto.randomUUID(),
    expiresAt: new Date(Date.now() + env.refreshTtlMs),
    userAgent: context?.userAgent ?? null,
    ip: context?.ip ?? null,
  });
  return raw;
};

export const issueSession = async (user, context, family) => {
  const refreshToken = await persistRefreshToken({ user, family, context });
  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken,
  };
};

export const registerUser = async ({ name, email, password }, context) => {
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    lastLoginAt: new Date(),
  });

  return issueSession(user, context);
};

export const loginWithPassword = async ({ email, password }, context) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = await verifyPassword(password, user?.passwordHash);

  if (!user || !passwordMatches) {
    throw AppError.unauthorized('Email or password is incorrect', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw AppError.forbidden('Account is deactivated', 'ACCOUNT_DISABLED');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return issueSession(user, context);
};

export const rotateRefreshToken = async (rawToken, context) => {
  if (!rawToken) {
    throw AppError.unauthorized('Refresh token cookie is missing', 'REFRESH_TOKEN_MISSING');
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashRefreshToken(rawToken) });
  if (!stored) {
    throw AppError.unauthorized('Refresh token is not recognised', 'REFRESH_TOKEN_INVALID');
  }

  if (stored.revokedAt) {
    if (stored.revokedReason === 'reuse') {
      throw AppError.unauthorized(
        'This session family was revoked after a replayed refresh token was detected. Please sign in again.',
        'REFRESH_TOKEN_REUSED',
      );
    }

    if (stored.revokedReason !== 'rotated') {
      throw AppError.unauthorized(
        'This session was signed out. Please sign in again.',
        'REFRESH_TOKEN_REVOKED',
      );
    }

    await RefreshToken.updateMany(
      { family: stored.family, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: 'reuse' } },
    );
    logger.warn(
      { userId: String(stored.user), family: stored.family },
      'refresh token reuse detected, family revoked',
    );
    throw AppError.unauthorized(
      'Refresh token was already used. All sessions in this family have been revoked.',
      'REFRESH_TOKEN_REUSED',
    );
  }

  if (stored.expiresAt.getTime() <= Date.now()) {
    throw AppError.unauthorized('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
  }

  const user = await User.findById(stored.user);
  if (!user) {
    throw AppError.unauthorized('This account no longer exists', 'ACCOUNT_MISSING');
  }
  if (!user.isActive) {
    throw AppError.forbidden('Account is deactivated', 'ACCOUNT_DISABLED');
  }

  const session = await issueSession(user, context, stored.family);

  stored.revokedAt = new Date();
  stored.revokedReason = 'rotated';
  stored.replacedByHash = hashRefreshToken(session.refreshToken);
  await stored.save();

  return session;
};

export const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return { revoked: 0 };
  const result = await RefreshToken.updateOne(
    { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: 'logout' } },
  );
  return { revoked: result.modifiedCount };
};

export const revokeAllSessions = async (userId, reason = 'admin') => {
  const result = await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } },
  );
  return { revoked: result.modifiedCount };
};

export const findOrCreateGoogleUser = async (profile) => {
  const providerId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase();
  const emailVerified = profile.emails?.[0]?.verified !== false;
  const name = profile.displayName || email?.split('@')[0] || 'Google user';
  const avatarUrl = profile.photos?.[0]?.value ?? null;

  const linked = await User.findOne({
    providers: { $elemMatch: { provider: 'google', providerId } },
  });
  if (linked) {
    if (!linked.isActive) throw AppError.forbidden('Account is deactivated', 'ACCOUNT_DISABLED');
    linked.lastLoginAt = new Date();
    await linked.save();
    return linked;
  }

  if (!email) {
    throw AppError.badRequest(
      'Google account did not return an email address',
      undefined,
      'GOOGLE_EMAIL_MISSING',
    );
  }

  const byEmail = await User.findOne({ email }).select('+providers');
  if (byEmail) {
    if (!emailVerified) {
      throw AppError.conflict(
        'An account with this email already exists but the Google email is unverified',
        'GOOGLE_EMAIL_UNVERIFIED',
      );
    }
    if (!byEmail.isActive) throw AppError.forbidden('Account is deactivated', 'ACCOUNT_DISABLED');

    byEmail.providers.push({ provider: 'google', providerId });
    if (!byEmail.avatarUrl && avatarUrl) byEmail.avatarUrl = avatarUrl;
    byEmail.lastLoginAt = new Date();
    await byEmail.save();
    return byEmail;
  }

  return User.create({
    name,
    email,
    avatarUrl,
    role: 'user',
    providers: [{ provider: 'google', providerId }],
    lastLoginAt: new Date(),
  });
};

export const getSessionsForUser = (userId) =>
  RefreshToken.find({ user: userId, revokedAt: null })
    .select('family createdAt expiresAt userAgent ip')
    .sort({ createdAt: -1 })
    .lean();

export { publicUser };
