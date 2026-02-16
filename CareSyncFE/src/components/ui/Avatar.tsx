import { ImgHTMLAttributes, ReactNode, Children } from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  variant = 'circular',
  status,
  className,
  ...props
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const variants = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  // Get initials from fallback text
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'object-cover',
            sizes[size],
            variants[variant],
            'ring-2 ring-white dark:ring-gray-800'
          )}
          {...props}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center font-medium',
            'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
            sizes[size],
            variants[variant],
            'ring-2 ring-white dark:ring-gray-800'
          )}
        >
          {getInitials(fallback || alt)}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
            statusColors[status],
            statusSizes[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

// Avatar Group
interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({ children, max = 3, size = 'md', className }: AvatarGroupProps) {
  const childArray = Children.toArray(children);
  const displayedChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlap = {
    xs: '-space-x-2',
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5',
    '2xl': '-space-x-6',
  };

  return (
    <div className={cn('flex items-center', overlap[size], className)}>
      {displayedChildren}
      {remainingCount > 0 && (
        <Avatar
          fallback={`+${remainingCount}`}
          size={size}
          className="ring-2 ring-white dark:ring-gray-800"
        />
      )}
    </div>
  );
}