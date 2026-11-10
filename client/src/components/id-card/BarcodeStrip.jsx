import React from 'react';

/**
 * Renders a crisp Code-128 barcode simulation using SVG.
 */
export default function BarcodeStrip({ code = 'UB-2026-9041', height = 24, className = '', dark = false }) {
  // Pattern of bar widths
  const bars = [2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`w-full max-w-[190px] h-[${height}px]`}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <g fill={dark ? '#f8fafc' : '#0f172a'}>
          {bars.map((width, idx) => {
            const x = idx * 2.9;
            return idx % 2 === 0 ? (
              <rect key={idx} x={x} y="0" width={width * 0.7} height="20" />
            ) : null;
          })}
        </g>
      </svg>
      <span className={`text-[8px] font-mono tracking-widest mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        *{code}*
      </span>
    </div>
  );
}
