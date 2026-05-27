'use client';

import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { MatchRisk } from '@/types';

const columns = [
  {
    level: 'green' as const,
    title: '强匹配',
    icon: CheckCircle2,
    className: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    level: 'yellow' as const,
    title: '待追问',
    icon: HelpCircle,
    className: 'text-tf-accent bg-tf-accent/10',
  },
  {
    level: 'red' as const,
    title: '高风险',
    icon: AlertTriangle,
    className: 'text-red-600 bg-red-500/10',
  },
];

export function RiskBoard({ risks = [] }: { risks?: MatchRisk[] }) {
  if (risks.length === 0) return null;

  return (
    <GlassCard variant="sm" className="p-5">
      <h4 className="mb-4 text-sm font-medium text-tf-primary">风险分层看板</h4>
      <div className="grid gap-3 md:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          const items = risks.filter((risk) => risk.level === column.level);
          return (
            <div key={column.level} className="rounded-2xl bg-white/45 p-3">
              <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${column.className}`}>
                <Icon className="h-4 w-4" />
                {column.title}
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="px-1 py-3 text-xs text-tf-text-secondary">暂无风险项</p>
                ) : (
                  items.map((risk) => (
                    <div key={risk.id} className="rounded-xl bg-white/55 p-3">
                      <p className="text-sm font-medium text-tf-primary">{risk.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-tf-secondary">{risk.description}</p>
                      <p className="mt-2 text-xs font-medium text-tf-accent">{risk.suggestedAction}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
