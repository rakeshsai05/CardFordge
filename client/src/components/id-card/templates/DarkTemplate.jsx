import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import Badge from '../../common/Badge';
import { ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

export default function DarkTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-card-dark">
        {/* Back Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Cryptographic NFC / QR Gate
            </span>
          </div>
          <span className="text-[9px] font-mono text-brand-400">
            SECURE-ENCLAVE
          </span>
        </div>

        {/* Back Middle: QR Code + Security Statement */}
        <div className="flex items-center gap-4 py-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={76}
            template="dark"
          />
          <div className="space-y-1.5 text-left flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Trust Campus Pass</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">
              Tamper-evident digital token. Any unauthorized modification or revocation updates in real-time on campus edge nodes.
            </p>
            <div className="pt-1 text-[8px] font-mono text-brand-400/80 truncate">
              HASH: {student.verificationId || 'PENDING'}
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-500 font-mono">
          <span>Campus Security Terminal</span>
          <span>{student.collegeName || 'Your Organization'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-card-dark relative overflow-hidden">
      {/* Glowing accent border aura */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-emerald-400 to-indigo-500" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          template="dark"
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
          template="dark"
        />
        <StudentDetails
          fullName={student.fullName}
          rollNumber={student.rollNumber}
          department={student.department}
          course={student.course}
          batch={student.academicBatch}
          bloodGroup={student.bloodGroup}
          semester={student.currentSemester}
          template="dark"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[9px] font-mono">
        <span className="text-slate-400">ID: {student.cardNumber || 'CP-PREVIEW'}</span>
        <span className="font-semibold text-emerald-400">
          Valid Until: {student.validUntil || 'Graduation'}
        </span>
      </div>
    </div>
  );
}

