import { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states
export function NoDataEmptyState({ resourceName = 'items', onAdd }: { resourceName?: string; onAdd?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      }
      title={`No ${resourceName} yet`}
      description={`Get started by creating your first ${resourceName.slice(0, -1)}.`}
      action={onAdd ? { label: `Add ${resourceName.slice(0, -1)}`, onClick: onAdd } : undefined}
    />
  );
}

export function NoSearchResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={onClear ? { label: 'Clear filters', onClick: onClear, variant: 'secondary' } : undefined}
    />
  );
}

export function ErrorEmptyState({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title="Something went wrong"
      description={error || "We couldn't load the data. Please try again."}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  );
}