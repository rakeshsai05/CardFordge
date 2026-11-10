import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind CSS classes cleanly without specificity conflicts.
 * Example: cn('px-4 py-2 bg-blue-500', isPrimary && 'bg-blue-700', customClass)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

