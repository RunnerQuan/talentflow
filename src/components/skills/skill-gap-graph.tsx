'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { SkillGapGraphData, SkillGapNode } from '@/types';
import { SkillGapLegend } from '@/components/skills/skill-gap-legend';

const sourceClass = {
  both: 'bg-emerald-500 text-white border-emerald-600',
  candidate: 'bg-tf-accent text-white border-tf-accent-hover',
  missing: 'bg-red-50 text-red-600 border-red-500 border-dashed',
  job: 'bg-white text-tf-primary border-tf-accent',
};

export function SkillGapGraph({ graph }: { graph: SkillGapGraphData }) {
  const [selected, setSelected] = useState<SkillGapNode | null>(null);
  const nodes = useMemo(
    () => graph.nodes.filter((node) => node.id !== 'candidate-profile' && node.id !== 'job-requirements'),
    [graph.nodes]
  );

  return (
    <GlassCard variant="sm" className="p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-sm font-medium text-tf-primary">候选人能力图谱 × 岗位需求图谱</h4>
          <p className="mt-1 text-xs text-tf-text-secondary">点击节点查看 JD 证据和候选人证据</p>
        </div>
        <SkillGapLegend />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="min-h-[260px] rounded-3xl bg-white/40 p-4">
          <div className="flex flex-wrap justify-center gap-3">
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelected(node)}
                className={cn(
                  'min-h-16 max-w-[150px] rounded-2xl border-2 px-4 py-3 text-center text-sm font-medium transition-transform hover:scale-[1.02]',
                  sourceClass[node.source],
                  selected?.id === node.id && 'ring-2 ring-tf-accent/40'
                )}
              >
                <span className="block break-words">{node.name}</span>
                <span className="mt-1 block text-[10px] opacity-80">
                  {node.importance || node.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white/45 p-4">
          {selected ? (
            <div>
              <p className="text-base font-bold text-tf-primary">{selected.name}</p>
              <p className="mt-1 text-xs text-tf-text-secondary">{selected.category}</p>
              <div className="mt-4 space-y-3 text-xs text-tf-secondary">
                <Info label="来源" value={sourceLabel(selected.source)} />
                {selected.importance && <Info label="岗位重要性" value={selected.importance} />}
                {selected.level && <Info label="候选人熟练度" value={`${selected.level}/5`} />}
                {selected.jdEvidence && <Info label="JD 证据" value={selected.jdEvidence} />}
                {selected.candidateEvidence && <Info label="候选人证据" value={selected.candidateEvidence} />}
                {selected.source === 'missing' && <Info label="缺口判断" value={selected.gapLevel === 'major' ? '主要缺口' : '轻微缺口'} />}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-tf-text-secondary">
              选择一个技能节点后，这里会展示技能来源、岗位证据和候选人证据。
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 font-medium text-tf-primary">{label}</p>
      <p className="leading-relaxed">{value}</p>
    </div>
  );
}

function sourceLabel(source: SkillGapNode['source']) {
  const labels = {
    both: '候选人已有且岗位要求',
    candidate: '候选人已有技能',
    job: '岗位要求',
    missing: '岗位要求但候选人缺失',
  };
  return labels[source];
}
