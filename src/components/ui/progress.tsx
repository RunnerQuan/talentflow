// ============================================================
// TalentFlow — Progress Components
// ============================================================

'use client';

import { cn, clamp } from '@/lib/utils';

/** Linear progress bar. */
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
  color?: 'accent' | 'green' | 'red' | 'blue';
}

const barColors = {
  accent: 'bg-tf-accent',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  className,
  color = 'accent',
}: ProgressBarProps) {
  const percent = clamp((value / max) * 100, 0, 100);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-tf-primary">{label}</span>}
          {showPercent && (
            <span className="text-sm text-tf-text-secondary">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** Circular/ring progress indicator. */
interface RingProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function RingProgress({
  value,
  size = 160,
  strokeWidth = 10,
  label,
  sublabel,
  className,
}: RingProgressProps) {
  const clampedValue = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  /** Determine color based on score. */
  const strokeColor =
    clampedValue >= 80 ? '#22c55e' : clampedValue >= 60 ? '#CA8A04' : '#ef4444';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="ring-progress"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-tf-primary">{Math.round(clampedValue)}</span>
        {label && <span className="text-xs text-tf-text-secondary mt-0.5">{label}</span>}
        {sublabel && <span className="text-xs text-tf-text-secondary">{sublabel}</span>}
      </div>
    </div>
  );
}
