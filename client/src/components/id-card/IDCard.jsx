import React from 'react';
import { cn } from '../../utils/cn';
import { getTemplate } from './templateLibrary';

/**
 * Vertical Student ID Card Component.
 * Formatted for standard portrait hanging badges (54 × 86 mm).
 */
export default function IDCard({
  student,
  template = 'navy',
  isFlipped = false,
  onFlip,
  cardRef,
  className,
}) {
  const selected = getTemplate(template);
  const SelectedComponent = selected.component;
  const isLandscape = selected.orientation === 'Landscape';

  return (
    <div className={cn('perspective-1000 w-full max-w-[420px] mx-auto select-none', className)}>
      <div
        ref={cardRef}
        id="campuscard-element"
        onClick={onFlip}
        className={cn(
          `relative w-full ${isLandscape ? 'aspect-[86/54]' : 'aspect-[54/86]'} transition-transform duration-700 transform-style-3d cursor-pointer rounded-2xl shadow-card hover:shadow-card-hover`,
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden rounded-2xl">
          <SelectedComponent student={student} isBack={false} />
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl">
          <SelectedComponent student={student} isBack={true} />
        </div>
      </div>
    </div>
  );
}
