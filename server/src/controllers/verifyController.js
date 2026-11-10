import IDCard from '../models/IDCard.js';
import VerificationLog from '../models/VerificationLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isCardExpired } from '../utils/cardLifecycle.js';

export const verifyCard = asyncHandler(async (req, res) => {
  const { verificationId } = req.params;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown device';
  const card = await IDCard.findOne({ verificationId }).populate('student').populate('organization', 'name code');
  const status = card ? isCardExpired(card) ? 'EXPIRED' : card.status : 'INVALID';
  await VerificationLog.create({ idCard: card?._id, organization: card?.organization?._id, verificationId, statusResult: status === 'APPROVED' ? 'VERIFIED' : status, ipAddress: String(clientIp).slice(0, 100), userAgent: userAgent.slice(0, 300) });
  if (!card || !card.student) return res.json({ success: true, data: { statusResult: 'INVALID', isAuthentic: false, verificationId, message: 'No active organization record exists for this verification identifier.', verifiedAt: new Date().toISOString() } });
  res.json({
    success: true,
    data: {
      statusResult: status === 'APPROVED' ? 'VERIFIED' : status,
      isAuthentic: status === 'APPROVED',
      verificationId: card.verificationId,
      cardNumber: card.cardNumber || 'PENDING-ISSUANCE',
      template: card.template,
      validUntil: card.validUntil,
      issueDate: card.issueDate,
      institution: card.organization?.name || card.student.collegeName || 'Organization',
      institutionCode: card.organization?.code || null,
      student: { fullName: card.student.fullName, rollNumber: card.student.rollNumber, department: card.student.department, course: card.student.course, academicBatch: card.student.academicBatch, avatarUrl: card.student.avatarUrl },
      verifiedAt: new Date().toISOString(),
    },
  });
});

export const logGateTap = asyncHandler(async (req, res) => {
  const { verificationId } = req.params;
  const gateLocation = String(req.body.gateLocation || 'Main Gate').slice(0, 120);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'NFC reader';
  const card = await IDCard.findOne({ verificationId }).populate('organization', 'name');
  const status = card ? isCardExpired(card) ? 'EXPIRED' : card.status : 'INVALID';
  const granted = Boolean(card && status === 'APPROVED');
  await VerificationLog.create({ idCard: card?._id, organization: card?.organization?._id, verificationId, statusResult: granted ? 'VERIFIED' : status, gateLocation, ipAddress: String(clientIp).slice(0, 100), userAgent: userAgent.slice(0, 300) });
  res.status(200).json({ success: true, message: granted ? 'Access recorded.' : 'Access denied: no active approved ID card found.', data: { granted, timestamp: new Date().toISOString(), gateLocation } });
});
