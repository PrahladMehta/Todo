import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain, hash) => {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
};
