import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import IDCard from '../models/IDCard.js';
import AuditLog from '../models/AuditLog.js';
import { v4 as uuidv4 } from 'uuid';
import { createCardNumber, createExpiryDate, formatValidity } from '../utils/cardLifecycle.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/customError.js';
import { orgRole, managedUserFilter } from '../middleware/organizationAccess.js';

const writeAudit = (req, action, entityType, entityId, details = {}) => AuditLog.create({
  organization: req.user.organization, actor: req.user._id, action, entityType, entityId, details,
});

export const getWorkspace = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.user.organization);
  if (!organization) return next(new AppError('Organization workspace not found.', 404));
  const scope = { organization: organization._id };
  const userScope = { ...scope };
  if (orgRole(req.user.role) === 'mid_admin') userScope.department = req.user.department;
  const managedIds = orgRole(req.user.role) === 'mid_admin' ? await User.find(userScope).distinct('_id') : null;
  const cardScope = { ...scope, ...(managedIds ? { user: { $in: managedIds } } : {}) };
  const departmentScope = orgRole(req.user.role) === 'mid_admin' ? { ...scope, _id: req.user.department } : scope;
  const [users, departments, cards, pendingCards, approvedCards, expiredCards, recentUsers, recentActivity] = await Promise.all([
    User.countDocuments(userScope), Department.countDocuments(departmentScope), IDCard.countDocuments(cardScope),
    IDCard.countDocuments({ ...cardScope, status: 'PENDING' }), IDCard.countDocuments({ ...cardScope, status: 'APPROVED' }),
    IDCard.countDocuments({ ...cardScope, status: 'APPROVED', expiresAt: { $lte: new Date() } }),
    User.find(userScope).select('name email role category createdAt').sort({ createdAt: -1 }).limit(6),
    AuditLog.find({ ...scope, ...(managedIds ? { actor: { $in: managedIds } } : {}) }).populate('actor', 'name email').sort({ createdAt: -1 }).limit(10),
  ]);
  res.json({ success: true, data: { organization, stats: { users, departments, cards, pendingCards, approvedCards, expiredCards }, recentUsers, recentActivity } });
});

export const updateWorkspace = asyncHandler(async (req, res, next) => {
  const allowed = ['name', 'category', 'logoUrl', 'address', 'contact', 'email', 'website', 'description', 'approvalMode', 'validityMonths'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const organization = await Organization.findOneAndUpdate({ _id: req.user.organization }, updates, { new: true, runValidators: true });
  if (!organization) return next(new AppError('Organization workspace not found.', 404));
  if (typeof updates.name === 'string') await Student.updateMany({ organization: organization._id }, { $set: { collegeName: organization.name } });
  if (typeof updates.logoUrl === 'string') await Student.updateMany({ organization: organization._id, $or: [{ logoUrl: '' }, { logoUrl: { $exists: false } }] }, { $set: { logoUrl: updates.logoUrl } });
  await writeAudit(req, 'organization.updated', 'Organization', organization._id, { fields: Object.keys(updates) });
  res.json({ success: true, data: organization });
});

export const listDepartments = asyncHandler(async (req, res) => {
  const filter = { organization: req.user.organization };
  if (orgRole(req.user.role) === 'mid_admin') filter._id = req.user.department;
  res.json({ success: true, data: await Department.find(filter).sort({ name: 1 }) });
});

export const createDepartment = asyncHandler(async (req, res, next) => {
  const name = String(req.body.name || '').trim();
  if (!name) return next(new AppError('Department name is required.', 400));
  const department = await Department.create({ organization: req.user.organization, name, description: req.body.description || '' });
  await writeAudit(req, 'department.created', 'Department', department._id, { name });
  res.status(201).json({ success: true, data: department });
});

export const updateDepartment = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Invalid department ID.', 400));
  const department = await Department.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, { name: req.body.name, description: req.body.description, isActive: req.body.isActive }, { new: true, runValidators: true });
  if (!department) return next(new AppError('Department not found in this organization.', 404));
  await writeAudit(req, 'department.updated', 'Department', department._id);
  res.json({ success: true, data: department });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = managedUserFilter(req.user);
  if (orgRole(req.user.role) === 'main_admin' && req.query.department && req.query.department !== 'ALL') {
    const departmentExists = await Department.exists({ _id: req.query.department, organization: req.user.organization, isActive: true });
    filter.department = departmentExists ? req.query.department : null;
  }
  if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
  const users = await User.find(filter).select('-password').populate('department', 'name').sort({ createdAt: -1 }).limit(500);
  const ids = users.map((user) => user._id);
  const profiles = await Student.find({ organization: req.user.organization, user: { $in: ids } }).select('user fullName rollNumber department course academicBatch phone address').lean();
  const profileByUser = new Map(profiles.map((profile) => [String(profile.user), profile]));
  res.json({ success: true, count: users.length, data: users.map((user) => ({ ...user.toObject(), profile: profileByUser.get(String(user._id)) || null })) });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role = 'general_user', department, category } = req.body;
  const assignedRole = orgRole(role);
  if (!name?.trim() || !email || !password || password.length < 8) return next(new AppError('Name, email, and a password of at least 8 characters are required.', 400));
  if (!['mid_admin', 'general_user'].includes(assignedRole)) return next(new AppError('Only mid-level admins and general users can be created here.', 400));
  if (orgRole(req.user.role) === 'mid_admin' && (assignedRole !== 'general_user' || String(department) !== String(req.user.department))) return next(new AppError('You can only add general users to your assigned department.', 403));
  if (department && !await Department.exists({ _id: department, organization: req.user.organization, isActive: true })) return next(new AppError('Department must be active and belong to your organization.', 400));
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return next(new AppError('An account with this email already exists.', 409));
  const departmentDoc = department ? await Department.findOne({ _id: department, organization: req.user.organization, isActive: true }) : null;
  if (assignedRole === 'mid_admin' && !departmentDoc) return next(new AppError('A department is required for a mid-level administrator.', 400));
  if (assignedRole === 'general_user' && !departmentDoc) return next(new AppError('A department is required for this user. Create or select an organization department.', 400));
  const organization = await Organization.findById(req.user.organization).select('name logoUrl userCategories approvalMode templateAssignments');
  if (!organization.userCategories.includes(category || 'General User') && assignedRole === 'general_user') return next(new AppError('Choose a user category configured for this organization.', 400));
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: assignedRole, organization: req.user.organization, department: department || (assignedRole === 'mid_admin' ? null : req.user.department), category: category || 'General User' });
  if (assignedRole === 'general_user') {
    const assignment = organization.templateAssignments.find((item) => item.category === user.category && String(item.department || '') === String(user.department || '')) || organization.templateAssignments.find((item) => item.category === user.category && !item.department);
    const profile = await Student.create({ user: user._id, organization: req.user.organization, departmentId: user.department || undefined, category: user.category, fullName: user.name, rollNumber: String(req.body.identifier || `ORG-${uuidv4().slice(0, 8)}`).toUpperCase(), collegeName: organization.name, logoUrl: organization.logoUrl || '', department: departmentDoc?.name || 'General', course: user.category, academicBatch: String(new Date().getFullYear()) });
    const autoApprove = organization.approvalMode === 'automatic';
    const issueDate = autoApprove ? new Date() : undefined;
    const expiresAt = autoApprove ? createExpiryDate(organization, issueDate) : undefined;
    await IDCard.create({ student: profile._id, user: user._id, organization: req.user.organization, createdBy: req.user._id, template: assignment?.template || req.body.template || 'minimal', status: autoApprove ? 'APPROVED' : 'PENDING', issueDate, ...(autoApprove ? { cardNumber: createCardNumber(organization), expiresAt, validUntil: formatValidity(expiresAt) } : {}), approvalStage: autoApprove ? 'complete' : organization.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin' });
  }
  await writeAudit(req, 'user.created', 'User', user._id, { role: assignedRole, department: user.department });
  res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, category: user.category, isActive: user.isActive } });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Invalid user ID.', 400));
  const filter = { _id: req.params.id, ...managedUserFilter(req.user), role: { $nin: ['main_admin', 'admin', 'platform_owner'] } };
  const target = await User.findOne(filter);
  if (!target) return next(new AppError('User not found in your permitted organization scope.', 404));
  if (req.body.role !== undefined && orgRole(req.body.role) !== orgRole(target.role)) return next(new AppError('Create a new account with the required role. Existing account roles cannot be changed.', 403));
  if (req.body.department !== undefined) {
    const department = req.body.department || null;
    if (department && !await Department.exists({ _id: department, organization: req.user.organization, isActive: true })) return next(new AppError('Department must be active and belong to your organization.', 400));
    target.department = department;
  }
  if (typeof req.body.name === 'string') target.name = req.body.name.trim();
  if (typeof req.body.category === 'string') {
    const organization = await Organization.findById(req.user.organization).select('userCategories');
    if (!organization.userCategories.includes(req.body.category.trim())) return next(new AppError('Choose a category configured for this organization.', 400));
    target.category = req.body.category.trim();
  }
  if (orgRole(target.role) === 'mid_admin' && !target.department) return next(new AppError('Mid-level administrators must stay assigned to an active department.', 400));
  if (orgRole(req.user.role) === 'main_admin' && typeof req.body.isActive === 'boolean') target.isActive = req.body.isActive;
  await target.save();
  if (orgRole(target.role) === 'general_user' && (req.body.department !== undefined || req.body.category !== undefined)) {
    const profileUpdates = {};
    if (req.body.department !== undefined) {
      const department = target.department ? await Department.findById(target.department).select('name') : null;
      profileUpdates.departmentId = target.department || null;
      if (department) profileUpdates.department = department.name;
    }
    if (req.body.category !== undefined) { profileUpdates.category = target.category; profileUpdates.course = target.category; }
    await Student.updateOne({ user: target._id, organization: req.user.organization }, { $set: profileUpdates });
  }
  await writeAudit(req, 'user.updated', 'User', target._id, { role: target.role, department: target.department, isActive: target.isActive });
  res.json({ success: true, data: { id: target._id, name: target.name, email: target.email, role: target.role, department: target.department, category: target.category, isActive: target.isActive } });
});

export const updateManagedProfile = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Invalid user ID.', 400));
  const target = await User.findOne({ _id: req.params.id, ...managedUserFilter(req), role: { $nin: ['main_admin', 'admin', 'platform_owner'] } });
  if (!target) return next(new AppError('User not found in your permitted organization scope.', 404));
  const student = await Student.findOne({ user: target._id, organization: req.user.organization });
  if (!student) return next(new AppError('The selected user does not have an ID profile.', 404));
  const fields = ['fullName', 'rollNumber', 'department', 'course', 'yearOfStudy', 'currentSemester', 'academicBatch', 'graduationYear', 'phone', 'address', 'dateOfBirth', 'gender', 'bloodGroup'];
  if (req.body.department !== undefined) {
    const requestedDepartment = await Department.findOne({ organization: req.user.organization, name: req.body.department, isActive: true });
    if (!requestedDepartment) return next(new AppError('Department must be an active department in your organization.', 400));
    if (orgRole(req.user.role) === 'mid_admin' && String(requestedDepartment._id) !== String(req.user.department)) return next(new AppError('You cannot move a person outside your assigned department.', 403));
    student.departmentId = requestedDepartment._id;
    student.department = requestedDepartment.name;
    target.department = requestedDepartment._id;
  }
  for (const field of fields) if (field !== 'department' && req.body[field] !== undefined) student[field] = req.body[field];
  if (typeof req.body.fullName === 'string') target.name = req.body.fullName.trim();
  await Promise.all([student.save(), target.save()]);
  await writeAudit(req, 'user.profile.updated', 'Student', student._id, { managedUser: target._id });
  res.json({ success: true, data: student });
});

export const getOrganizationCategories = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.user.organization).select('userCategories');
  res.json({ success: true, data: org?.userCategories || ['Staff', 'Member', 'Student', 'Employee'] });
});

export const updateCategories = asyncHandler(async (req, res, next) => {
  const categories = [...new Set((Array.isArray(req.body.categories) ? req.body.categories : []).map((item) => String(item).trim()).filter(Boolean))].slice(0, 40);
  if (!categories.length) return next(new AppError('Keep at least one user category.', 400));
  const org = await Organization.findByIdAndUpdate(req.user.organization, { userCategories: categories }, { new: true });
  await writeAudit(req, 'categories.updated', 'Organization', org._id, { count: categories.length });
  res.json({ success: true, data: org.userCategories });
});

export const getTemplateAssignments = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.user.organization).populate('templateAssignments.department', 'name');
  const assignments = org?.templateAssignments || [];
  res.json({ success: true, data: orgRole(req.user.role) === 'mid_admin' ? assignments.filter((item) => String(item.department?._id || item.department) === String(req.user.department)) : assignments });
});

export const setTemplateAssignment = asyncHandler(async (req, res, next) => {
  const { category, department, template, remove = false } = req.body;
  if (!category?.trim() || !template?.trim() || !IDCard.schema.path('template').enumValues.includes(template)) return next(new AppError('Choose a valid user category and an existing ID card template.', 400));
  if (department && !await Department.exists({ _id: department, organization: req.user.organization, isActive: true })) return next(new AppError('Department must be active and belong to this organization.', 400));
  const org = await Organization.findById(req.user.organization);
  org.templateAssignments = org.templateAssignments.filter((item) => !(item.category === category.trim() && String(item.department || '') === String(department || '') && item.template === template));
  if (!remove) org.templateAssignments.push({ category: category.trim(), department: department || undefined, template });
  await org.save();
  await writeAudit(req, remove ? 'template.unassigned' : 'template.assigned', 'Organization', org._id, { category, department: department || null, template });
  res.json({ success: true, data: org.templateAssignments });
});

