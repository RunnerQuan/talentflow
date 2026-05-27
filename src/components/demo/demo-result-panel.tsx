'use client';

import { BarChart3, Crown, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { DecisionCard } from '@/components/match/decision-card';
import { EvidenceChain } from '@/components/match/evidence-chain';
import { FollowUpQuestions } from '@/components/match/follow-up-questions';
import { RiskBoard } from '@/components/match/risk-board';
import { SkillGapGraph } from '@/components/skills/skill-gap-graph';
import { SkillGapSummary } from '@/components/skills/skill-gap-summary';
import type { BatchMatchResult, ExplainableMatchResult, SkillGapGraphData } from '@/types';

export function DemoResultPanel({
  result,
  ranking,
  skillGraph,
}: {
  result: ExplainableMatchResult;
  ranking: BatchMatchResult[];
  skillGraph: SkillGapGraphData;
}) {
  return (
    <div className="space-y-5">
      <GlassCard className="p-6" shimmer>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-tf-accent">Decision Agent Output</p>
            <h2 className="mt-1 text-2xl font-bold text-tf-primary">{result.candidateName} · {result.overallScore} 分</h2>
            <p className="mt-2 text-sm leading-relaxed text-tf-secondary">{result.recommendation}</p>
          </div>
          <div className="rounded-3xl bg-tf-accent/10 px-6 py-4 text-center">
            <p className="text-4xl font-bold text-tf-accent">{result.overallScore}</p>
            <p className="text-xs text-tf-text-secondary">总体匹配</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="sm" className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-tf-primary">
          <BarChart3 className="h-4 w-4 text-tf-accent" />
          批量候选人排序
        </h3>
        <div className="space-y-3">
          {ranking.map((item) => (
            <div key={item.candidateName} className="flex items-center gap-3 rounded-2xl bg-white/45 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tf-accent/10 text-sm font-bold text-tf-accent">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-tf-primary">
                  {item.rank === 1 && <Crown className="h-4 w-4 text-tf-accent" />}
                  {item.candidateName}
                </p>
                <p className="truncate text-xs text-tf-text-secondary">
                  {item.highlights.join(' / ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-tf-primary">{item.score}</p>
                <p className="text-xs text-tf-text-secondary">{item.suggestedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <DecisionCard decision={result.decision} />
      <SkillGapSummary graph={skillGraph} />
      <SkillGapGraph graph={skillGraph} />
      <EvidenceChain evidences={result.evidences} />
      <RiskBoard risks={result.risks} />
      <FollowUpQuestions questions={result.followUpQuestions} />

      <GlassCard variant="sm" className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-tf-primary">
          <ShieldCheck className="h-4 w-4 text-tf-accent" />
          演示结论
        </h3>
        <p className="text-sm leading-relaxed text-tf-secondary">
          TalentFlow 不只输出分数，还给出 JD 要求、简历证据、风险追问和下一步动作，
          让招聘判断从经验直觉转向可追溯的决策流程。
        </p>
      </GlassCard>
    </div>
  );
}
