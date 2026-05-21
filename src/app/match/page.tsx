// ============================================================
// TalentFlow — Match Result Page
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { MatchResultDisplay } from '@/components/match/match-result';
import { useResumeStore } from '@/lib/store/resume-store';
import { useModelStore } from '@/lib/store/model-store';
import { useMatchStore } from '@/lib/store/match-store';
import {
  Users,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Download,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function MatchPage() {
  const { candidates } = useResumeStore();
  const { settings: modelSettings } = useModelStore();
  const {
    results,
    activeResultIndex,
    jdText,
    isMatching,
    error,
    addResult,
    addRecord,
    setActiveResult,
    setJdText,
    setMatching,
    setError,
    loadFromDB,
  } = useMatchStore();

  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);

  /** Load persisted match records from IndexedDB on mount. */
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const handleMatch = useCallback(async () => {
    const candidate = candidates[selectedCandidateIdx];
    if (!candidate) {
      setError('请先上传并解析简历');
      return;
    }
    if (!jdText.trim()) {
      setError('请输入岗位描述 (JD)');
      return;
    }
    if (!modelSettings.modelName || !modelSettings.apiKey || !modelSettings.baseURL) {
      setError('请先配置模型名称、API Key 和 Base URL');
      return;
    }

    setMatching(true);
    setError(null);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: candidate.profile,
          jdText: jdText.trim(),
          modelName: modelSettings.modelName,
          apiKey: modelSettings.apiKey,
          baseURL: modelSettings.baseURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '匹配失败' }));
        throw new Error(errorData.error || '匹配计算失败');
      }

      const data = await response.json();
      addResult(data.result);

      // Persist to IndexedDB for candidate detail page
      if (candidate) {
        const r = data.result;
        const jd = jdText.trim();
        // Extract job title from JD — first non-empty line, max 40 chars
        const firstLine = jd.split(/\n/)[0]?.trim() || '';
        const titleMatch = firstLine.match(/(?:岗位|职位|标题|Title)[：:]\s*(.+)/i);
        const jobTitle = titleMatch
          ? titleMatch[1].slice(0, 40)
          : firstLine.slice(0, 40) || '未命名职位';

        addRecord({
          id: crypto.randomUUID(),
          candidateId: candidate.id,
          jobTitle,
          jobDescription: jd,
          score: r.overallScore,
          dimensions: r.dimensions || [],
          matchedSkills: [],
          missingSkills: [],
          summary: r.recommendation || '',
          recommendation: r.recommendation || '',
          strengths: r.strengths || [],
          weaknesses: r.weaknesses || [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '匹配过程中发生错误');
    } finally {
      setMatching(false);
    }
  }, [candidates, selectedCandidateIdx, jdText, modelSettings, addResult, addRecord, setMatching, setError]);

  const handleExport = useCallback(() => {
    const result = results[activeResultIndex];
    if (!result) return;

    const report = {
      candidateName: result.candidateName,
      overallScore: result.overallScore,
      dimensions: result.dimensions,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendation: result.recommendation,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `匹配报告_${result.candidateName}_${new Date().toLocaleDateString('zh-CN')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, activeResultIndex]);

  const activeResult = results[activeResultIndex] || null;
  const isConfigured = modelSettings.modelName.length > 0 && modelSettings.apiKey.length > 0 && modelSettings.baseURL.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <Users className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">智能匹配</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            人才匹配评估
          </h1>
          <p className="text-tf-secondary">
            输入岗位描述，AI 将从技能、经验、文化、潜力四个维度评估候选人匹配度
          </p>
        </div>

        {/* No candidates warning */}
        {candidates.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
            <p className="text-tf-secondary mb-4">请先上传并解析简历</p>
            <Link href="/upload">
              <Button icon={<ChevronRight className="w-4 h-4" />}>
                前往上传简历
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: JD input & controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candidate selector */}
              {candidates.length > 1 && (
                <GlassCard variant="sm" className="p-4">
                  <p className="text-xs font-medium text-tf-primary mb-3">选择候选人</p>
                  <div className="flex flex-wrap gap-2">
                    {candidates.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCandidateIdx(i)}
                        className={`
                          glass-card-xs px-3 py-1.5 text-xs cursor-pointer
                          transition-all duration-300
                          ${
                            i === selectedCandidateIdx
                              ? 'bg-tf-accent/10 text-tf-accent border-tf-accent/30'
                              : 'text-tf-secondary hover:text-tf-primary'
                          }
                        `}
                      >
                        {c.profile.name || `候选人 ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Candidate info card */}
              {candidates[selectedCandidateIdx] && (
                <GlassCard variant="sm" className="p-4">
                  <p className="text-xs font-medium text-tf-primary mb-3">当前候选人</p>
                  <div className="space-y-2 text-xs text-tf-secondary">
                    <p><span className="text-tf-primary">姓名：</span>{candidates[selectedCandidateIdx].profile.name || '未提供'}</p>
                    <p><span className="text-tf-primary">职位：</span>{candidates[selectedCandidateIdx].profile.currentTitle || '未提供'}</p>
                    <p><span className="text-tf-primary">工作年限：</span>{candidates[selectedCandidateIdx].profile.yearsOfExperience || 0} 年</p>
                    <p>
                      <span className="text-tf-primary">技能数量：</span>
                      {candidates[selectedCandidateIdx].profile.skills?.length || 0} 项
                      {(!candidates[selectedCandidateIdx].profile.skills || candidates[selectedCandidateIdx].profile.skills.length === 0) && (
                        <span className="ml-2 text-amber-500">（AI 将从工作/项目经历推断技能）</span>
                      )}
                    </p>
                  </div>
                </GlassCard>
              )}

              {/* JD Input */}
              <GlassCard variant="sm" className="p-5">
                <Textarea
                  label="岗位描述 (JD)"
                  placeholder="粘贴岗位描述内容...&#10;&#10;示例：&#10;岗位：高级前端工程师&#10;要求：3年以上React/TypeScript经验，熟悉Next.js..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleMatch}
                    loading={isMatching}
                    disabled={!isConfigured || !jdText.trim()}
                    icon={isMatching ? undefined : <Sparkles className="w-4 h-4" />}
                    className="w-full"
                  >
                    {isMatching ? 'AI 分析中...' : '开始匹配'}
                  </Button>
                </div>
              </GlassCard>

              {/* Error */}
              {error && (
                <GlassCard variant="sm" className="p-4 flex items-center gap-3 border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </GlassCard>
              )}

              {/* Previous results */}
              {results.length > 1 && (
                <GlassCard variant="sm" className="p-4">
                  <p className="text-xs font-medium text-tf-primary mb-3">历史结果</p>
                  <div className="space-y-2">
                    {results.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveResult(i)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm
                          cursor-pointer transition-all duration-300
                          ${
                            i === activeResultIndex
                              ? 'glass-card-xs bg-tf-accent/10 text-tf-accent'
                              : 'text-tf-secondary hover:bg-black/5'
                          }
                        `}
                      >
                        <span>{r.candidateName}</span>
                        <span className="font-bold">{r.overallScore}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right: Match results */}
            <div className="lg:col-span-3">
              {activeResult ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-serif font-bold text-tf-primary">
                      {activeResult.candidateName} 的匹配报告
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExport}
                      icon={<Download className="w-4 h-4" />}
                    >
                      导出报告
                    </Button>
                  </div>
                  <MatchResultDisplay result={activeResult} />
                </>
              ) : (
                <GlassCard className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
                  <p className="text-tf-text-secondary">
                    输入 JD 并点击&quot;开始匹配&quot;查看评估结果
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
