// ============================================================
// TalentFlow — Deterministic Demo Page
// ============================================================

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, PlayCircle, RotateCcw } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { DemoWorkflow } from '@/components/demo/demo-workflow';
import { DemoResultPanel } from '@/components/demo/demo-result-panel';
import {
  demoCandidates,
  demoJD,
  demoJobSkills,
  demoMatchResult,
  demoRankingResults,
} from '@/lib/demo/demo-data';
import { buildSkillGapGraph } from '@/lib/skills/build-skill-gap-graph';

const FINAL_STEP = 6;

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(demoCandidates[0].id);
  const selectedCandidate =
    demoCandidates.find((candidate) => candidate.id === selectedCandidateId) || demoCandidates[0];
  const skillGraph = useMemo(
    () => buildSkillGapGraph(selectedCandidate.profile.skills, demoJobSkills),
    [selectedCandidate]
  );
  const showResults = activeStep >= FINAL_STEP;

  const runDemo = async () => {
    setIsRunning(true);
    setActiveStep(0);
    for (let step = 0; step <= FINAL_STEP; step += 1) {
      setActiveStep(step);
      await new Promise((resolve) => window.setTimeout(resolve, step === FINAL_STEP ? 200 : 620));
    }
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setActiveStep(0);
  };

  return (
    <main className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-tf-secondary transition-colors hover:text-tf-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
            <div className="mb-3 inline-flex items-center gap-2 glass-card-sm px-4 py-2">
              <KeyRound className="h-4 w-4 text-tf-accent" />
              <span className="text-sm text-tf-secondary">Demo Mode · 无需 API Key</span>
            </div>
            <h1 className="text-3xl font-bold text-tf-primary sm:text-4xl">
              一键体验招聘决策智能体
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-tf-secondary sm:text-base">
              使用内置候选人和 Java 后端岗位 JD，完整演示候选人排序、技能差距、证据链匹配、面试追问和决策建议。
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={runDemo}
              loading={isRunning}
              disabled={isRunning}
              icon={isRunning ? undefined : <PlayCircle className="h-5 w-5" />}
            >
              {isRunning ? '分析中...' : '开始分析'}
            </Button>
            <Button variant="secondary" onClick={resetDemo} icon={<RotateCcw className="h-5 w-5" />}>
              重置
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_0.9fr_1.25fr]">
          <div className="space-y-6">
            <GlassCard className="p-6" hoverable={false}>
              <p className="text-sm font-medium text-tf-accent">岗位 JD</p>
              <h2 className="mt-2 text-2xl font-bold text-tf-primary">{demoJD.title}</h2>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-tf-secondary">
                {demoJD.description}
              </pre>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-5" hoverable={false}>
              <h2 className="mb-4 text-sm font-medium text-tf-primary">候选人池</h2>
              <div className="space-y-3">
                {demoCandidates.map((candidate) => {
                  const selected = candidate.id === selectedCandidateId;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-tf-accent/40 bg-tf-accent/10'
                          : 'border-white/40 bg-white/40 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-tf-primary">{candidate.profile.name}</p>
                        <span className="text-sm font-bold text-tf-accent">
                          {demoRankingResults.find((item) => item.candidateId === candidate.id)?.score || '--'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-tf-text-secondary">
                        {candidate.profile.currentTitle} · {candidate.profile.yearsOfExperience} 年经验
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {candidate.profile.skills.slice(0, 4).map((skill) => (
                          <span key={skill.name} className="rounded-full bg-white/70 px-2 py-1 text-[11px] text-tf-secondary">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5" hoverable={false}>
              <h2 className="mb-4 text-sm font-medium text-tf-primary">Agent 执行状态</h2>
              <DemoWorkflow activeStep={activeStep} />
            </GlassCard>
          </div>

          <div>
            {showResults ? (
              <DemoResultPanel
                result={demoMatchResult}
                ranking={demoRankingResults}
                skillGraph={skillGraph}
              />
            ) : (
              <GlassCard className="flex min-h-[520px] items-center justify-center p-10 text-center" hoverable={false}>
                <div>
                  <PlayCircle className="mx-auto mb-4 h-14 w-14 text-tf-text-secondary/40" />
                  <p className="text-lg font-bold text-tf-primary">等待 Agent 分析</p>
                  <p className="mt-2 text-sm text-tf-text-secondary">
                    点击“开始分析”后，将逐步点亮智能体并输出完整招聘决策结果。
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
