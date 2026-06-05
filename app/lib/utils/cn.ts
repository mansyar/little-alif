import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally combine Tailwind class names and resolve conflicts.
 *
 * Wraps `clsx` (for conditional class assembly) with `tailwind-merge`
 * (for de-duplicating conflicting Tailwind utilities).
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-green', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
// hook test
