import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH, env } from '../../config/env.js';
import { passport } from '../../config/passport.js';
import { AppError } from '../../utils/AppError.js';
import { sendCreated, sendSuccess } from '../../utils/apiResponse.js';
import { signOauthState, verifyOauthState } from '../../utils/jwt.js';
import { permissionMatrix } from '../../config/permissions.js';
import { User } from '../../models/User.js';
import {
  getSessionsForUser,
  issueSession,
  loginWithPassword,
  publicUser,
  registerUser,
  revokeAllSessions,
  revokeRefreshToken,
  rotateRefreshToken,
} from './auth.service.js';

const requestContext = (req) => ({
  userAgent: req.get('user-agent') ?? null,
  ip: req.ip,
});

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: env.refreshTtlMs,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
  });
};

export const register = async (req, res) => {
  const session = await registerUser(req.body, requestContext(req));
  setRefreshCookie(res, session.refreshToken);
  sendCreated(res, { user: session.user, accessToken: session.accessToken });
};

export const login = async (req, res) => {
  const session = await loginWithPassword(req.body, requestContext(req));
  setRefreshCookie(res, session.refreshToken);
  sendSuccess(res, { data: { user: session.user, accessToken: session.accessToken } });
};

export const refresh = async (req, res) => {
  const session = await rotateRefreshToken(
    req.cookies?.[REFRESH_COOKIE_NAME],
    requestContext(req),
  );
  setRefreshCookie(res, session.refreshToken);
  sendSuccess(res, { data: { user: session.user, accessToken: session.accessToken } });
};

export const logout = async (req, res) => {
  const result = await revokeRefreshToken(req.cookies?.[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  sendSuccess(res, { data: { revokedSessions: result.revoked } });
};

export const logoutAll = async (req, res) => {
  const result = await revokeAllSessions(req.user._id, 'logout_all');
  clearRefreshCookie(res);
  sendSuccess(res, { data: { revokedSessions: result.revoked } });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  sendSuccess(res, {
    data: {
      user: publicUser(user),
      permissions: permissionMatrix().find((entry) => entry.role === user.role)?.permissions ?? {},
    },
  });
};

export const sessions = async (req, res) => {
  const active = await getSessionsForUser(req.user._id);
  sendSuccess(res, { data: { sessions: active } });
};

const assertGoogleEnabled = () => {
  if (!env.googleEnabled) {
    throw AppError.serviceUnavailable(
      'Google sign-in is not configured on this server',
      'GOOGLE_AUTH_DISABLED',
    );
  }
};

export const googleStart = (req, res, next) => {
  assertGoogleEnabled();
  const state = signOauthState({ redirect: req.query.redirect ?? null });
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    state,
    prompt: 'select_account',
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  assertGoogleEnabled();

  try {
    verifyOauthState(req.query.state);
  } catch {
    next(
      AppError.badRequest(
        'OAuth state is missing, invalid or expired. Restart the sign-in flow.',
        undefined,
        'OAUTH_STATE_INVALID',
      ),
    );
    return;
  }

  passport.authenticate('google', { session: false }, async (error, user) => {
    try {
      if (error) throw error;
      if (!user) {
        throw AppError.unauthorized('Google did not authorise this sign-in', 'GOOGLE_AUTH_FAILED');
      }

      const session = await issueSession(user, requestContext(req));
      setRefreshCookie(res, session.refreshToken);
      res.redirect(`${env.FRONTEND_URL}/auth/callback?provider=google`);
    } catch (callbackError) {
      const code = callbackError?.code ?? 'GOOGLE_AUTH_FAILED';

      if (code === 'ACCOUNT_DISABLED') {
        res.redirect(`${env.FRONTEND_URL}/account-deactivated`);
        return;
      }

      res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(code)}`);
    }
  })(req, res, next);
};
