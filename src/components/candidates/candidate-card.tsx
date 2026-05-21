// ============================================================
// TalentFlow — Candidate Card Component
// ============================================================

'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { cn, timeAgo } from '@/lib/utils';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type CandidateRecord,
} from '@/types';
import { Briefcase, Tag } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateRecord;
}

/** Get initials from a candidate name (supports Chinese). */
function getInitials(name: string): string {
  if (!name) return '?';
  // For Chinese names, take the last 1-2 characters
  const chars = name.trim();
  if (/[\u4e00-\u9fff]/.test(chars)) {
    return chars.length >= 2 ? chars.slice(-2) : chars;
  }
  // For English names, take first letter of each word
  return chars
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Generate a deterministic color from a string. */
function stringToColor(str: string): string {
  const colors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { profile, status, tags, createdAt } = candidate;
  const initials = getInitials(profile.name);
  const avatarColor = stringToColor(profile.name);

  return (
    <Link href={`/candidates/${candidate.id}`} className="block">
      <GlassCard className="p-5 h-full cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-lg flex-shrink-0',
              avatarColor
            )}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-tf-primary truncate">
                {profile.name || '未知姓名'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                  STATUS_COLORS[status]
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            {/* Current title */}
            {profile.currentTitle && (
              <div className="flex items-center gap-1.5 text-sm text-tf-secondary mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="truncate">
                  {profile.currentTitle}
                  {profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
                </span>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3 h-3 text-tf-text-secondary/40" />
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-lg bg-tf-accent/5 text-tf-accent"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-tf-text-secondary">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-tf-text-secondary">
              <span>{(profile.skills || []).length} 项技能</span>
              <span>{timeAgo(createdAt)}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
