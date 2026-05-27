'use client';

import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { label: '简历解析', agent: 'Resume Parser Agent', icon: FileText },
  { label: '画像生成', agent: 'Profile Agent', icon: BrainCircuit },
  { label: '技能图谱', agent: 'Skill Graph Agent', icon: GitBranch },
  { label: '岗位匹配', agent: 'JD Matching Agent', icon: Target },
  { label: '面试追问', agent: 'Interview Agent', icon: MessageSquare },
  { label: '决策报告', agent: 'Decision Agent', icon: ShieldCheck },
];

export function DemoWorkflow({ activeStep }: { activeStep: number }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const completed = index < activeStep;
        const active = index === activeStep;
        return (
          <div
            key={step.agent}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-3 transition-all',
              completed && 'border-emerald-500/20 bg-emerald-500/10',
              active && 'border-tf-accent/30 bg-tf-accent/10',
              !completed && !active && 'border-white/40 bg-white/35'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                completed ? 'bg-emerald-500 text-white' : active ? 'bg-tf-accent text-white' : 'bg-white/60 text-tf-text-secondary'
              )}
            >
              {completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-tf-primary">{step.label}</p>
              <p className="truncate text-xs text-tf-text-secondary">{step.agent}</p>
            </div>
            <span className="text-xs font-medium text-tf-text-secondary">
              {completed ? 'Done' : active ? 'Running' : 'Ready'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
