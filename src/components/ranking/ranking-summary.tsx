'use client';

import { Crown, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { BatchMatchSummary } from '@/types';

export function RankingSummary({ summary }: { summary: BatchMatchSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <GlassCard variant="sm" className="p-4">
        <Users className="mb-2 h-4 w-4 text-tf-accent" />
        <p className="text-2xl font-bold text-tf-primary">{summary.totalCandidates}</p>
        <p className="text-xs text-tf-text-secondary">候选人数</p>
      </GlassCard>
      <GlassCard variant="sm" className="p-4">
        <Crown className="mb-2 h-4 w-4 text-tf-accent" />
        <p className="text-2xl font-bold text-tf-primary">{summary.recommendedCount}</p>
        <p className="text-xs text-tf-text-secondary">推荐推进</p>
      </GlassCard>
      <GlassCard variant="sm" className="p-4">
        <p className="mb-2 text-xs font-medium text-tf-accent">AVG</p>
        <p className="text-2xl font-bold text-tf-primary">{summary.averageScore}</p>
        <p className="text-xs text-tf-text-secondary">平均分</p>
      </GlassCard>
      <GlassCard variant="sm" className="p-4">
        <p className="mb-2 text-xs font-medium text-tf-accent">TOP</p>
        <p className="truncate text-lg font-bold text-tf-primary">{summary.topCandidateName || '-'}</p>
        <p className="text-xs text-tf-text-secondary">首选候选人</p>
      </GlassCard>
    </div>
  );
}
