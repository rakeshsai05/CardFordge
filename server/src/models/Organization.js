import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  code: { type: String, unique: true, index: true, default: () => randomBytes(5).toString('hex').toUpperCase() },
  logoUrl: { type: String, default: '', maxlength: 1400000 },
  address: { type: String, default: '', maxlength: 500 },
  contact: { type: String, default: '', maxlength: 80 },
  email: { type: String, default: '', lowercase: true, trim: true },
  website: { type: String, default: '', trim: true },
  description: { type: String, default: '', maxlength: 2000 },
  status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active', index: true },
  approvalMode: { type: String, enum: ['mid_admin', 'main_admin', 'both', 'automatic'], default: 'main_admin' },
  validityMonths: { type: Number, min: 1, max: 120, default: 12 },
  userCategories: { type: [String], default: ['Staff', 'Member', 'Student', 'Employee'] },
  customIdFields: { type: [String], default: [] },
  templateAssignments: { type: [{ category: { type: String, trim: true }, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, template: { type: String, trim: true } }], default: [] },
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);
