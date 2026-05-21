// ============================================================
// TalentFlow — Interview Assistant Page
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/interview/question-card';
import { useResumeStore } from '@/lib/store/resume-store';
import { useModelStore } from '@/lib/store/model-store';
import { useInterviewStore } from '@/lib/store/interview-store';
import { cn, getRoundLabel } from '@/lib/utils';
import type {
  InterviewRound,
  InterviewQuestion,
  InterviewEvaluation,
  InterviewReport,
} from '@/types';
import {
  MessageSquare,
  Sparkles,
  ChevronRight,
  AlertCircle,
  ClipboardList,
  FileText,
  Download,
} from 'lucide-react';
import Link from 'next/link';

const ROUNDS: { key: InterviewRound; label: string }[] = [
  { key: 'screening', label: '初筛面试' },
  { key: 'technical', label: '技术面试' },
  { key: 'cultural', label: '文化面试' },
  { key: 'final', label: '终面' },
];

export default function InterviewPage() {
  const { candidates } = useResumeStore();
  const { settings: modelSettings } = useModelStore();
  const { addRecord, loadFromDB } = useInterviewStore();

  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);
  const [selectedRound, setSelectedRound] = useState<InterviewRound>('screening');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidate = candidates[selectedCandidateIdx] || null;
  const isConfigured = modelSettings.modelName.length > 0 && modelSettings.apiKey.length > 0 && modelSettings.baseURL.length > 0;

  /** Load persisted interview records from IndexedDB on mount. */
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  /** Generate interview questions. */
  const handleGenerate = useCallback(async () => {
    if (!candidate) return;
    if (!isConfigured) {
      setError('请先配置模型名称、API Key 和 Base URL');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setEvaluations([]);
    setReport(null);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          candidate: candidate.profile,
          round: selectedRound,
          modelName: modelSettings.modelName,
          apiKey: modelSettings.apiKey,
          baseURL: modelSettings.baseURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '生成失败' }));
        throw new Error(errorData.error || '问题生成失败');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成过程中发生错误');
    } finally {
      setIsGenerating(false);
    }
  }, [candidate, selectedRound, modelSettings, isConfigured]);

  /** Evaluate a single answer. */
  const handleEvaluate = useCallback(
    async (questionId: string, answer: string) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      setEvaluatingId(questionId);
      setError(null);

      try {
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'evaluate',
            question,
            answer,
            modelName: modelSettings.modelName,
            apiKey: modelSettings.apiKey,
            baseURL: modelSettings.baseURL,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: '评估失败' }));
          throw new Error(errorData.error || '评估失败');
        }

        const data = await response.json();
        setEvaluations((prev) => [...prev, data.evaluation]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '评估过程中发生错误');
      } finally {
        setEvaluatingId(null);
      }
    },
    [questions, modelSettings]
  );

  /** Generate full interview report. */
  const handleReport = useCallback(async () => {
    if (!candidate || evaluations.length === 0) return;

    setIsReportGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          candidate: candidate.profile,
          round: selectedRound,
          questions,
          evaluations,
          modelName: modelSettings.modelName,
          apiKey: modelSettings.apiKey,
          baseURL: modelSettings.baseURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '报告生成失败' }));
        throw new Error(errorData.error || '报告生成失败');
      }

      const data = await response.json();
      setReport(data.report);

      // Persist complete interview record to IndexedDB
      if (candidate) {
        await addRecord({
          id: `interview-${candidate.id}-${selectedRound}-${Date.now()}`,
          candidateId: candidate.id,
          round: selectedRound,
          questions,
          evaluations,
          report: data.report,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '报告生成过程中发生错误');
    } finally {
      setIsReportGenerating(false);
    }
  }, [candidate, selectedRound, questions, evaluations, modelSettings, addRecord]);

  /** Export report as JSON. */
  const handleExport = useCallback(() => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `面试报告_${report.candidateName}_${report.round}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <MessageSquare className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">面试助手</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            AI 面试助手
          </h1>
          <p className="text-tf-secondary">
            根据候选人背景和面试轮次，AI 自动生成问题、评估回答并生成面试报告
          </p>
        </div>

        {/* No candidates */}
        {candidates.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
            <p className="text-tf-secondary mb-4">请先上传并解析简历</p>
            <Link href="/upload">
              <Button icon={<ChevronRight className="w-4 h-4" />}>
                前往上传简历
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {/* Configuration area */}
            <GlassCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Candidate selector */}
                {candidates.length > 1 && (
                  <div className="md:col-span-1">
                    <p className="text-xs font-medium text-tf-primary mb-2">候选人</p>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedCandidateIdx(i)}
                          className={cn(
                            'glass-card-xs px-3 py-1.5 text-xs cursor-pointer',
                            'transition-all duration-300',
                            i === selectedCandidateIdx
                              ? 'bg-tf-accent/10 text-tf-accent border-tf-accent/30'
                              : 'text-tf-secondary hover:text-tf-primary'
                          )}
                        >
                          {c.profile.name || `候选人 ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Round selector */}
                <div className={candidates.length > 1 ? 'md:col-span-1' : 'md:col-span-2'}>
                  <p className="text-xs font-medium text-tf-primary mb-2">面试轮次</p>
                  <div className="flex flex-wrap gap-2">
                    {ROUNDS.map((round) => (
                      <button
                        key={round.key}
                        onClick={() => setSelectedRound(round.key)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs cursor-pointer',
                          'transition-all duration-300',
                          selectedRound === round.key
                            ? 'bg-tf-accent/10 text-tf-accent font-medium'
                            : 'glass-card-xs text-tf-secondary hover:text-tf-primary'
                        )}
                      >
                        {round.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <div className="flex items-end">
                  <Button
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!isConfigured}
                    icon={isGenerating ? undefined : <Sparkles className="w-4 h-4" />}
                    className="w-full"
                  >
                    {isGenerating ? '生成中...' : '生成面试问题'}
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Error */}
            {error && (
              <GlassCard variant="sm" className="p-4 flex items-center gap-3 border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </GlassCard>
            )}

            {/* Questions list */}
            {questions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-tf-primary">
                    <ClipboardList className="w-5 h-5 text-tf-accent" />
                    面试问题 ({getRoundLabel(selectedRound)})
                  </h2>
                  {evaluations.length > 0 && !report && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleReport}
                      loading={isReportGenerating}
                      icon={isReportGenerating ? undefined : <FileText className="w-4 h-4" />}
                    >
                      {isReportGenerating ? '生成中...' : '生成面试报告'}
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      evaluation={evaluations.find((e) => e.questionId === q.id)}
                      onEvaluate={handleEvaluate}
                      isEvaluating={evaluatingId === q.id}
                      showAnswer={!!evaluations.find((e) => e.questionId === q.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            {report && (
              <GlassCard className="p-6" shimmer>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-tf-primary">
                    <FileText className="w-5 h-5 text-tf-accent" />
                    面试报告
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    icon={<Download className="w-4 h-4" />}
                  >
                    导出
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-card-xs p-4 text-center">
                    <p className="text-3xl font-bold text-tf-accent">{report.overallScore}</p>
                    <p className="text-xs text-tf-text-secondary mt-1">综合评分</p>
                  </div>
                  <div className="glass-card-xs p-4 text-center">
                    <p className="text-lg font-bold text-tf-primary">{report.recommendation}</p>
                    <p className="text-xs text-tf-text-secondary mt-1">录用建议</p>
                  </div>
                </div>

                <div className="glass-card-xs p-4">
                  <p className="text-xs font-medium text-tf-primary mb-2">面试总结</p>
                  <p className="text-sm text-tf-secondary leading-relaxed">
                    {report.summary}
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Empty state */}
            {questions.length === 0 && !isGenerating && (
              <GlassCard className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
                <p className="text-tf-text-secondary">
                  选择候选人和面试轮次，点击&quot;生成面试问题&quot;开始
                </p>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
