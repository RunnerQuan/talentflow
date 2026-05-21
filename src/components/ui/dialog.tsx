// ============================================================
// TalentFlow — Dialog / Modal Component
// ============================================================

'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop — subtle dimming for immersion */}
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md backdrop-saturate-150 animate-dialog-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative isolate w-full flex flex-col overflow-hidden rounded-[28px] animate-dialog-content',
          'border border-white/60 bg-[rgba(255,255,255,0.92)]',
          'shadow-[0_32px_90px_rgba(15,23,42,0.18),0_1px_0_rgba(255,255,255,0.72)_inset]',
          'ring-1 ring-black/5',
          maxWidthClasses[maxWidth],
          className
        )}
        style={{
          maxHeight: 'calc(100vh - 7rem)',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Header */}
          {title ? (
            <div className="sticky top-0 z-20 flex items-start justify-between gap-3 border-b border-black/5 bg-white/78 px-6 py-4 backdrop-blur-xl">
              <h3 className="min-w-0 flex-1 text-xl font-serif font-bold leading-tight text-tf-primary line-clamp-2">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-xl p-2 text-tf-text-secondary transition-colors hover:bg-black/5 hover:text-tf-primary"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="sticky top-0 z-20 flex justify-end border-b border-black/5 bg-white/78 px-4 py-3 backdrop-blur-xl">
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-tf-text-secondary transition-colors hover:bg-black/5 hover:text-tf-primary"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className={cn('min-h-0 flex-1 px-6 py-5', !title && 'pt-6')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document === 'undefined' ? dialog : createPortal(dialog, document.body);
}
