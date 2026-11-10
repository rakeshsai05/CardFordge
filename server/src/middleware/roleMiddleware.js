import { AppError } from '../utils/customError.js';

/**
 * Restricts route access to specified roles (e.g. restrictTo('admin')).
 * Must be executed AFTER the protect auth middleware.
 *
 * @param  {...string} roles - Authorized roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const role = req.user?.role === 'admin' ? 'main_admin' : req.user?.role === 'student' ? 'general_user' : req.user?.role;
    const normalizedRoles = roles.map((item) => item === 'admin' ? 'main_admin' : item === 'student' ? 'general_user' : item);
    if (!req.user || !normalizedRoles.includes(role)) {
      return next(
        new AppError(
          'Access forbidden: You do not have the required administrative permissions to perform this action.',
          403
        )
      );
    }
    next();
  };
};

