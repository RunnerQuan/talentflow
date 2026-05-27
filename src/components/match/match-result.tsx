// ============================================================
// TalentFlow — Match Result Display Component
// ============================================================

'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { RingProgress } from '@/components/ui/progress';
import { cn, formatPercent } from '@/lib/utils';
import { useInterviewStore } from '@/lib/store/interview-store';
import { DecisionCard } from '@/components/match/decision-card';
import { EvidenceChain } from '@/components/match/evidence-chain';
import { FollowUpQuestions } from '@/components/match/follow-up-questions';
import { RiskBoard } from '@/components/match/risk-board';
import type { ExplainableMatchResult, FollowUpQuestion, InterviewQuestion } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface MatchResultProps {
  result: ExplainableMatchResult;
  candidateId?: string;
}

export function MatchResultDisplay({ result, candidateId }: MatchResultProps) {
  const { addRecord } = useInterviewStore();
  const [created, setCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  /** Score color based on value. */
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-tf-accent';
    return 'text-red-500';
  };

  const handleCreateInterview = async () => {
    if (!candidateId || !result.followUpQuestions || result.followUpQuestions.length === 0) return;
    setIsCreating(true);
    try {
      const questions = convertFollowUpsToInterviewQuestions(result.followUpQuestions);
      await addRecord({
        id: `interview-${candidateId}-technical-${Date.now()}`,
        candidateId,
        round: 'technical',
        questions,
        evaluations: [],
        report: null,
        createdAt: new Date().toISOString(),
      });
      setCreated(true);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <GlassCard className="p-8 text-center" shimmer>
        <h3 className="text-lg font-serif font-bold text-tf-primary mb-6">
          匹配度评估
        </h3>
        <RingProgress
          value={result.overallScore}
          size={180}
          strokeWidth={12}
          label="/ 100"
          sublabel="总体匹配"
        />
        <div className="mt-6">
          <span
            className={cn(
              'inline-block px-4 py-1.5 rounded-xl text-sm font-medium',
              result.overallScore >= 80
                ? 'bg-emerald-500/10 text-emerald-600'
                : result.overallScore >= 60
                ? 'bg-tf-accent/10 text-tf-accent'
                : 'bg-red-500/10 text-red-600'
            )}
          >
            {result.overallScore >= 80
              ? '高度匹配'
              : result.overallScore >= 60
              ? '较为匹配'
              : '匹配度较低'}
          </span>
        </div>
      </GlassCard>

      {/* Dimension scores */}
      <GlassCard variant="sm" className="p-6">
        <h4 className="text-sm font-medium text-tf-primary mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-tf-accent" />
          各维度评分
        </h4>
        <div className="space-y-4">
          {result.dimensions.map((dim) => (
            <div key={dim.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-tf-primary">{dim.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tf-text-secondary">
                    权重 {formatPercent(dim.weight * 100, 0)}
                  </span>
                  <span className={cn('text-sm font-bold', getScoreColor(dim.score))}>
                    {dim.score}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    dim.score >= 80
                      ? 'bg-emerald-500'
                      : dim.score >= 60
                      ? 'bg-tf-accent'
                      : 'bg-red-500'
                  )}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              {dim.details.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {dim.details.map((detail, i) => (
                    <li
                      key={i}
                      className="text-xs text-tf-text-secondary pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-tf-accent/40"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <GlassCard variant="sm" className="p-5">
          <h4 className="text-sm font-medium text-tf-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            候选人优势
          </h4>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-tf-secondary"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Weaknesses */}
        <GlassCard variant="sm" className="p-5">
          <h4 className="text-sm font-medium text-tf-primary mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            待提升项
          </h4>
          <ul className="space-y-2">
            {result.weaknesses.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-tf-secondary"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Recommendation */}
      <GlassCard variant="sm" className="p-5">
        <h4 className="text-sm font-medium text-tf-primary mb-3 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-tf-accent" />
          综合推荐
        </h4>
        <p className="text-sm text-tf-secondary leading-relaxed">
          {result.recommendation}
        </p>
      </GlassCard>

      <DecisionCard decision={result.decision} />
      <EvidenceChain evidences={result.evidences} />
      <RiskBoard risks={result.risks} />
      <FollowUpQuestions
        questions={result.followUpQuestions}
        onCreateInterview={candidateId && !created ? handleCreateInterview : undefined}
        isCreating={isCreating}
      />
      {created && (
        <GlassCard variant="sm" className="flex items-center gap-3 p-4">
          <Check className="h-5 w-5 text-emerald-600" />
          <p className="text-sm text-tf-secondary">已创建技术面试，可在候选人详情的面试记录中查看。</p>
        </GlassCard>
      )}
    </div>
  );
}

function convertFollowUpsToInterviewQuestions(
  followUps: FollowUpQuestion[]
): InterviewQuestion[] {
  return followUps.map((q) => ({
    id: q.id,
    question: q.question,
    category: q.targetRisk,
    difficulty: q.difficulty,
    expectedAnswer: `请重点验证：${q.reason}`,
    followUp: '根据候选人回答继续追问项目细节、指标、技术取舍和个人贡献。',
    whyAsk: q.reason,
    evidenceFromResume: '由匹配风险自动生成。',
    targetRisk: q.targetRisk,
    scoringRubric: ['能说明真实项目背景', '能解释关键技术取舍', '能给出指标或失败处理细节'],
  }));
}
