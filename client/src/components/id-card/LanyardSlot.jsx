import React from 'react';

/**
 * Renders a standard vertical lanyard clip punch slot at the top of the ID badge.
 */
export default function LanyardSlot({ className = '' }) {
  return (
    <div className={`w-full flex justify-center py-1.5 ${className}`}>
      <div className="lanyard-hole" title="Lanyard Strap Clip Hole" />
    </div>
  );
}
