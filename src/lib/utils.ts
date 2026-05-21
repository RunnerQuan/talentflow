// ============================================================
// TalentFlow — Utility Functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx + tailwind-merge.
 * Usage: cn('px-4 py-2', condition && 'bg-primary', 'px-6')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Delay for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a number as percentage string.
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

/**
 * Format currency in CNY.
 */
export function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract file extension from filename.
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file type is supported for resume upload.
 */
export function isSupportedFileType(filename: string): boolean {
  const supported = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
  return supported.includes(getFileExtension(filename));
}

/**
 * Map interview round to display label.
 */
export function getRoundLabel(round: string): string {
  const labels: Record<string, string> = {
    screening: '初筛面试',
    technical: '技术面试',
    cultural: '文化面试',
    final: '终面',
  };
  return labels[round] || round;
}

/**
 * Map skill level number to display label.
 */
export function getSkillLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '了解',
    2: '熟悉',
    3: '掌握',
    4: '精通',
    5: '专家',
  };
  return labels[level] || '未知';
}

/**
 * Calculate time ago from a date string.
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}
