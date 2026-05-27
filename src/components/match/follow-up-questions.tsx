'use client';

import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { FollowUpQuestion } from '@/types';

const difficultyLabel = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const difficultyClass = {
  easy: 'bg-emerald-500/10 text-emerald-600',
  medium: 'bg-tf-accent/10 text-tf-accent',
  hard: 'bg-red-500/10 text-red-600',
};

export function FollowUpQuestions({
  questions = [],
  onCreateInterview,
  isCreating = false,
}: {
  questions?: FollowUpQuestion[];
  onCreateInterview?: () => void;
  isCreating?: boolean;
}) {
  if (questions.length === 0) return null;

  return (
    <GlassCard variant="sm" className="p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary">
            <MessageSquarePlus className="h-4 w-4 text-tf-accent" />
            AI 风险追问
          </h4>
          <p className="mt-1 text-xs text-tf-text-secondary">
            已根据 yellow/red 风险生成 {questions.length} 个面试追问
          </p>
        </div>
        {onCreateInterview && (
          <Button
            size="sm"
            onClick={onCreateInterview}
            loading={isCreating}
            icon={isCreating ? undefined : <MessageSquarePlus className="h-4 w-4" />}
          >
            创建技术面试
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {questions.map((item, index) => (
          <div key={item.id} className="rounded-2xl bg-white/45 p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-relaxed text-tf-primary">
                {index + 1}. {item.question}
              </p>
              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', difficultyClass[item.difficulty])}>
                {difficultyLabel[item.difficulty]}
              </span>
            </div>
            <p className="text-xs text-tf-secondary">
              <span className="font-medium text-tf-primary">目标风险：</span>
              {item.targetRisk}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-tf-secondary">
              <span className="font-medium text-tf-primary">为什么问：</span>
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
