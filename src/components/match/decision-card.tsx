'use client';

import { CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { ExplainableMatchResult } from '@/types';

const decisionMeta = {
  strong_recommend: {
    label: '强烈推荐',
    className: 'bg-emerald-500/10 text-emerald-600',
    icon: CheckCircle2,
  },
  recommend: {
    label: '推荐',
    className: 'bg-tf-accent/10 text-tf-accent',
    icon: CheckCircle2,
  },
  hold: {
    label: '暂缓',
    className: 'bg-amber-500/10 text-amber-600',
    icon: Clock,
  },
  not_recommend: {
    label: '不推荐',
    className: 'bg-red-500/10 text-red-600',
    icon: XCircle,
  },
};

const nextStepLabel = {
  technical_interview: '技术面试',
  hr_screening: 'HR 初筛',
  talent_pool: '进入人才库',
  reject: '暂不推进',
};

export function DecisionCard({ decision }: { decision?: ExplainableMatchResult['decision'] }) {
  if (!decision) return null;

  const meta = decisionMeta[decision.level];
  const Icon = meta.icon || ShieldAlert;

  return (
    <GlassCard variant="sm" className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary">
            <Icon className="h-4 w-4 text-tf-accent" />
            Decision Agent 决策建议
          </h4>
          <p className="mt-3 text-sm leading-relaxed text-tf-secondary">{decision.summary}</p>
        </div>
        <div className="flex min-w-[160px] flex-col gap-2">
          <span className={cn('rounded-xl px-3 py-2 text-center text-sm font-bold', meta.className)}>
            {meta.label}
          </span>
          <span className="rounded-xl bg-white/50 px-3 py-2 text-center text-xs font-medium text-tf-primary">
            下一步：{nextStepLabel[decision.nextStep]}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
