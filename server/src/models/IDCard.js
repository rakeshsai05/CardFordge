import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const idCardSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'ID Card must be linked to a Student record'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID Card must be linked to a User account'],
      index: true,
    },
    cardNumber: {
      type: String,
      unique: true,
      sparse: true, // allows null until approved
      index: true,
    },
    verificationId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    template: {
      type: String,
      enum: {
        values: ['navy', 'emerald', 'crimson', 'white', 'blue', 'tech', 'frost', 'heritage', 'cyber', 'nordic', 'royal', 'minimal', 'dark', 'classic', 'classicCard', 'cleanWhite', 'cleanFrost', 'darkCard', 'heritageCrest', 'techSlate', 'modernBlue', 'minimalCard', 'schoolAtlas', 'healthcare', 'civicSeal', 'eventPass', 'memberClub', 'corporateGrid', 'industrialField', 'hotelAtelier', 'pressPass', 'logisticsFleet', 'financeTrust', 'laboratory', 'securityOfficer', 'communityAid', 'sportsClub', 'retailTeam', 'visitorAccess'],
        message: 'Template must be a valid portrait theme',
      },
      default: 'navy',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'],
        message: 'Invalid ID card status',
      },
      default: 'PENDING',
      index: true,
    },
    validUntil: {
      type: String,
      default: '',
    },
    expiresAt: { type: Date, index: true },
    reissueCount: { type: Number, default: 0, min: 0 },
    lastReissuedAt: { type: Date },
    issueDate: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    midReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    midReviewedAt: { type: Date },
    approvalStage: { type: String, enum: ['mid_admin', 'main_admin', 'complete'], default: 'main_admin' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    revokedReason: {
      type: String,
      trim: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const IDCard = mongoose.model('IDCard', idCardSchema);
export default IDCard;

