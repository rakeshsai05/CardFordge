import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import IDCard from '../models/IDCard.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/customError.js';

export const listOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find().select('name category code status createdAt').sort({ createdAt: -1 }).lean();
  const summaries = await Promise.all(organizations.map(async (organization) => {
    const [users, departments, cards] = await Promise.all([
      User.countDocuments({ organization: organization._id }),
      Department.countDocuments({ organization: organization._id }),
      IDCard.countDocuments({ organization: organization._id }),
    ]);
    return { ...organization, usage: { users, departments, cards } };
  }));
  res.json({ success: true, data: summaries });
});

export const setOrganizationStatus = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Invalid organization ID.', 400));
  const status = req.body.status;
  if (!['active', 'suspended'].includes(status)) return next(new AppError('Status must be active or suspended.', 400));
  const organization = await Organization.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('name category code status');
  if (!organization) return next(new AppError('Organization not found.', 404));
  await AuditLog.create({ organization: organization._id, actor: req.user._id, action: `organization.${status}`, entityType: 'Organization', entityId: organization._id });
  res.json({ success: true, data: organization });
});
