// components/ui/ConfirmationModal.tsx
'use client';

import { FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isLoading?: boolean;
  variant?: 'default' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  variant = 'default'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    default: 'bg-primary hover:bg-primary/90 focus:ring-primary/50',
    danger: 'bg-error hover:bg-error/90 focus:ring-error/50'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && !isLoading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-muted">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              variant === 'danger' ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
            }`}>
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row-reverse gap-3 p-6 border-t border-muted">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              variantClasses[variant]
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <FiLoader className="w-4 h-4 animate-spin mr-2" />
                {confirmText}
              </div>
            ) : (
              confirmText
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-muted text-foreground rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}