import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import SmartChip from '../SmartChip';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';
import { ShieldCheck, Wifi, CheckCircle2 } from 'lucide-react';

export default function CleanFrostTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-badge relative overflow-hidden">
        {/* Subtle background tint */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />

        {/* Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mt-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
              Campus Security Protocol
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            REV-2026
          </span>
        </div>

        {/* Center: QR Code & Verification Instruction */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={90}
            template="frost"
          />
          <div className="space-y-1 max-w-[220px]">
            <p className="text-[8px] text-slate-600 leading-tight">
              Instant mobile verification. Scan to inspect real-time enrollment status and physical campus gate clearance.
            </p>
            <div className="text-[7px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate">
              HASH: {student.verificationId || 'PENDING'}
            </div>
          </div>
        </div>

        {/* Barcode & Footer Notice */}
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'UB-8921'} dark={false} />
          
          <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5">
            <span>Found? Return to Registrar</span>
            <span>Emergency: Ext. 911</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between shadow-badge relative overflow-hidden select-none">
      {/* Top Emerald Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyber-600" />

      {/* Lanyard Hole */}
      <LanyardSlot />

      {/* College Header */}
      <CollegeBranding
        collegeName={student.collegeName} logoUrl={student.logoUrl}
        subtitle="Organization Credential"
        template="frost"
      />

      {/* Smart Chip & NFC Indicator */}
      <div className="flex items-center justify-between px-1 my-0.5">
        <SmartChip size="md" />
        <div className="flex items-center gap-1 text-[8px] font-mono text-teal-700 bg-teal-50 px-2 py-1 rounded-full border border-teal-200">
          <Wifi className="w-3 h-3 text-teal-600 rotate-90" />
          <span>SMART NFC BADGE</span>
        </div>
      </div>

      {/* Student Portrait Photo */}
      <StudentPhoto
        photoUrl={student.avatarUrl}
        fullName={student.fullName}
        template="frost"
        status={student.status}
      />

      {/* Student Info Details */}
      <StudentDetails
        fullName={student.fullName}
        rollNumber={student.rollNumber}
        department={student.department}
        course={student.course}
        batch={student.academicBatch}
        bloodGroup={student.bloodGroup}
        semester={student.currentSemester}
        template="frost"
      />

      {/* Footer Bar */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[8px] font-mono">
        <span className="text-slate-500">CARD: {student.cardNumber || 'UB-PREVIEW'}</span>
        <span className="font-bold text-teal-700">
          VALID: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
