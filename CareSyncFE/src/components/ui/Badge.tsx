import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium';

  const variants = {
    primary: 
      'bg-primary-100 text-primary-700 ' +
      'dark:bg-primary-900 dark:text-primary-200',
    
    success: 
      'bg-success-100 text-success-700 ' +
      'dark:bg-success-900 dark:text-success-200',
    
    warning: 
      'bg-warning-100 text-warning-700 ' +
      'dark:bg-warning-900 dark:text-warning-200',
    
    error: 
      'bg-error-100 text-error-700 ' +
      'dark:bg-error-900 dark:text-error-200',
    
    info: 
      'bg-info-100 text-info-700 ' +
      'dark:bg-info-900 dark:text-info-200',
    
    gray: 
      'bg-gray-100 text-gray-700 ' +
      'dark:bg-gray-800 dark:text-gray-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const dotColors = {
    primary: 'bg-primary-600 dark:bg-primary-400',
    success: 'bg-success-600 dark:bg-success-400',
    warning: 'bg-warning-600 dark:bg-warning-400',
    error: 'bg-error-600 dark:bg-error-400',
    info: 'bg-info-600 dark:bg-info-400',
    gray: 'bg-gray-600 dark:bg-gray-400',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Status-specific badge components for convenience
export function StatusBadge({ status }: { status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED' }) {
  const statusConfig = {
    PENDING: { variant: 'warning' as const, label: 'Pending', dot: true },
    ACTIVE: { variant: 'primary' as const, label: 'Active', dot: true },
    COMPLETED: { variant: 'success' as const, label: 'Completed', dot: false },
    OVERDUE: { variant: 'error' as const, label: 'Overdue', dot: true },
    CANCELLED: { variant: 'gray' as const, label: 'Cancelled', dot: false },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

// Medication status badge
export function MedicationStatusBadge({ 
  status 
}: { 
  status: 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED' 
}) {
  const statusConfig = {
    ADMINISTERED: { variant: 'success' as const, label: 'Administered' },
    SKIPPED: { variant: 'warning' as const, label: 'Skipped' },
    MISSED: { variant: 'error' as const, label: 'Missed' },
    REFUSED: { variant: 'gray' as const, label: 'Refused' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}