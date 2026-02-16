import { ReactNode } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'OK',
  variant = 'info',
}: AlertDialogProps) {
  const icons = {
    info: (
      <div className="w-12 h-12 rounded-full bg-info-100 dark:bg-info-900/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-info-600 dark:text-info-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    ),
    success: (
      <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-success-600 dark:text-success-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    ),
    warning: (
      <div className="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-warning-600 dark:text-warning-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
    ),
    error: (
      <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-error-600 dark:text-error-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    ),
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" showCloseButton={false}>
      <ModalBody>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {icons[variant]}
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="primary" onClick={onClose} fullWidth>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}