import React from 'react';
import { Droplet } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function StudentDetails({
  fullName = 'Card Holder',
  rollNumber = 'ORG-0001',
  department = 'Team / Department',
  course = 'Role / Title',
  batch = '',
  bloodGroup = '',
  semester = '',
  template = 'white',
  className,
}) {
  const isBlue = template === 'blue' || template === 'dark' || template === 'tech';
  const isClassic = template === 'classic' || template === 'heritage';

  return (
    <div className={cn('w-full text-center space-y-1 px-2', className)}>
      {/* Card holder */}
      <h3
        className={cn(
          'text-base font-bold tracking-tight truncate leading-tight',
          isBlue ? 'text-slate-900' : isClassic ? 'text-amber-950 font-serif' : 'text-slate-900'
        )}
        title={fullName}
      >
        {fullName}
      </h3>

      {/* Roll Number Tag */}
      <div className="flex justify-center">
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider',
            isBlue
              ? 'bg-slate-100 text-slate-800 border border-slate-200'
              : isClassic
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-serif'
              : 'bg-brand-50 text-brand-700 border border-brand-200'
          )}
        >
          ID: {rollNumber}
        </span>
      </div>

      {/* Course & Department */}
      <div className="space-y-0.5 text-center pt-0.5">
        <p
          className={cn(
            'text-[11px] font-bold truncate leading-tight',
            isClassic ? 'text-amber-900 font-serif' : 'text-slate-800'
          )}
        >
          {course}
        </p>
        <p
          className={cn(
            'text-[9px] font-medium truncate',
            isClassic ? 'text-amber-800/80' : 'text-slate-500'
          )}
        >
          {department}
        </p>
      </div>

      {/* Optional holder details */}
      <div className="flex items-center justify-center gap-2 pt-1 text-[8px] font-medium">
        {batch && <span
          className={cn(
            'px-2 py-0.5 rounded border',
            isClassic
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          )}
        >
          Member since {batch}
        </span>}

        {bloodGroup && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded border font-semibold bg-rose-50 text-rose-700 border-rose-200">
            <Droplet className="w-2.5 h-2.5 fill-current" />
            <span>{bloodGroup}</span>
          </span>
        )}
      </div>
    </div>
  );
}
