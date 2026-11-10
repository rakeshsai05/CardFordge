import mongoose from 'mongoose';
import User from '../models/User.js';
import IDCard from '../models/IDCard.js';
import Student from '../models/Student.js';
import VerificationLog from '../models/VerificationLog.js';
import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createCardNumber, createExpiryDate, formatValidity } from '../utils/cardLifecycle.js';
import { v4 as uuidv4 } from 'uuid';
import Organization from '../models/Organization.js';
import AuditLog from '../models/AuditLog.js';
import Department from '../models/Department.js';
import { orgRole } from '../middleware/organizationAccess.js';

const tenantFilter = (req) => ({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { departmentId: req.user.department } : {}) });

/**
 * @desc    Get aggregated system statistics for admin dashboard
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const scope = tenantFilter(req);
  const userIds = await User.find({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { department: req.user.department } : {}) }).distinct('_id');
  const [
    totalStudents,
    pendingCards,
    approvedCards,
    revokedCards,
    expiredCards,
    totalVerifications,
    recentPending,
  ] = await Promise.all([
    Student.countDocuments(scope),
    IDCard.countDocuments({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { user: { $in: userIds } } : {}), status: 'PENDING' }),
    IDCard.countDocuments({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { user: { $in: userIds } } : {}), status: 'APPROVED' }),
    IDCard.countDocuments({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { user: { $in: userIds } } : {}), status: 'REVOKED' }),
    IDCard.countDocuments({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { user: { $in: userIds } } : {}), status: 'APPROVED', expiresAt: { $lte: new Date() } }),
    VerificationLog.countDocuments({ organization: req.user.organization }),
    IDCard.find({ organization: req.user.organization, ...(orgRole(req.user.role) === 'mid_admin' ? { user: { $in: userIds } } : {}), status: 'PENDING' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      pendingCards,
      approvedCards,
      revokedCards,
      totalVerifications,
      stats: {
        totalStudents,
        pendingCards,
        approvedCards,
        revokedCards,
        expiredCards,
        totalVerifications,
      },
      recentPending,
    },
  });
});

/**
 * @desc    Get all card applications with filters & search
 * @route   GET /api/admin/cards
 * @access  Private (Admin)
 */
export const getAllCards = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = { organization: req.user.organization };
  if (orgRole(req.user.role) === 'mid_admin') {
    const userIds = await User.find({ organization: req.user.organization, department: req.user.department }).distinct('_id');
    filter.user = { $in: userIds };
  }

  if (status && status !== 'ALL') {
    if (status.toUpperCase() === 'EXPIRED') filter.$or = [{ status: 'EXPIRED' }, { status: 'APPROVED', expiresAt: { $lte: new Date() } }];
    else filter.status = status.toUpperCase();
  }

  let cards = await IDCard.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'email name' } })
    .sort({ updatedAt: -1 });

  const now = new Date();
  cards = cards.map((card) => {
    if (card.status === 'APPROVED' && card.expiresAt && card.expiresAt <= now) card.status = 'EXPIRED';
    return card;
  });

  // Client search filter across populated student fields
  if (search) {
    const q = search.toLowerCase();
    cards = cards.filter(
      (c) =>
        c.student &&
        ((c.student.fullName || '').toLowerCase().includes(q) ||
          (c.student.rollNumber || '').toLowerCase().includes(q) ||
          (c.student.department || '').toLowerCase().includes(q))
    );
  }

  res.status(200).json({
    success: true,
    count: cards.length,
    data: cards,
  });
});

/**
 * @desc    Get all registered students with department filter
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
export const getAllStudents = asyncHandler(async (req, res) => {
  const { department, search } = req.query;
  const filter = { ...tenantFilter(req) };

  if (department && department !== 'ALL') {
    filter.department = department;
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const students = await Student.find(filter).populate('user', 'name email role isActive').sort({ createdAt: -1 }).lean();
  const ids = students.map((student) => student.user?._id).filter(Boolean);
  const cards = await IDCard.find({ organization: req.user.organization, user: { $in: ids } }).select('user status cardNumber validUntil').lean();
  const cardsByUser = new Map(cards.map((card) => [String(card.user), card]));
  const records = students.map((student) => ({ ...student, card: cardsByUser.get(String(student.user?._id)) || null }));

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

export const getCorrectionRequests = asyncHandler(async (req, res) => {
  const students = await Student.find({ ...tenantFilter(req), 'correctionRequests.status': 'PENDING' }).populate('user', 'name email').sort({ updatedAt: -1 });
  const requests = students.flatMap((student) => student.correctionRequests.filter((request) => request.status === 'PENDING').map((request) => ({ studentId: student._id, studentName: student.fullName, rollNumber: student.rollNumber, requestId: request._id, fields: request.fields, createdAt: request.createdAt })));
  res.json({ success: true, data: requests });
});

export const reviewCorrectionRequest = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ _id: req.params.studentId, ...tenantFilter(req) });
  if (!student) return next(new AppError('User profile not found in your organization scope.', 404));
  const request = student.correctionRequests.id(req.params.requestId);
  if (!request || request.status !== 'PENDING') return next(new AppError('Pending correction request not found.', 404));
  const approve = req.params.action === 'approve';
  const changes = request.fields?.toObject?.() || request.fields || {};
  if (orgRole(req.user.role) === 'mid_admin' && Object.hasOwn(changes, 'department')) return next(new AppError('Only the main administrator can approve a department transfer.', 403));
  if (approve) {
    Object.assign(student, changes);
    if (typeof changes.fullName === 'string') await User.updateOne({ _id: student.user }, { name: changes.fullName.trim() });
    if (changes.department) {
      const targetDepartment = await Department.findOne({ organization: req.user.organization, name: changes.department, isActive: true });
      if (!targetDepartment) return next(new AppError('Requested department is not active in this organization.', 400));
      student.departmentId = targetDepartment._id;
      await User.updateOne({ _id: student.user }, { department: targetDepartment._id });
    }
  }
  request.status = approve ? 'APPROVED' : 'REJECTED';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.reason = String(req.body.reason || '').slice(0, 500);
  await student.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: `profile.correction.${request.status.toLowerCase()}`, entityType: 'Student', entityId: student._id, details: { requestId: request._id } });
  res.json({ success: true, message: approve ? 'Requested official profile changes approved.' : 'Correction request rejected.', data: request });
});

/**
 * @desc    Approve a student ID card application
 * @route   PATCH /api/admin/cards/:id/approve
 * @access  Private (Admin)
 */
export const approveCard = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new AppError('Invalid ID card identifier.', 400));

  const card = await IDCard.findOne({ _id: req.params.id, organization: req.user.organization }).populate('student');

  if (!card) {
    return next(new AppError('ID Card application not found.', 404));
  }

  const organization = await Organization.findById(req.user.organization).select('approvalMode');
  if (orgRole(req.user.role) === 'mid_admin') {
    if (!['mid_admin', 'both'].includes(organization?.approvalMode)) return next(new AppError('This organization requires main administrator approval.', 403));
    card.midReviewedBy = req.user._id;
    card.midReviewedAt = new Date();
    if (organization.approvalMode === 'both') {
      card.approvalStage = 'main_admin';
      await card.save();
      await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'card.reviewed', entityType: 'IDCard', entityId: card._id });
      return res.status(200).json({ success: true, message: 'Department review recorded. The card awaits main administrator approval.', data: card });
    }
  }

  // Generate unique card number if not assigned yet
  if (!card.cardNumber) card.cardNumber = createCardNumber(organization);

  card.status = 'APPROVED';
  card.approvalStage = 'complete';
  card.issueDate = new Date();
  card.expiresAt = createExpiryDate(organization, card.issueDate);
  card.validUntil = formatValidity(card.expiresAt);
  card.reviewedBy = req.user._id;
  card.reviewedAt = new Date();
  card.rejectionReason = undefined;

  await card.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'card.approved', entityType: 'IDCard', entityId: card._id });

  res.status(200).json({
    success: true,
    message: 'ID Card approved and activated with cryptographic verification badge.',
    data: card,
  });
});

/**
 * @desc    Reject a student ID card application
 * @route   PATCH /api/admin/cards/:id/reject
 * @access  Private (Admin)
 */
export const rejectCard = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new AppError('Invalid ID card identifier.', 400));

  const card = await IDCard.findOne({ _id: req.params.id, organization: req.user.organization });

  if (!card) {
    return next(new AppError('ID Card record not found.', 404));
  }

  const organization = await Organization.findById(req.user.organization).select('approvalMode');
  if (orgRole(req.user.role) === 'mid_admin' && !['mid_admin', 'both'].includes(organization?.approvalMode)) return next(new AppError('This organization requires main administrator review.', 403));

  card.status = 'REJECTED';
  card.rejectionReason = reason || 'Photograph or enrollment detail non-compliant with campus standards.';
  card.reviewedBy = req.user._id;
  card.reviewedAt = new Date();

  await card.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'card.rejected', entityType: 'IDCard', entityId: card._id, details: { reason: card.rejectionReason } });

  res.status(200).json({
    success: true,
    message: 'ID Card application rejected.',
    data: card,
  });
});

/**
 * @desc    Revoke an active ID card immediately
 * @route   PATCH /api/admin/cards/:id/revoke
 * @access  Private (Admin)
 */
export const revokeCard = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new AppError('Invalid ID card identifier.', 400));

  const card = await IDCard.findOne({ _id: req.params.id, organization: req.user.organization });

  if (!card) {
    return next(new AppError('ID Card record not found.', 404));
  }

  card.status = 'REVOKED';
  card.revokedReason = reason || 'Card reported lost, stolen, or student status suspended.';
  card.revokedAt = new Date();

  await card.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'card.revoked', entityType: 'IDCard', entityId: card._id, details: { reason: card.revokedReason } });

  res.status(200).json({
    success: true,
    message: 'ID Card revoked successfully. Immediate scanning attempts will report status as REVOKED.',
    data: card,
  });
});

/**
 * @desc    Create a new administrator with all access
 * @route   POST /api/admin/create-admin
 * @access  Private (Admin)
 */
export const reissueCard = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new AppError('Invalid ID card identifier.', 400));
  const card = await IDCard.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!card) return next(new AppError('ID Card record not found in this organization.', 404));
  card.status = 'PENDING';
  card.approvalStage = orgRole(req.user.role) === 'mid_admin' ? 'mid_admin' : 'main_admin';
  card.cardNumber = undefined;
  card.verificationId = uuidv4();
  card.issueDate = undefined;
  card.expiresAt = undefined;
  card.validUntil = '';
  card.revokedAt = undefined;
  card.revokedReason = undefined;
  card.rejectionReason = undefined;
  card.lastReissuedAt = new Date();
  card.reissueCount += 1;
  card.createdBy = req.user._id;
  await card.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'card.reissued', entityType: 'IDCard', entityId: card._id, details: { reissueCount: card.reissueCount } });
  res.json({ success: true, message: 'Replacement ID card request submitted for approval.', data: card });
});

export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, fullName, email, password, department } = req.body;
  const adminName = name || fullName;

  if (!adminName || !email || !password || password.length < 8) {
    return next(new AppError('Please provide administrator name, email, and password.', 400));
  }
  if (!department || !await Department.exists({ _id: department, organization: req.user.organization, isActive: true })) return next(new AppError('Select an active department in your organization for this mid-level administrator.', 400));

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  const newAdmin = await User.create({
    name: adminName,
    email: email.toLowerCase(),
    password,
    role: 'mid_admin',
    organization: req.user.organization,
    department,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: `Administrator '${newAdmin.name}' created with full access privileges.`,
    data: {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt,
    },
  });
});

/**
 * @desc    Get all campus administrators
 * @route   GET /api/admin/admins
 * @access  Private (Admin)
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ organization: req.user.organization, role: 'mid_admin' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: admins.length,
    data: admins,
  });
});

