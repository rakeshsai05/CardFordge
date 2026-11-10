import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function ModernBlueTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
        {/* Top Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-slate-800">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Organization Identity Pass
          </p>
          <p className="text-[9px] text-slate-400">
            Authorized Identity Card
          </p>
        </div>

        {/* Center QR Code */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={88}
            template="blue"
          />
          <div className="space-y-1 max-w-[210px]">
            <p className="text-[9px] text-slate-300 leading-tight">
              Scan QR code to check if student is active in organization records.
            </p>
            <p className="text-[8px] font-mono text-slate-400">
              Ref: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Security */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ST-2026'} dark={true} />
          
          <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
            <span>Campus Security Office</span>
            <span>Emergency: 911</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-card relative select-none overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-3 pt-2">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Student Identification Card"
          template="blue"
        />
      </div>

      {/* Main Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="blue"
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
          template="blue"
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono bg-slate-50">
        <span className="text-slate-500">ID: {student.cardNumber || 'PREVIEW'}</span>
        <span className="font-bold text-slate-900">
          Valid Thru: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
