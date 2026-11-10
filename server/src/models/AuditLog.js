import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, maxlength: 120 },
  entityType: { type: String, required: true, maxlength: 80 },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
