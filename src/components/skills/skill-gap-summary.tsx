'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { summarizeSkillGap } from '@/lib/skills/build-skill-gap-graph';
import type { SkillGapGraphData } from '@/types';

export function SkillGapSummary({ graph }: { graph: SkillGapGraphData }) {
  const summary = summarizeSkillGap(graph);

  return (
    <GlassCard variant="sm" className="p-5">
      <h4 className="mb-4 text-sm font-medium text-tf-primary">人岗差距摘要</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-500/10 p-4">
          <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
          <p className="text-2xl font-bold text-emerald-600">
            {summary.mustMatched}/{summary.mustTotal}
          </p>
          <p className="text-xs text-tf-secondary">硬性要求命中</p>
        </div>
        <div className="rounded-2xl bg-tf-accent/10 p-4">
          <CheckCircle2 className="mb-2 h-5 w-5 text-tf-accent" />
          <p className="text-2xl font-bold text-tf-accent">
            {summary.preferredMatched}/{summary.preferredTotal}
          </p>
          <p className="text-xs text-tf-secondary">优先条件命中</p>
        </div>
      </div>

      {summary.missingSkills.length > 0 && (
        <div className="mt-4 rounded-2xl bg-red-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4" />
            主要缺口
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.missingSkills.map((skill) => (
              <span key={skill} className="rounded-full bg-white/60 px-2.5 py-1 text-xs text-red-600">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
