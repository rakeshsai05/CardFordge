import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const weakSecret = 'campuspass_super_secure_jwt_secret_key_2026_dev_mode';
const configured = process.env.JWT_SECRET?.trim();
const isPlaceholder = !configured || configured.length < 32 || configured === weakSecret || configured.toLowerCase().startsWith('replace-with-');
if (process.env.NODE_ENV === 'production' && isPlaceholder) {
  throw new Error('Set JWT_SECRET to a unique value with at least 32 characters before starting in production.');
}
if (isPlaceholder) {
  console.warn('[Auth] A temporary random JWT key is in use. Set JWT_SECRET (32+ characters) to keep sessions across restarts.');
}

export const jwtSecret = !isPlaceholder
  ? configured
  : randomBytes(32).toString('hex');
