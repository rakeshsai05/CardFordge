import IDCard from '../models/IDCard.js';
import Student from '../models/Student.js';
import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Organization from '../models/Organization.js';
import { orgRole } from '../middleware/organizationAccess.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createCardNumber, createExpiryDate, formatValidity } from '../utils/cardLifecycle.js';
import { isCardExpired } from '../utils/cardLifecycle.js';
import { v4 as uuidv4 } from 'uuid';

export const getAvailableTemplates = asyncHandler(async (req, res) => {
  if (['main_admin', 'mid_admin', 'admin'].includes(orgRole(req.user.role))) return res.json({ success: true, data: IDCard.schema.path('template').enumValues });
  const organization = await Organization.findById(req.user.organization).select('templateAssignments');
  const matching = (organization?.templateAssignments || []).filter((item) => item.category === req.user.category && (!item.department || String(item.department) === String(req.user.department)));
  const departmentSpecific = matching.filter((item) => String(item.department || '') === String(req.user.department || ''));
  const templates = [...new Set((departmentSpecific.length ? departmentSpecific : matching).map((item) => item.template))];
  res.json({ success: true, data: templates.length ? templates : ['minimal'] });
});

export const bulkGenerateCards = asyncHandler(async (req, res, next) => {
  const ids = [...new Set(Array.isArray(req.body.userIds) ? req.body.userIds.map(String) : [])];
  if (!ids.length || ids.length > 100 || ids.some((id) => !/^[a-f\d]{24}$/i.test(id))) return next(new AppError('Select between 1 and 100 valid people for bulk generation.', 400));
  const org = await Organization.findById(req.user.organization);
  const filter = { _id: { $in: ids }, organization: req.user.organization, role: { $in: ['general_user', 'student'] } };
  if (orgRole(req.user.role) === 'mid_admin') filter.department = req.user.department;
  const users = await User.find(filter).select('_id category department');
  if (users.length !== ids.length) return next(new AppError('One or more selected people are outside your permitted organization scope.', 403));
  const profiles = await Student.find({ user: { $in: ids }, organization: req.user.organization });
  if (profiles.length !== ids.length) return next(new AppError('Each selected person must have a profile before card generation.', 400));
  const results = [];
  for (const user of users) {
    const matching = (org?.templateAssignments || []).filter((item) => item.category === user.category && (!item.department || String(item.department) === String(user.department)));
    const specific = matching.filter((item) => String(item.department || '') === String(user.department || ''));
    const assigned = [...new Set((specific.length ? specific : matching).map((item) => item.template))];
    const template = req.body.template || assigned[0] || 'minimal';
    if (assigned.length && !assigned.includes(template)) return next(new AppError(`Template is not assigned to category '${user.category}'.`, 403));
    let card = await IDCard.findOne({ user: user._id, organization: req.user.organization });
    const autoApprove = org?.approvalMode === 'automatic';
    const issueDate = autoApprove ? new Date() : undefined;
    const expiresAt = autoApprove ? createExpiryDate(org, issueDate) : undefined;
    if (!card) card = new IDCard({ user: user._id, student: profiles.find((profile) => String(profile.user) === String(user._id))._id, organization: req.user.organization, createdBy: req.user._id });
    card.template = template;
    card.verificationId = uuidv4();
    card.cardNumber = undefined;
    card.status = autoApprove ? 'APPROVED' : 'PENDING';
    card.approvalStage = autoApprove ? 'complete' : org?.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin';
    card.issueDate = issueDate;
    card.expiresAt = expiresAt;
    card.validUntil = expiresAt ? formatValidity(expiresAt) : '';
    if (autoApprove) card.cardNumber = createCardNumber(org);
    await card.save();
    results.push(card);
  }
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'cards.bulk_generated', entityType: 'IDCard', details: { count: results.length } });
  res.status(201).json({ success: true, count: results.length, data: results });
});

/**
 * @desc    Apply for or update digital ID card template
 * @route   POST /api/id-cards/apply
 * @access  Private (Student)
 */
export const applyForCard = asyncHandler(async (req, res, next) => {
  const { template } = req.body;
  const organization = await Organization.findById(req.user.organization).select('approvalMode validityMonths code templateAssignments');

  if (['general_user', 'student'].includes(orgRole(req.user.role))) {
    const matches = (organization?.templateAssignments || []).filter((item) => item.category === req.user.category && (!item.department || String(item.department) === String(req.user.department)));
    const departmentSpecific = matches.filter((item) => String(item.department || '') === String(req.user.department || ''));
    const allowedTemplates = new Set((departmentSpecific.length ? departmentSpecific : matches).map((item) => item.template));
    if (allowedTemplates.size ? !allowedTemplates.has(template) : template !== 'minimal') return next(new AppError('This template is not assigned to your user category. Ask your organization administrator to assign it.', 403));
  }

  let student = await Student.findOne({ user: req.user._id });
  if (!student) {
    if (['admin', 'main_admin', 'mid_admin'].includes(req.user.role)) {
      return res.status(200).json({
        success: true,
        message: 'Admin preview theme updated.',
        data: { template: template || 'navy' },
      });
    }
    return next(new AppError('Please complete your student profile before applying for an ID card.', 400));
  }

  let card = await IDCard.findOne({ student: student._id, user: req.user._id, organization: req.user.organization });
  const autoApprove = organization?.approvalMode === 'automatic';
  const issueDate = autoApprove ? new Date() : undefined;
  const expiresAt = autoApprove ? createExpiryDate(organization, issueDate) : undefined;

  if (!card) {
    card = await IDCard.create({
      student: student._id,
      user: req.user._id,
      organization: req.user.organization,
      createdBy: req.user._id,
      template: template || 'minimal',
      status: autoApprove ? 'APPROVED' : 'PENDING',
      approvalStage: autoApprove ? 'complete' : organization?.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin',
      issueDate,
      ...(autoApprove ? { cardNumber: createCardNumber(organization), expiresAt, validUntil: formatValidity(expiresAt) } : {}),
    });
  } else {
    // If card was rejected or pending, allow re-applying or template update
    const nextTemplate = template || card.template;
    if (card.template !== nextTemplate || ['REJECTED', 'REVOKED'].includes(card.status) || isCardExpired(card)) {
      card.status = 'PENDING';
      card.approvalStage = 'main_admin';
      if (autoApprove) card.approvalStage = 'complete';
      card.verificationId = uuidv4();
      card.cardNumber = undefined;
      card.issueDate = undefined;
      card.expiresAt = undefined;
      card.validUntil = '';
      card.status = autoApprove ? 'APPROVED' : 'PENDING';
      card.approvalStage = autoApprove ? 'complete' : organization?.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin';
      card.issueDate = issueDate;
      card.expiresAt = expiresAt;
      card.validUntil = expiresAt ? formatValidity(expiresAt) : '';
      if (autoApprove) card.cardNumber = createCardNumber(organization);
    }
    card.template = nextTemplate;
    if (card.status === 'REJECTED') {
      card.status = autoApprove ? 'APPROVED' : 'PENDING';
      card.approvalStage = autoApprove ? 'complete' : organization?.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin';
      if (autoApprove) { card.cardNumber = createCardNumber(organization); card.issueDate = issueDate; card.expiresAt = expiresAt; card.validUntil = formatValidity(expiresAt); }
      card.rejectionReason = undefined;
    }
    await card.save();
  }

  const responseCard = card.toObject();
  if (isCardExpired(card) && card.status === 'APPROVED') responseCard.status = 'EXPIRED';
  res.status(200).json({
    success: true,
    message: 'Card application submitted for administrative review',
    data: responseCard,
  });
});

/**
 * @desc    Get currently logged-in student's ID card
 * @route   GET /api/id-cards/my-card
 * @access  Private (Student)
 */
export const getMyCard = asyncHandler(async (req, res, next) => {
  let student = await Student.findOne({ user: req.user._id });
  if (!student) {
    return next(new AppError('No student record found.', 404));
  }

  const card = await IDCard.findOne({ student: student._id, user: req.user._id, organization: req.user.organization }).populate('student');

  if (!card) {
    return next(new AppError('No digital ID card found for this student account.', 404));
  }

  const responseCard = card.toObject();
  if (isCardExpired(card) && card.status === 'APPROVED') responseCard.status = 'EXPIRED';
  res.status(200).json({
    success: true,
    data: responseCard,
  });
});

