import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={cn(
                'w-4 h-4 rounded border-gray-300 text-primary-600 ' +
                  'focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 ' +
                  'dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-primary-400 ' +
                  'disabled:opacity-50 disabled:cursor-not-allowed ' +
                  'transition-colors cursor-pointer',
                error && 'border-error-500 focus:ring-error-500',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${checkboxId}-error`
                  : description
                  ? `${checkboxId}-description`
                  : undefined
              }
              {...props}
            />
          </div>
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${checkboxId}-description`}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1 text-sm text-error-500 dark:text-error-400 ml-7"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox Group
interface CheckboxGroupProps {
  label?: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function CheckboxGroup({
  label,
  description,
  error,
  children,
  className,
}: CheckboxGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      )}
      <div className="space-y-2">{children}</div>
      {error && <p className="mt-2 text-sm text-error-500 dark:text-error-400">{error}</p>}
    </div>
  );
}