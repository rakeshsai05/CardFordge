import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Department from '../models/Department.js';

export const orgRole = (role) => role === 'admin' ? 'main_admin' : role === 'student' ? 'general_user' : role;

export const requireOrganization = asyncHandler(async (req, res, next) => {
  if (orgRole(req.user?.role) === 'platform_owner') return next();
  if (!req.user?.organization) return next(new AppError('This account is not assigned to an organization.', 403));
  if (orgRole(req.user.role) === 'mid_admin' && !await Department.exists({ _id: req.user.department, organization: req.user.organization, isActive: true })) return next(new AppError('Your assigned department is inactive. Contact your organization administrator.', 403));
  next();
});

export const requireOrgRoles = (...roles) => (req, res, next) => {
  const role = orgRole(req.user?.role);
  if (!roles.map(orgRole).includes(role)) return next(new AppError('You do not have permission to perform this action.', 403));
  if (role !== 'platform_owner' && !req.user?.organization) return next(new AppError('Organization membership is required.', 403));
  next();
};

export const managedUserFilter = (user) => {
  const role = orgRole(user.role);
  const filter = { organization: user.organization };
  if (role === 'mid_admin') filter.department = user.department;
  return filter;
};
