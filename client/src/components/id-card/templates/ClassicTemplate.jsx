import React from 'react';
import CollegeBranding from '../CollegeBranding';
import StudentPhoto from '../StudentPhoto';
import StudentDetails from '../StudentDetails';
import QRCodeBadge from '../QRCodeBadge';
import Badge from '../../common/Badge';
import { Award, CheckCircle2 } from 'lucide-react';

export default function ClassicTemplate({ student, isBack = false }) {
  if (isBack) {
    return (
      <div className="w-full h-full bg-amber-50 text-amber-950 p-5 rounded-2xl border-2 border-amber-900/30 flex flex-col justify-between shadow-card-lift">
        {/* Back Header */}
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-900" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 font-serif">
              Organization Office
            </span>
          </div>
          <span className="text-[9px] font-mono text-amber-800">
            CLASSIC-EDITION
          </span>
        </div>

        {/* Back Middle: QR Code + Security Statement */}
        <div className="flex items-center gap-4 py-2">
          <QRCodeBadge
            verificationId={student.verificationId}
            size={76}
            template="classic"
          />
          <div className="space-y-1.5 text-left flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-950 font-serif">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
              <span>Accredited Organization Member</span>
            </div>
            <p className="text-[9px] text-amber-900/90 leading-tight">
              Bearer is a certified member in good standing. This card is non-transferable and must be surrendered upon graduation or withdrawal.
            </p>
            <div className="pt-1 text-[8px] font-mono text-amber-800/70">
              Credential Serial: {student.verificationId || 'PENDING'}
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="pt-2 border-t border-amber-900/20 flex items-center justify-between text-[8px] text-amber-900/80 font-serif">
          <span>Official Organization Seal</span>
          <span>Member Services</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fdfbf7] text-amber-950 p-5 rounded-2xl border-2 border-amber-900/30 flex flex-col justify-between shadow-card-lift relative overflow-hidden">
      {/* Heritage double border striping */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-900" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/20 pb-2.5">
        <CollegeBranding
          collegeName={student.collegeName} logoUrl={student.logoUrl}
          template="classic"
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
          template="classic"
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
      <div className="flex items-center justify-between pt-2 border-t border-amber-900/20 text-[9px] font-serif">
        <span className="text-amber-800">Roll: {student.rollNumber}</span>
        <span className="font-bold text-amber-950">
          Valid Through: {student.validUntil || 'Degree Completion'}
        </span>
      </div>
    </div>
  );
}

