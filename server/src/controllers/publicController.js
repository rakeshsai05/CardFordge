import Organization from '../models/Organization.js';
import Department from '../models/Department.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getJoinInfo = asyncHandler(async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  const organization = await Organization.findOne({ code, status: 'active' }).select('name category code logoUrl userCategories templateAssignments');
  if (!organization) return res.status(404).json({ success: false, message: 'Organization code is invalid or the workspace is inactive.' });
  const departments = await Department.find({ organization: organization._id, isActive: true }).select('name');
  res.json({ success: true, data: { organization: { name: organization.name, category: organization.category, code: organization.code, logoUrl: organization.logoUrl }, departments, categories: organization.userCategories } });
});
