import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function CrimsonInstituteTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-[#881337] text-white p-4 rounded-2xl border border-rose-900 flex flex-col justify-between select-none overflow-hidden relative">
        {/* Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-rose-900">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Academic Identity Credential
          </p>
          <p className="text-[9px] text-rose-200">
            Organization Property
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={86}
            template="crimson"
          />
          <div className="space-y-0.5 max-w-[210px]">
            <p className="text-[9px] text-rose-100 leading-tight">
              Scan with phone camera to check active membership status status.
            </p>
            <p className="text-[8px] font-mono text-rose-300">
              Ref: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Contacts */}
        <div className="space-y-2 pt-2 border-t border-rose-900">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ID-2048'} dark={true} />
          
          <div className="flex items-center justify-between text-[8px] text-rose-200 pt-0.5">
            <span>Dean of Students Office</span>
            <span>Emergency: +1 (800) 555-0199</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 rounded-2xl border border-rose-200 flex flex-col justify-between select-none overflow-hidden shadow-sm relative">
      {/* Top Crimson Banner */}
      <div className="bg-[#881337] text-white px-3 pt-2 pb-2.5">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Identity Badge"
          template="crimson"
        />
      </div>

      {/* Main Student Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="crimson"
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
          template="crimson"
        />
      </div>

      {/* Footer Bar */}
      <div className="px-3 py-2 border-t border-rose-100 flex items-center justify-between text-[9px] font-mono bg-rose-50/50">
        <span className="text-rose-800 font-medium">Card No: {student.cardNumber || 'PREVIEW'}</span>
        <span className="font-bold text-[#881337]">
          Valid Thru: {student.validUntil || 'July 2028'}
        </span>
      </div>
    </div>
  );
}
