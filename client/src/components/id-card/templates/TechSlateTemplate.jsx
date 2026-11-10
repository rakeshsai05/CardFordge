import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import SmartChip from '../SmartChip';
import LanyardSlot from '../LanyardSlot';
import BarcodeStrip from '../BarcodeStrip';
import { ShieldCheck, Wifi, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TechSlateTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-slate-950 text-slate-100 p-4 rounded-2xl border border-brand-500/30 flex flex-col justify-between shadow-badge-dark relative overflow-hidden">
        {/* Holographic background sheen */}
        <div className="absolute inset-0 hologram-sheen opacity-10 pointer-events-none" />

        {/* Lanyard slot */}
        <LanyardSlot />

        {/* Header Protocol */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mt-0.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
              Zero-Trust Security Pass
            </span>
          </div>
          <span className="text-[8px] font-mono text-brand-400 bg-brand-950/80 px-1.5 py-0.5 rounded border border-brand-500/30">
            NFC-2026
          </span>
        </div>

        {/* Center: High Density QR + Live Info */}
        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={90}
            template="tech"
          />
          <div className="space-y-1 max-w-[220px]">
            <p className="text-[8px] text-slate-400 leading-tight">
              Scan with any authorized terminal to query real-time accreditation status in MongoDB enclave.
            </p>
            <div className="text-[7px] font-mono text-brand-400/90 truncate bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              UID: {student.verificationId || 'ENCRYPTED-AUTH'}
            </div>
          </div>
        </div>

        {/* Barcode & Security Hotline */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <BarcodeStrip code={student.cardNumber || student.rollNumber || 'UB-8921'} dark={true} />
          
          <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 pt-1">
            <span>Security: +1 (555) 019-2834</span>
            <span>Organization Security</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 text-white p-4 rounded-2xl border border-brand-500/40 flex flex-col justify-between shadow-badge-dark relative overflow-hidden select-none">
      {/* Top Cyber Circuit Accents */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-cyber-400 to-emerald-600" />
      <div className="absolute inset-0 hologram-sheen opacity-15 pointer-events-none" />

      {/* Lanyard Clip Slot */}
      <LanyardSlot />

      {/* Organization Branding */}
      <CollegeBranding
        collegeName={student.collegeName} logoUrl={student.logoUrl}
        subtitle="Digital Identity Credential"
        template="tech"
      />

      {/* Smart Chip & NFC Touchless Wave */}
      <div className="flex items-center justify-between px-1 my-0.5">
        <SmartChip size="md" />
        <div className="flex items-center gap-1 text-[8px] font-mono text-brand-400 bg-brand-950/80 px-2 py-1 rounded-full border border-brand-500/30">
          <Wifi className="w-3 h-3 text-brand-400 rotate-90" />
          <span>TOUCHLESS NFC</span>
        </div>
      </div>

      {/* Student Portrait Photo */}
      <StudentPhoto
        photoUrl={student.avatarUrl}
        fullName={student.fullName}
        template="tech"
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
        template="tech"
      />

      {/* Footer Bar: Card Number & Expiry */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[8px] font-mono">
        <span className="text-slate-400">ID: {student.cardNumber || 'UB-PREVIEW'}</span>
        <span className="font-semibold text-brand-400">
          EXP: {student.validUntil || 'July 2027'}
        </span>
      </div>
    </div>
  );
}
