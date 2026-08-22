import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

export const authenticate = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized('Missing bearer token', 'TOKEN_MISSING');

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      throw AppError.unauthorized('Access token is invalid or expired', code);
    }

    const user = await User.findById(payload.sub).lean();
    if (!user) throw AppError.unauthorized('Account no longer exists', 'ACCOUNT_MISSING');
    if (!user.isActive) throw AppError.forbidden('Account is deactivated', 'ACCOUNT_DISABLED');

    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};
