import Student from '../models/Student.js';
import { AppError } from '../utils/customError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get logged-in student profile
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id });

  if (!student) {
    return next(new AppError('No student profile found for this user account.', 404));
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

/**
 * @desc    Update student personal & academic details
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user._id, organization: req.user.organization });

  if (!student) {
    return next(new AppError('Student profile record not found.', 404));
  }

  const personalFields = ['phone', 'address', 'dateOfBirth', 'gender', 'bloodGroup', 'avatarUrl'];
  const officialFields = ['fullName', 'rollNumber', 'department', 'course', 'yearOfStudy', 'currentSemester', 'academicBatch', 'graduationYear'];
  for (const key of personalFields) if (req.body[key] !== undefined) student[key] = req.body[key];
  const changes = Object.fromEntries(officialFields.filter((key) => req.body[key] !== undefined && String(req.body[key] ?? '') !== String(student[key] ?? '')).map((key) => [key, req.body[key]]));
  if (Object.keys(changes).length) {
    student.correctionRequests.push({ requestedBy: req.user._id, fields: changes, status: 'PENDING' });
  }
  await student.save();
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'profile.updated', entityType: 'Student', entityId: student._id, details: { personalFields: Object.keys(req.body).filter((key) => personalFields.includes(key)), correctionSubmitted: Object.keys(changes).length > 0 } });

  res.status(200).json({
    success: true,
    message: Object.keys(changes).length ? 'Personal details saved. Official detail changes were submitted for organization review.' : 'Personal details updated successfully.',
    data: student,
  });
});

/**
 * @desc    Upload official profile photo
 * @route   POST /api/students/photo
 * @access  Private (Student)
 */
export const uploadPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select an image file to upload.', 400));
  }

  // Convert uploaded buffer into base64 Data URI for immediate persistence & CDN compatibility
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const student = await Student.findOneAndUpdate(
    { user: req.user._id, organization: req.user.organization },
    { avatarUrl: base64Image },
    { new: true }
  );

  if (!student) {
    return next(new AppError('Student profile not found.', 404));
  }

  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'profile.photo.updated', entityType: 'Student', entityId: student._id });

  res.status(200).json({
    success: true,
    message: 'Profile photograph uploaded successfully',
    data: {
      avatarUrl: student.avatarUrl,
    },
  });
});

