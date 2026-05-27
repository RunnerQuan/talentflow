'use client';

import { Crown } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { BatchMatchResult } from '@/types';

const levelClass = {
  A: 'bg-emerald-500/10 text-emerald-600',
  B: 'bg-tf-accent/10 text-tf-accent',
  C: 'bg-amber-500/10 text-amber-600',
  D: 'bg-red-500/10 text-red-600',
};

export function CandidateRankCard({ result }: { result: BatchMatchResult }) {
  return (
    <GlassCard variant="sm" className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-tf-accent">
            {result.rank === 1 && <Crown className="h-4 w-4" />}
            Rank #{result.rank}
          </p>
          <h3 className="mt-1 text-lg font-bold text-tf-primary">{result.candidateName}</h3>
        </div>
        <span className={cn('rounded-xl px-3 py-1.5 text-sm font-bold', levelClass[result.level])}>
          {result.level}
        </span>
      </div>
      <p className="text-3xl font-bold text-tf-primary">{result.score}</p>
      <p className="text-xs text-tf-text-secondary">匹配分</p>
      <div className="mt-4 space-y-2 text-xs text-tf-secondary">
        {result.highlights.slice(0, 2).map((item) => (
          <p key={item}>优势：{item}</p>
        ))}
        {result.risks.slice(0, 1).map((item) => (
          <p key={item}>风险：{item}</p>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-white/55 px-3 py-2 text-center text-sm font-medium text-tf-primary">
        {result.suggestedAction}
      </p>
    </GlassCard>
  );
}
