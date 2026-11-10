import jwt from 'jsonwebtoken';
import { jwtSecret } from './jwtSecret.js';

/**
 * Signs a stateless JSON Web Token (JWT) with user identity claims.
 *
 * @param {Object} user - Mongoose User document
 * @returns {string} Signed JWT string
 */
export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
      jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

