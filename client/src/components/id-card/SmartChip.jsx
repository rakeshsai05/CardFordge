import React from 'react';

/**
 * Renders a simulated ISO/IEC 7816 contact microchip element.
 * Adds an authentic smartcard / NFC aesthetic to the digital credential.
 */
export default function SmartChip({ size = 'md', className = '' }) {
  const isSmall = size === 'sm';

  return (
    <div
      className={`relative rounded-md smart-chip-grid p-1 border border-amber-600/60 flex items-center justify-center overflow-hidden flex-shrink-0 ${
        isSmall ? 'w-8 h-6' : 'w-10 h-8'
      } ${className}`}
      title="Integrated NFC / RFID Microchip"
    >
      {/* Microchip internal contact trace divisions */}
      <div className="w-full h-full border border-amber-900/40 rounded flex flex-col justify-between p-0.5">
        <div className="w-full h-[1px] bg-amber-900/30" />
        <div className="flex justify-between items-center w-full my-auto">
          <div className="w-1.5 h-1.5 rounded-full border border-amber-900/50 bg-amber-200/50" />
          <div className="w-2.5 h-[1px] bg-amber-900/40" />
          <div className="w-1.5 h-1.5 rounded-full border border-amber-900/50 bg-amber-200/50" />
        </div>
        <div className="w-full h-[1px] bg-amber-900/30" />
      </div>
    </div>
  );
}
