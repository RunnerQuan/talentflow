// ============================================================
// TalentFlow — Input Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-tf-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tf-text-secondary">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full glass-card-xs',
            'px-4 py-3 text-sm',
            'text-tf-primary placeholder:text-tf-text-secondary/50',
            'focus:outline-none focus:ring-2 focus:ring-tf-accent/30',
            'transition-all duration-300',
            icon && 'pl-11',
            error && 'ring-2 ring-red-400/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-tf-text-secondary">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-tf-primary">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full glass-card-xs',
          'px-4 py-3 text-sm',
          'text-tf-primary placeholder:text-tf-text-secondary/50',
          'focus:outline-none focus:ring-2 focus:ring-tf-accent/30',
          'transition-all duration-300',
          'resize-y min-h-[120px]',
          error && 'ring-2 ring-red-400/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-tf-text-secondary">{hint}</p>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-tf-primary">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full glass-card-xs',
          'px-4 py-3 text-sm',
          'text-tf-primary',
          'focus:outline-none focus:ring-2 focus:ring-tf-accent/30',
          'transition-all duration-300',
          'cursor-pointer appearance-none',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")]',
          'bg-[position:right_12px_center] bg-no-repeat',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
