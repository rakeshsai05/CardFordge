import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import IDCard from '../models/IDCard.js';
import { signToken } from '../utils/generateToken.js';
import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Organization from '../models/Organization.js';
import Department from '../models/Department.js';
import { createCardNumber, createExpiryDate, formatValidity } from '../utils/cardLifecycle.js';

/**
 * @desc    Register a new student account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, rollNumber, department, course, batch, organizationCode, category } = req.body;

  if (!fullName || !email || !password || password.length < 8 || !rollNumber) {
    return next(new AppError('Provide your name, email, organization ID, and a password with at least 8 characters.', 400));
  }

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  const organization = await Organization.findOne({ code: String(organizationCode || '').trim().toUpperCase(), status: 'active' });
  if (!organization) return next(new AppError('Enter a valid organization access code. Ask your organization administrator for the code.', 400));
  if (!organization.userCategories.includes(category || 'Member')) return next(new AppError('Select a user category provided by your organization.', 400));
  const departmentDoc = await Department.findOne({ _id: department, organization: organization._id, isActive: true });
  if (!departmentDoc) return next(new AppError('Select an active department from this organization.', 400));

  // Check if ID already assigned within this organization.
  const existingStudent = await Student.findOne({ organization: organization._id, rollNumber: rollNumber.toUpperCase() });
  if (existingStudent) {
    return next(new AppError('A student profile with this Roll Number already exists.', 409));
  }

  // 1. Create User account
  const newUser = await User.create({
    name: fullName,
    email: email.toLowerCase(),
    password,
    role: 'general_user',
    organization: organization._id,
    category: category || 'Member',
    department: departmentDoc._id,
  });

  // 2. Create associated Student profile
  const newStudent = await Student.create({
    user: newUser._id,
    organization: organization._id,
    category: category || 'Member',
    departmentId: departmentDoc._id,
    fullName,
    rollNumber: rollNumber.toUpperCase(),
    department: departmentDoc.name,
    course: course || 'Undergraduate Degree',
    collegeName: organization.name,
    logoUrl: organization.logoUrl || '',
    academicBatch: batch || '2023 - 2027',
  });

  // 3. Create initial pending ID card record
  const assignment = organization.templateAssignments.find((item) => item.category === (category || 'Member') && String(item.department || '') === String(departmentDoc._id)) || organization.templateAssignments.find((item) => item.category === (category || 'Member') && !item.department);
  const autoApprove = organization.approvalMode === 'automatic';
  const issueDate = autoApprove ? new Date() : undefined;
  const expiresAt = autoApprove ? createExpiryDate(organization, issueDate) : undefined;
  const newCard = await IDCard.create({
    student: newStudent._id,
    user: newUser._id,
    organization: organization._id,
    createdBy: newUser._id,
    status: autoApprove ? 'APPROVED' : 'PENDING',
    issueDate,
    ...(autoApprove ? { cardNumber: createCardNumber(organization), expiresAt, validUntil: formatValidity(expiresAt) } : {}),
    approvalStage: autoApprove ? 'complete' : organization.approvalMode === 'mid_admin' ? 'mid_admin' : 'main_admin',
    template: assignment?.template || 'minimal',
  });

  // 4. Sign JWT
  const token = signToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Student account registered successfully',
    data: {
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      student: newStudent,
      card: newCard,
    },
  });
});

export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, fullName, email, password, organizationName, organizationCategory, logoUrl, address, contact, website, description } = req.body;
  const adminName = name || fullName;

  if (mongoose.connection.readyState !== 1) {
    return next(
      new AppError(
        'Database is temporarily reconnecting. Check the API health endpoint and your MongoDB Atlas network access settings, then retry.',
        503
      )
    );
  }

  if (!adminName || !email || !password || password.length < 8) {
    return next(new AppError('Provide your name, email, and a password with at least 8 characters.', 400));
  }

  if (!organizationName?.trim() || !organizationCategory?.trim()) return next(new AppError('Please provide your organization name and category.', 400));

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  const organization = await Organization.create({ name: organizationName.trim(), category: organizationCategory.trim(), logoUrl: logoUrl || '', address: address || '', contact: contact || '', email: email.toLowerCase(), website: website || '', description: description || '' });

  // Organization owner; permissions remain limited to this isolated workspace.
  const newAdmin = await User.create({
    name: adminName,
    email: email.toLowerCase(),
    password,
    role: 'main_admin',
    organization: organization._id,
    isActive: true,
  });

  const token = signToken(newAdmin);

  res.status(201).json({
    success: true,
    message: 'Organization workspace created successfully.',
    data: {
      token,
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        organization: { id: organization._id, name: organization.name, code: organization.code },
      },
    },
  });
});

/**
 * @desc    Authenticate user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  // Find user and explicitly select password hash
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email credentials or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated. Please contact campus admin.', 403));
  }
  if (user.organization) {
    const organization = await Organization.findById(user.organization).select('status');
    if (!organization || organization.status !== 'active') return next(new AppError('This organization workspace is inactive. Contact the platform owner.', 403));
  }

  // Sign JWT
  const token = signToken(user);

  // If student, pull linked student record
  let student = null;
  let card = null;
  if (['student', 'general_user'].includes(user.role)) {
    student = await Student.findOne({ user: user._id, organization: user.organization });
    if (student) {
      card = await IDCard.findOne({ student: student._id });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department,
        category: user.category,
      },
      student,
      card,
    },
  });
});

/**
 * @desc    Get currently authenticated user details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  let student = null;
  let card = null;

  if (['student', 'general_user'].includes(req.user.role)) {
    student = await Student.findOne({ user: req.user._id, organization: req.user.organization });
    if (student) {
      card = await IDCard.findOne({ student: student._id });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        organization: req.user.organization,
        department: req.user.department,
        category: req.user.category,
        createdAt: req.user.createdAt,
      },
      student,
      card,
    },
  });
});

