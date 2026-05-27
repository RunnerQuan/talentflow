// ============================================================
// TalentFlow — Batch Candidate Ranking Page
// ============================================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BarChart3, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { JDPanel } from '@/components/ranking/jd-panel';
import { CandidateRankCard } from '@/components/ranking/candidate-rank-card';
import { RankingSummary } from '@/components/ranking/ranking-summary';
import { RankingTable } from '@/components/ranking/ranking-table';
import { useResumeStore } from '@/lib/store/resume-store';
import { useModelStore } from '@/lib/store/model-store';
import { demoCandidates, demoJD, demoRankingResults, demoRankingSummary } from '@/lib/demo/demo-data';
import type { BatchMatchResult, BatchMatchSummary } from '@/types';

export default function RankingPage() {
  const { candidates, loadFromDB } = useResumeStore();
  const { settings } = useModelStore();
  const [jdText, setJdText] = useState(demoJD.description);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<BatchMatchResult[]>(demoRankingResults);
  const [summary, setSummary] = useState<BatchMatchSummary>(demoRankingSummary);
  const [isRanking, setIsRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = settings.modelName && settings.apiKey && settings.baseURL;
  const pool = candidates.length > 0 ? candidates : demoCandidates;
  const usingDemoPool = candidates.length === 0;

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const effectiveSelectedIds = useMemo(
    () => (selectedIds.length > 0 ? selectedIds : pool.map((candidate) => candidate.id)),
    [pool, selectedIds]
  );
  const selectedCandidates = useMemo(
    () => pool.filter((candidate) => effectiveSelectedIds.includes(candidate.id)),
    [pool, effectiveSelectedIds]
  );

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      (prev.length > 0 ? prev : pool.map((candidate) => candidate.id)).includes(id)
        ? (prev.length > 0 ? prev : pool.map((candidate) => candidate.id)).filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const runRanking = async () => {
    if (selectedCandidates.length === 0) {
      setError('请至少选择一个候选人');
      return;
    }
    if (!jdText.trim()) {
      setError('请输入岗位描述');
      return;
    }

    if (!isConfigured || usingDemoPool) {
      setResults(demoRankingResults);
      setSummary(demoRankingSummary);
      setError(null);
      return;
    }

    setIsRanking(true);
    setError(null);
    try {
      const response = await fetch('/api/batch-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates: selectedCandidates.map((candidate) => candidate.profile),
          jdText,
          modelName: settings.modelName,
          apiKey: settings.apiKey,
          baseURL: settings.baseURL,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: '排序失败' }));
        throw new Error(data.error || '排序失败');
      }
      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '排序失败');
    } finally {
      setIsRanking(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 glass-card-sm px-4 py-2">
            <BarChart3 className="h-4 w-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">批量候选人排序</span>
          </div>
          <h1 className="text-3xl font-bold text-tf-primary">一个岗位，多名候选人，自动排序</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-tf-secondary">
            面向真实招聘场景，对候选人池进行横向比较，输出 Top 候选人、风险和建议动作。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="min-w-0 space-y-6">
            <JDPanel jdText={jdText} onChange={setJdText} />

            <GlassCard className="p-5" hoverable={false}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-medium text-tf-primary">
                  <Users className="h-4 w-4 text-tf-accent" />
                  候选人选择
                </h2>
                {usingDemoPool && (
                  <span className="rounded-full bg-tf-accent/10 px-2.5 py-1 text-xs text-tf-accent">
                    Demo 数据
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {pool.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => toggleCandidate(candidate.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      effectiveSelectedIds.includes(candidate.id)
                        ? 'border-tf-accent/40 bg-tf-accent/10'
                        : 'border-white/40 bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <p className="text-sm font-medium text-tf-primary">{candidate.profile.name}</p>
                    <p className="text-xs text-tf-text-secondary">
                      {candidate.profile.currentTitle || '未填写职位'} · {candidate.profile.skills.length} 项技能
                    </p>
                  </button>
                ))}
              </div>
              <Button
                className="mt-5 w-full"
                onClick={runRanking}
                loading={isRanking}
                icon={isRanking ? undefined : <Sparkles className="h-4 w-4" />}
              >
                {isConfigured && !usingDemoPool ? '开始 AI 排序' : '使用 Demo 排序'}
              </Button>
              {!isConfigured && (
                <p className="mt-3 text-xs leading-relaxed text-tf-text-secondary">
                  未配置 API Key 时自动展示稳定 Demo 排序。配置模型后可对真实候选人排序。
                </p>
              )}
            </GlassCard>

            {error && (
              <GlassCard variant="sm" className="flex items-center gap-3 p-4 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </GlassCard>
            )}
          </div>

          <div className="min-w-0 space-y-6">
            <RankingSummary summary={summary} />
            <div className="grid gap-4 md:grid-cols-3">
              {results.slice(0, 3).map((result) => (
                <CandidateRankCard key={result.candidateName} result={result} />
              ))}
            </div>
            <GlassCard className="p-5" hoverable={false}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-tf-primary">候选人排序结果</h2>
                <Link href="/demo" className="text-xs text-tf-text-secondary hover:text-tf-primary">
                  查看完整演示
                </Link>
              </div>
              <RankingTable results={results} />
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
