import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import SmartChip from '../SmartChip';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';
import { Award, Wifi, Shield } from 'lucide-react';

export default function HeritageCrestTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-[#1c1917] text-amber-100 p-4 rounded-2xl border-2 border-amber-700/60 flex flex-col justify-between shadow-badge relative overflow-hidden">
        {/* Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="flex items-center justify-between border-b border-amber-800/60 pb-1.5 mt-0.5 font-serif">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase tracking-wider text-amber-200">
              Institutional Accreditation
            </span>
          </div>
          <span className="text-[8px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
            CLASSIC-ED
          </span>
        </div>

        {/* Center: QR Code & Verification */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={90}
            template="heritage"
          />
          <div className="space-y-1 max-w-[220px]">
            <p className="text-[8px] text-amber-200/90 leading-tight font-serif">
              Issued under statutory authority of the Organization Board. Scan for tamper-evident digital authentication.
            </p>
            <div className="text-[7px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 truncate">
              CERT: {student.verificationId || 'PENDING'}
            </div>
          </div>
        </div>

        {/* Barcode & Seal */}
        <div className="space-y-2 pt-1 border-t border-amber-800/60">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'UB-8921'} dark={true} />
          
          <div className="flex items-center justify-between text-[7px] text-amber-400 font-serif pt-0.5">
            <span>Authorized Signatory</span>
            <span>Est. 1968</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09] text-amber-100 p-4 rounded-2xl border-2 border-amber-600/60 flex flex-col justify-between shadow-badge relative overflow-hidden select-none">
      {/* Gold Foil Accent Trim */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-600" />
      <div className="absolute inset-0 hologram-sheen opacity-10 pointer-events-none" />

      {/* Lanyard Hole */}
      <LanyardSlot />

      {/* Header */}
      <CollegeBranding
        collegeName={student.collegeName} logoUrl={student.logoUrl}
        subtitle="Organization Member Credential"
        template="heritage"
      />

      {/* Smart Chip & NFC */}
      <div className="flex items-center justify-between px-1 my-0.5">
        <SmartChip size="md" />
        <div className="flex items-center gap-1 text-[8px] font-serif text-amber-200 bg-amber-950/90 px-2 py-1 rounded-full border border-amber-700/60">
          <Wifi className="w-3 h-3 text-amber-400 rotate-90" />
          <span>CONTACTLESS SMART ID</span>
        </div>
      </div>

      {/* Student Photo */}
      <StudentPhoto
        photoUrl={student.avatarUrl}
        fullName={student.fullName}
        template="heritage"
        status={student.status}
      />

      {/* Student Details */}
      <StudentDetails
        fullName={student.fullName}
        rollNumber={student.rollNumber}
        department={student.department}
        course={student.course}
        batch={student.academicBatch}
        bloodGroup={student.bloodGroup}
        semester={student.currentSemester}
        template="heritage"
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-amber-800/70 text-[8px] font-mono">
        <span className="text-amber-400/80">REG: {student.cardNumber || 'UB-PREVIEW'}</span>
        <span className="font-bold text-amber-300">
          EXP: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
