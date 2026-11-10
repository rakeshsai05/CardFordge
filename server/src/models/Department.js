import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 500 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ organization: 1, name: 1 }, { unique: true });
export default mongoose.model('Department', departmentSchema);
