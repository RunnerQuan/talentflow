// ============================================================
// TalentFlow — Glass Card Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'sm' | 'xs';
  shimmer?: boolean;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  variant = 'default',
  shimmer = false,
  hoverable = true,
  className,
  ...props
}: GlassCardProps) {
  const variantClass = {
    default: 'glass-card',
    sm: 'glass-card-sm',
    xs: 'glass-card-xs',
  }[variant];

  return (
    <div
      className={cn(
        variantClass,
        shimmer && 'shimmer',
        !hoverable && 'hover:transform-none hover:shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
