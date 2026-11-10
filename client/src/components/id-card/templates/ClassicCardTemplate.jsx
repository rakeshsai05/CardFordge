import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function ClassicCardTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-[#fcfaf7] text-slate-800 p-4 rounded-2xl border-2 border-amber-800/30 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
        {/* Top Lanyard Hole */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-amber-900/10 font-serif">
          <p className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
            Identity Record
          </p>
          <p className="text-[9px] text-amber-800/80">
            Organization Property
          </p>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={88}
            template="classic"
          />
          <div className="space-y-1 max-w-[210px]">
            <p className="text-[9px] text-amber-900 leading-tight font-serif">
              Scan with mobile phone to verify membership status status.
            </p>
            <p className="text-[8px] font-mono text-amber-800/60">
              Code: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Notice */}
        <div className="space-y-2 pt-2 border-t border-amber-900/10">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ST-2026'} dark={false} />
          
          <div className="flex items-center justify-between text-[8px] text-amber-900/70 font-serif pt-0.5">
            <span>Dean of Students Office</span>
            <span>Valid on Campus</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fdfbf7] text-slate-900 rounded-2xl border-2 border-amber-800/30 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
      {/* Top Gold Stripe */}
      <div className="w-full h-1.5 bg-amber-700" />

      {/* Header */}
      <div className="px-3 pt-2">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Identity Card"
          template="classic"
        />
      </div>

      {/* Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="classic"
          status={student.status}
        />

        <StudentDetails
          fullName={student.fullName}
          rollNumber={student.rollNumber}
          department={student.department}
          course={student.course}
          batch={student.academicBatch}
          bloodGroup={student.bloodGroup}
          semester={student.currentSemester}
          template="classic"
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-amber-900/10 flex items-center justify-between text-[9px] font-mono bg-amber-50/50">
        <span className="text-amber-900/80">Roll: {student.rollNumber || 'PREVIEW'}</span>
        <span className="font-bold text-amber-900">
          Valid Thru: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
