// ============================================================
// TalentFlow — Interview Question Card
// ============================================================

'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { InterviewQuestion, InterviewEvaluation } from '@/types';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
  Star,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  evaluation?: InterviewEvaluation;
  onEvaluate?: (questionId: string, answer: string) => void;
  isEvaluating?: boolean;
  showAnswer?: boolean;
}

const difficultyColors = {
  easy: 'bg-emerald-500/10 text-emerald-600',
  medium: 'bg-tf-accent/10 text-tf-accent',
  hard: 'bg-red-500/10 text-red-600',
};

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function QuestionCard({
  question,
  index,
  evaluation,
  onEvaluate,
  isEvaluating = false,
  showAnswer = false,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim() && onEvaluate) {
      onEvaluate(question.id, answer.trim());
    }
  };

  return (
    <GlassCard variant="sm" className="overflow-hidden">
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-5 cursor-pointer text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-tf-accent/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-tf-accent">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-tf-primary leading-relaxed">
            {question.question}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-tf-text-secondary">{question.category}</span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-md',
                difficultyColors[question.difficulty]
              )}
            >
              {difficultyLabels[question.difficulty]}
            </span>
            {evaluation && (
              <span className="flex items-center gap-1 text-xs text-tf-accent">
                <Star className="w-3 h-3" />
                {evaluation.score}分
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-tf-text-secondary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-tf-text-secondary flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-black/5">
          {/* Expected answer hint */}
          {showAnswer && question.expectedAnswer && (
            <div className="mt-4 glass-card-xs p-3 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-tf-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-tf-primary mb-1">参考答案要点</p>
                <p className="text-xs text-tf-secondary leading-relaxed">
                  {question.expectedAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Follow-up question */}
          {(question.whyAsk || question.evidenceFromResume || question.targetRisk || question.scoringRubric?.length) && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {question.whyAsk && (
                <InfoBlock label="为什么问" value={question.whyAsk} />
              )}
              {question.evidenceFromResume && (
                <InfoBlock label="简历证据" value={question.evidenceFromResume} />
              )}
              {question.targetRisk && (
                <InfoBlock label="目标风险" value={question.targetRisk} />
              )}
              {question.scoringRubric && question.scoringRubric.length > 0 && (
                <div className="glass-card-xs p-3">
                  <p className="mb-2 text-xs font-medium text-tf-primary">评分标准</p>
                  <ul className="space-y-1">
                    {question.scoringRubric.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-tf-secondary">
                        <Target className="mt-0.5 h-3 w-3 shrink-0 text-tf-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Follow-up question */}
          {question.followUp && (
            <div className="mt-3 flex items-start gap-2 px-1">
              <MessageSquare className="w-3.5 h-3.5 text-tf-text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-tf-text-secondary italic">
                追问：{question.followUp}
              </p>
            </div>
          )}

          {/* Answer input (only if not yet evaluated) */}
          {!evaluation && onEvaluate && (
            <div className="mt-4">
              <Textarea
                placeholder="输入候选人的回答..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  loading={isEvaluating}
                  disabled={!answer.trim()}
                  icon={isEvaluating ? undefined : <CheckCircle2 className="w-4 h-4" />}
                >
                  {isEvaluating ? '评估中...' : '提交评估'}
                </Button>
              </div>
            </div>
          )}

          {/* Evaluation result */}
          {evaluation && (
            <div className="mt-4 glass-card-xs p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-tf-primary">AI 评估结果</span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    evaluation.score >= 80
                      ? 'text-emerald-500'
                      : evaluation.score >= 60
                      ? 'text-tf-accent'
                      : 'text-red-500'
                  )}
                >
                  {evaluation.score}
                </span>
              </div>
              <p className="text-xs text-tf-secondary leading-relaxed">
                {evaluation.feedback}
              </p>
              {evaluation.dimensionScores && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Object.entries({
                    accuracy: '准确性',
                    logic: '逻辑',
                    depth: '深度',
                    authenticity: '真实性',
                    communication: '表达',
                  }).map(([key, label]) => (
                    <div key={key} className="rounded-xl bg-white/55 p-2 text-center">
                      <p className="text-sm font-bold text-tf-primary">
                        {evaluation.dimensionScores?.[key as keyof NonNullable<typeof evaluation.dimensionScores>]}
                      </p>
                      <p className="text-[11px] text-tf-text-secondary">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              {evaluation.riskVerified && (
                <p className="mt-3 text-xs font-medium text-tf-accent">
                  风险验证：{riskVerifiedLabel[evaluation.riskVerified]}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

const riskVerifiedLabel = {
  resolved: '已解除',
  partially_resolved: '部分解除',
  confirmed: '风险确认',
  unknown: '信息不足',
};

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card-xs p-3">
      <p className="mb-1 text-xs font-medium text-tf-primary">{label}</p>
      <p className="text-xs leading-relaxed text-tf-secondary">{value}</p>
    </div>
  );
}
