import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 300);
    const closeTimer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  const accent = {
    success: 'bg-teal-500',
    error:   'bg-error-500',
    warning: 'bg-warning-500',
    info:    'bg-gray-400',
  }[type];

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-50
        transition-all duration-300 ease-in-out
        ${exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-slide-in-right'}
      `}
    >
      <div className="flex items-stretch bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden min-w-[280px] max-w-sm">
        {/* Left accent bar */}
        <div className={`w-1 shrink-0 ${accent}`} />

        {/* Message */}
        <p className="flex-1 px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
          {message}
        </p>

        {/* Dismiss */}
        <button
          onClick={handleClose}
          className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-150 text-xs font-medium self-stretch"
        >
          ✕
        </button>
      </div>
    </div>
  );
}