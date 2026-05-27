'use client';

import { cn } from '@/lib/utils';
import type { BatchMatchResult } from '@/types';

const levelClass = {
  A: 'bg-emerald-500/10 text-emerald-600',
  B: 'bg-tf-accent/10 text-tf-accent',
  C: 'bg-amber-500/10 text-amber-600',
  D: 'bg-red-500/10 text-red-600',
};

export function RankingTable({ results }: { results: BatchMatchResult[] }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-3xl bg-white/45">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.12em] text-tf-text-secondary">
          <tr>
            <th className="px-4 py-3">排名</th>
            <th className="px-4 py-3">候选人</th>
            <th className="px-4 py-3">分数</th>
            <th className="px-4 py-3">等级</th>
            <th className="px-4 py-3">核心优势</th>
            <th className="px-4 py-3">风险</th>
            <th className="px-4 py-3">建议动作</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={`${result.rank}-${result.candidateName}`} className="border-t border-white/50">
              <td className="px-4 py-4 font-bold text-tf-accent">#{result.rank}</td>
              <td className="px-4 py-4 font-medium text-tf-primary">{result.candidateName}</td>
              <td className="px-4 py-4 text-lg font-bold text-tf-primary">{result.score}</td>
              <td className="px-4 py-4">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', levelClass[result.level])}>
                  {result.level}
                </span>
              </td>
              <td className="px-4 py-4 text-xs text-tf-secondary">{result.highlights.join('；')}</td>
              <td className="px-4 py-4 text-xs text-tf-secondary">{result.risks.join('；')}</td>
              <td className="px-4 py-4 text-xs font-medium text-tf-accent">{result.suggestedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
