import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Organization from '../models/Organization.js';
import { jwtSecret } from '../utils/jwtSecret.js';

/**
 * Protects routes by validating JWT Bearer token from the Authorization header.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from HTTP Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not signed in. Please provide a valid authentication token.', 401)
    );
  }

  // 2. Cryptographically verify token signature
  const decoded = jwt.verify(
    token,
    jwtSecret
  );

  // 3. Confirm user still exists in database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user account associated with this token no longer exists.', 401)
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError('This user account has been deactivated. Please contact campus administration.', 403)
    );
  }

  if (currentUser.organization && currentUser.role !== 'platform_owner') {
    const organization = await Organization.findById(currentUser.organization).select('status');
    if (!organization || organization.status !== 'active') return next(new AppError('This organization workspace is inactive. Contact the platform owner.', 403));
  }

  // 4. Attach verified user document to request context
  req.user = currentUser;
  next();
});

