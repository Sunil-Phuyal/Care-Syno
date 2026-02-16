import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for proper class merging
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', className)
 * cn('px-4', someCondition && 'px-8') // conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}