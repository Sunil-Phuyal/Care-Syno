import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, size = 'md', className, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    const sizes = {
      sm: {
        track: 'w-9 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-4',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7',
      },
    };

    return (
      <div className="flex items-start gap-3">
        <div className="relative inline-block">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={switchId}
            className={cn(
              'block rounded-full cursor-pointer transition-colors',
              'bg-gray-200 dark:bg-gray-700',
              'peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500',
              'peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              sizes[size].track,
              className
            )}
          >
            <span
              className={cn(
                'block rounded-full bg-white shadow-md transform transition-transform',
                'peer-checked:translate-x-full',
                sizes[size].thumb,
                'translate-x-0.5 mt-0.5'
              )}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={switchId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';