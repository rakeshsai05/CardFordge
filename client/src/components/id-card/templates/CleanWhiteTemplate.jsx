import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function CleanWhiteTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-white text-slate-800 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
        {/* Top Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-900 uppercase">
            Official Student Pass
          </p>
          <p className="text-[9px] text-slate-500">
            Keep this card with you on campus
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={88}
            template="white"
          />
          <div className="space-y-1 max-w-[210px]">
            <p className="text-[9px] text-slate-600 leading-tight">
              Scan this QR code with any phone camera to verify card status.
            </p>
            <p className="text-[8px] font-mono text-slate-400">
              ID: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Help Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ST-2026'} dark={false} />
          
          <div className="flex items-center justify-between text-[8px] text-slate-500 pt-0.5">
            <span>Help: +1 800 123 4567</span>
            <span>If found, return to office</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-800 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
      {/* Top Accent Stripe */}
      <div className="w-full h-1.5 bg-brand-600" />

      {/* Header with Lanyard & College */}
      <div className="px-3 pt-2">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Identity Card"
          template="white"
        />
      </div>

      {/* Main Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="white"
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
          template="white"
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono bg-slate-50">
        <span className="text-slate-500">No: {student.cardNumber || 'PREVIEW'}</span>
        <span className="font-bold text-brand-600">
          Valid Thru: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
