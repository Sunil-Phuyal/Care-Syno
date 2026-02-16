import { ReactNode } from 'react';
import { Spinner } from './Spinner';
import { cn } from '../../utils/cn';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  blur?: boolean;
  spinner?: boolean;
  children?: ReactNode;
}

export function LoadingOverlay({
  show,
  message = 'Loading...',
  blur = true,
  spinner = true,
  children,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-white/90 dark:bg-gray-900/90',
          blur && 'backdrop-blur-sm'
        )}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {spinner && <Spinner size="xl" />}
        {message && (
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-50">
            {message}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

// Partial overlay (for specific sections)
interface PartialLoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function PartialLoadingOverlay({
  show,
  message,
  className,
}: PartialLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className={cn('absolute inset-0 z-10 flex items-center justify-center', className)}>
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" />
      <div className="relative z-10 text-center">
        <Spinner size="lg" />
        {message && (
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}