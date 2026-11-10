import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import Badge from '../../common/Badge';
import { ShieldCheck, Barcode, CheckCircle2 } from 'lucide-react';

export default function MinimalTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-slate-50 text-slate-800 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-card-lift">
        {/* Back Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Institutional Verification Protocol
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">
            REV-2026-v1
          </span>
        </div>

        {/* Back Middle: QR Code + Security Statement */}
        <div className="flex items-center gap-4 py-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={76}
            template="minimal"
          />
          <div className="space-y-1.5 text-left flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity Card</span>
            </div>
            <p className="text-[9px] text-slate-600 leading-tight">
              Scan this dynamic QR code using any smartphone or campus terminal to verify live accreditation and active enrollment status.
            </p>
            <div className="pt-1 text-[8px] font-mono text-slate-400">
              Token: {student.verificationId || 'PENDING-AUTH'}
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
          <span>Campus Security: +1 (555) 019-2834</span>
          <span>Found? Return to Dean of Students</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-card-lift relative overflow-hidden">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          template="minimal"
        />
        <Badge
          variant={student.status === 'APPROVED' ? 'success' : 'warning'}
          size="sm"
          dot
        >
          {student.status || 'ACTIVE'}
        </Badge>
      </div>

      {/* Main Body */}
      <div className="flex items-center gap-4 py-2">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="minimal"
        />
        <StudentDetails
          fullName={student.fullName}
          rollNumber={student.rollNumber}
          department={student.department}
          course={student.course}
          batch={student.academicBatch}
          bloodGroup={student.bloodGroup}
          semester={student.currentSemester}
          template="minimal"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9px] font-mono">
        <span className="text-slate-500">ID: {student.cardNumber || 'CP-PREVIEW'}</span>
        <span className="font-semibold text-brand-600">
          Expires: {student.validUntil || 'Graduation'}
        </span>
      </div>
    </div>
  );
}

