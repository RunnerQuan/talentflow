'use client';

import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export interface HomeAgent {
  id: string;
  name: string;
  title: string;
  description: string;
  input: string;
  output: string;
  status: 'ready' | 'running' | 'completed';
  icon: LucideIcon;
}

const statusLabel = {
  ready: 'Ready',
  running: 'Running',
  completed: 'Completed',
};

const statusClass = {
  ready: 'bg-stone-500/10 text-stone-600',
  running: 'bg-tf-accent/10 text-tf-accent',
  completed: 'bg-emerald-500/10 text-emerald-600',
};

export function AgentCard({ agent, index }: { agent: HomeAgent; index: number }) {
  const Icon = agent.icon;

  return (
    <GlassCard
      variant="sm"
      className={cn(
        'relative h-full p-5',
        agent.status === 'running' && 'ring-1 ring-tf-accent/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tf-accent/10">
            <Icon className="h-5 w-5 text-tf-accent" />
          </div>
          <div>
            <p className="text-xs text-tf-text-secondary">Agent {index + 1}</p>
            <h3 className="text-base font-bold text-tf-primary">{agent.title}</h3>
          </div>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', statusClass[agent.status])}>
          {statusLabel[agent.status]}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-tf-primary">{agent.name}</p>
      <p className="mt-2 text-sm leading-relaxed text-tf-secondary">{agent.description}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
        <div className="rounded-xl bg-white/45 p-3">
          <span className="block text-tf-text-secondary">Input</span>
          <span className="font-medium text-tf-primary">{agent.input}</span>
        </div>
        <div className="rounded-xl bg-white/45 p-3">
          <span className="block text-tf-text-secondary">Output</span>
          <span className="font-medium text-tf-primary">{agent.output}</span>
        </div>
      </div>
    </GlassCard>
  );
}
