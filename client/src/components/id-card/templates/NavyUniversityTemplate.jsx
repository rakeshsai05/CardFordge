import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';

export default function NavyOrganizationTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 flex flex-col justify-between select-none overflow-hidden relative">
        {/* Lanyard Slot */}
        <LanyardSlot />

        {/* Back Header */}
        <div className="text-center pb-2 border-b border-slate-800">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Organization Identity Card
          </p>
          <p className="text-[9px] text-slate-400">
            Authorized Campus Credential
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={86}
            template="navy"
          />
          <div className="space-y-0.5 max-w-[210px]">
            <p className="text-[9px] text-slate-300 leading-tight">
              Scan QR code with any phone camera to verify membership status.
            </p>
            <p className="text-[8px] font-mono text-brand-300">
              Ref: {student.verificationId || 'PENDING'}
            </p>
          </div>
        </div>

        {/* Barcode & Security Contacts */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'ORG-0001'} dark={true} />
          
          <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
            <span>Campus Security: +1 (800) 555-0199</span>
            <span>If found, return to Registrar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 rounded-2xl border border-slate-200 flex flex-col justify-between select-none overflow-hidden shadow-sm relative">
      {/* Top Navy Banner */}
      <div className="bg-[#0f172a] text-white px-3 pt-2 pb-2.5">
        <LanyardSlot />
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          subtitle="Identity Card"
          template="navy"
        />
      </div>

      {/* Main Student Body */}
      <div className="px-3 py-2 flex flex-col items-center flex-1 justify-around">
        <StudentPhoto
          photoUrl={student.avatarUrl}
          fullName={student.fullName}
          template="navy"
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
          template="navy"
        />
      </div>

      {/* Footer Bar */}
      <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono bg-slate-50">
        <span className="text-slate-500 font-medium">Card No: {student.cardNumber || 'PREVIEW'}</span>
        <span className="font-bold text-[#0f172a]">
          Valid Thru: {student.validUntil || 'July 2028'}
        </span>
      </div>
    </div>
  );
}
