import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function EmeraldCampusTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-[#064e3b] text-white p-4 rounded-2xl border border-emerald-800 flex flex-col justify-between select-none overflow-hidden relative">
        {/* Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-emerald-800">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Organization Identity Pass
          </p>
          <p className="text-[9px] text-emerald-200">
            Student Access Pass
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={86}
            template="emerald"
          />
          <div className="space-y-0.5 max-w-[210px]">
            <p className="text-[9px] text-emerald-100 leading-tight">
              Scan with phone camera to verify card validity status.
            </p>
            <p className="text-[8px] font-mono text-emerald-300">
              ID: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Contacts */}
        <div className="space-y-2 pt-2 border-t border-emerald-800">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ID-2048'} dark={true} />
          
          <div className="flex items-center justify-between text-[8px] text-emerald-200 pt-0.5">
            <span>Help Desk: +1 (800) 555-0199</span>
            <span>Return to Student Affairs</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 rounded-2xl border border-emerald-200 flex flex-col justify-between select-none overflow-hidden shadow-sm relative">
      {/* Top Emerald Header Banner */}
      <div className="bg-[#064e3b] text-white px-3 pt-2 pb-2.5">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Organization Credential"
          template="emerald"
        />
      </div>

      {/* Main Student Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="emerald"
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
          template="emerald"
        />
      </div>

      {/* Footer Bar */}
      <div className="px-3 py-2 border-t border-emerald-100 flex items-center justify-between text-[9px] font-mono bg-emerald-50/50">
        <span className="text-emerald-800 font-medium">Card No: {student.cardNumber || 'PREVIEW'}</span>
        <span className="font-bold text-[#064e3b]">
          Valid Thru: {student.validUntil || 'July 2028'}
        </span>
      </div>
    </div>
  );
}
