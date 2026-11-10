import React from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function CollegeBranding({
  collegeName = 'Your Organization',
  subtitle = 'Identity Card',
  logoUrl,
  template = 'white',
  className,
}) {
  const isBlue = template === 'blue' || template === 'dark' || template === 'tech';
  const isClassic = template === 'classic' || template === 'heritage';

  return (
    <div className={cn('w-full flex items-center justify-between gap-2 px-1', className)}>
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm',
            isBlue
              ? 'bg-brand-600 text-white'
              : isClassic
              ? 'bg-amber-800 text-amber-100'
              : 'bg-brand-50 text-brand-700 border border-brand-200'
          )}
        >
          {logoUrl ? <img src={logoUrl} alt="Organization logo" className="h-full w-full rounded-lg object-contain bg-white p-0.5" /> : <Building2 className="w-4 h-4" />}
        </div>
        <div className="min-w-0 text-left">
          <h4
            className={cn(
              'text-[11px] font-bold uppercase tracking-tight leading-tight truncate max-w-[170px]',
              isBlue ? 'text-white' : isClassic ? 'text-amber-950 font-serif' : 'text-slate-900'
            )}
            title={collegeName}
          >
            {collegeName}
          </h4>
          <p
            className={cn(
              'text-[8px] font-medium truncate max-w-[170px]',
              isBlue ? 'text-slate-300' : isClassic ? 'text-amber-800' : 'text-slate-500'
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>
      <span
        className={cn(
          'text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
          isBlue
            ? 'bg-slate-800 text-slate-300 border border-slate-700'
            : isClassic
            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-serif'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        )}
      >
        Verified
      </span>
    </div>
  );
}
