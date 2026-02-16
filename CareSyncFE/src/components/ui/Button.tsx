import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg ' +
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 ' +
      'focus:ring-primary-500 ' +
      'dark:bg-primary-500 dark:hover:bg-primary-600',
    
    secondary: 
      'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400 ' +
      'focus:ring-gray-500 ' +
      'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    
    danger: 
      'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 ' +
      'focus:ring-error-500',
    
    ghost: 
      'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 ' +
      'focus:ring-gray-500 ' +
      'dark:text-gray-200 dark:hover:bg-gray-800',
    
    outline: 
      'bg-transparent border-2 border-primary-600 text-primary-600 ' +
      'hover:bg-primary-50 active:bg-primary-100 ' +
      'focus:ring-primary-500 ' +
      'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}