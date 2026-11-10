import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    idCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IDCard',
    },
    verificationId: {
      type: String,
      required: true,
      index: true,
    },
    statusResult: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'EXPIRED', 'REVOKED', 'REJECTED', 'INVALID'],
      required: true,
    },
    gateLocation: {
      type: String,
      default: 'Online Verification Scan',
    },
    ipAddress: {
      type: String,
      default: 'Unknown IP',
    },
    userAgent: {
      type: String,
      default: 'Unknown Device',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);
export default VerificationLog;

