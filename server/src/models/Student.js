import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    category: { type: String, trim: true, default: 'General User' },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student profile must be associated with a User account'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide the student full legal name'],
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    rollNumber: {
      type: String,
      required: false,
      unique: false,
      uppercase: true,
      trim: true,
    },
    collegeName: {
      type: String,
      default: 'Your Organization',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      maxlength: [1400000, 'Organization logo is too large'],
    },
    department: {
      type: String,
      required: [true, 'Please specify the academic department'],
      trim: true,
      index: true,
    },
    course: {
      type: String,
      required: [true, 'Please specify the enrolled course / degree program'],
      trim: true,
    },
    yearOfStudy: {
      type: String,
      default: '1st Year',
    },
    currentSemester: {
      type: Number,
      min: [1, 'Semester cannot be lower than 1'],
      max: [12, 'Semester cannot exceed 12'],
      default: 1,
    },
    academicBatch: {
      type: String,
      required: [true, 'Please provide the academic batch (e.g. 2023 - 2027)'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Female', 'Male', 'Non-Binary', 'Prefer not to say', 'Other'],
      default: 'Prefer not to say',
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Not Specified'],
      default: 'Not Specified',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    graduationYear: {
      type: Number,
      default: 2027,
    },
    correctionRequests: { type: [{ requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, fields: mongoose.Schema.Types.Mixed, status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }, reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reviewedAt: Date, reason: String, createdAt: { type: Date, default: Date.now } }], default: [] },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ organization: 1, rollNumber: 1 }, { unique: true, partialFilterExpression: { rollNumber: { $type: 'string' }, organization: { $type: 'objectId' } } });

const Student = mongoose.model('Student', studentSchema);
export default Student;

