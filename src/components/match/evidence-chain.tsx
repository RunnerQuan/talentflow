'use client';

import { ArrowDown, FileSearch } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { MatchEvidence } from '@/types';

const verdictClass = {
  matched: 'bg-emerald-500/10 text-emerald-600',
  partial: 'bg-tf-accent/10 text-tf-accent',
  missing: 'bg-red-500/10 text-red-600',
  uncertain: 'bg-stone-500/10 text-stone-600',
};

const verdictLabel = {
  matched: '匹配',
  partial: '部分匹配',
  missing: '缺失',
  uncertain: '不确定',
};

export function EvidenceChain({ evidences = [] }: { evidences?: MatchEvidence[] }) {
  if (evidences.length === 0) return null;

  return (
    <GlassCard variant="sm" className="p-5">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-tf-primary">
        <FileSearch className="h-4 w-4 text-tf-accent" />
        匹配证据链
      </h4>
      <div className="space-y-4">
        {evidences.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white/45 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-tf-accent">{item.dimension}</span>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', verdictClass[item.verdict])}>
                {verdictLabel[item.verdict]} · {item.confidence}%
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_0.8fr] md:items-center">
              <EvidenceBlock label="JD 要求" text={item.jdRequirement} />
              <ArrowDown className="h-4 w-4 rotate-0 text-tf-text-secondary md:rotate-[-90deg]" />
              <EvidenceBlock label="简历证据" text={item.resumeEvidence} />
              <ArrowDown className="h-4 w-4 rotate-0 text-tf-text-secondary md:rotate-[-90deg]" />
              <EvidenceBlock label="判断" text={`${verdictLabel[item.verdict]} · ${item.evidenceType}`} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function EvidenceBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-tf-text-secondary">
        {label}
      </p>
      <p className="text-xs leading-relaxed text-tf-secondary">{text}</p>
    </div>
  );
}
