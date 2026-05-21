// ============================================================
// TalentFlow — Dialog / Modal Component
// ============================================================

'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export function Dialog({
  open,
  onClose,
  children,
  title,
  className,
  maxWidth = 'lg',
}: DialogProps) {
  /** Close on ESC key. */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-dialog-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full glass-card p-0 shadow-2xl animate-dialog-content flex flex-col',
          maxWidthClasses[maxWidth],
          className
        )}
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(200%)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-black/5 flex-shrink-0 gap-3">
            <h3 className="text-lg font-serif font-bold text-tf-primary leading-tight min-w-0 line-clamp-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-tf-text-secondary hover:text-tf-primary hover:bg-black/5 transition-colors flex-shrink-0 mt-0.5"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Close button (floating, when no title) */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-tf-text-secondary hover:text-tf-primary hover:bg-black/5 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className={cn('overflow-y-auto flex-1', title ? 'p-6' : 'p-6 pt-12')}>
          {children}
        </div>
      </div>
    </div>
  );
}
