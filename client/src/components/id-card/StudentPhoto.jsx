import React from 'react';
import { User, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function StudentPhoto({
  photoUrl,
  fullName = 'Student Photo',
  template = 'white',
  className,
  status = 'APPROVED',
}) {
  const isClassic = template === 'classic' || template === 'heritage';

  return (
    <div className={cn('relative mx-auto my-1 flex-shrink-0', className)}>
      <div
        className={cn(
          'w-24 h-28 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border-2',
          isClassic
            ? 'border-amber-800/40 bg-amber-50'
            : 'border-slate-200 bg-slate-100'
        )}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <User className="w-8 h-8" />
            <span className="text-[7px] uppercase tracking-wider mt-1">Photo</span>
          </div>
        )}
      </div>

      {status === 'APPROVED' && (
        <div
          className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-emerald-500 text-white shadow-sm border border-white"
          title="Active Student"
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}
    </div>
  );
}
