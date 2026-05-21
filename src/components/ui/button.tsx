// ============================================================
// TalentFlow — Button Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-tf-accent text-white',
    'hover:bg-tf-accent-hover',
    'active:bg-amber-800',
    'shadow-lg shadow-amber-500/20',
  ].join(' '),
  secondary: [
    'glass-card-sm',
    'text-tf-primary',
    'hover:bg-white/80',
  ].join(' '),
  ghost: [
    'bg-transparent text-tf-secondary',
    'hover:bg-black/5',
  ].join(' '),
  danger: [
    'bg-red-500 text-white',
    'hover:bg-red-600',
    'shadow-lg shadow-red-500/20',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium transition-all duration-300',
        'cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
