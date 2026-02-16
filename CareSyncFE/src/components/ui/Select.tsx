import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      leftIcon,
      className,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles =
      'px-4 py-2 border rounded-lg transition-all duration-200 ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
      'appearance-none bg-no-repeat bg-right pr-10';

    const normalStyles =
      'border-gray-300 bg-white text-gray-900 ' +
      'focus:ring-primary-500 focus:border-transparent ' +
      'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ' +
      'dark:focus:ring-primary-400';

    const errorStyles =
      'border-error-500 bg-error-50 text-error-900 ' +
      'focus:ring-error-500 focus:border-transparent ' +
      'dark:bg-error-900/20 dark:text-error-100';

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={cn(
              baseStyles,
              error ? errorStyles : normalStyles,
              leftIcon && 'pl-10',
              fullWidth && 'w-full',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {children}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-error-500 dark:text-error-400"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';