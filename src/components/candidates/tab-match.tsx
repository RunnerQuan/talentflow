// ============================================================
// TalentFlow — Match Results Tab for Candidate Detail
// ============================================================

'use client';

import { useMemo, useState } from 'react';
import { useMatchStore } from '@/lib/store/match-store';
import { GlassCard } from '@/components/ui/glass-card';
import { Dialog } from '@/components/ui/dialog';
import { RingProgress } from '@/components/ui/progress';
import { cn, timeAgo, formatPercent, truncate } from '@/lib/utils';
import type { MatchResultRecord } from '@/types';
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface TabMatchProps {
  candidateId: string;
}

/* ── helpers ─────────────────────────────────────────────── */

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-600';
  if (score >= 60) return 'bg-amber-500/10 text-amber-600';
  return 'bg-red-500/10 text-red-600';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return '高度匹配';
  if (score >= 60) return '较为匹配';
  return '匹配度较低';
}

/* ── main component ──────────────────────────────────────── */

export function TabMatch({ candidateId }: TabMatchProps) {
  const allRecords = useMatchStore((s) => s.records);
  const [openRecord, setOpenRecord] = useState<MatchResultRecord | null>(null);

  /** Filter and sort by score descending */
  const sortedRecords = useMemo(
    () =>
      allRecords
        .filter((r) => r.candidateId === candidateId)
        .sort((a, b) => b.score - a.score),
    [allRecords, candidateId]
  );

  if (sortedRecords.length === 0) {
    return (
      <GlassCard className="p-8 text-center" hoverable={false}>
        <BarChart3 className="w-10 h-10 text-tf-text-secondary/30 mx-auto mb-3" />
        <p className="text-tf-secondary mb-1">暂无匹配结果</p>
        <p className="text-sm text-tf-text-secondary">
          使用智能匹配功能后，匹配结果将出现在这里
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      {sortedRecords.length > 1 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          <GlassCard variant="sm" className="p-4 text-center" hoverable={false}>
            <p className="text-2xl font-bold text-tf-primary">
              {sortedRecords.length}
            </p>
            <p className="text-xs text-tf-secondary mt-1">匹配次数</p>
          </GlassCard>
          <GlassCard variant="sm" className="p-4 text-center" hoverable={false}>
            <p
              className={cn(
                'text-2xl font-bold',
                getScoreColor(
                  sortedRecords.reduce((sum, r) => sum + r.score, 0) /
                    sortedRecords.length
                )
              )}
            >
              {(
                sortedRecords.reduce((sum, r) => sum + r.score, 0) /
                sortedRecords.length
              ).toFixed(0)}
            </p>
            <p className="text-xs text-tf-secondary mt-1">平均分</p>
          </GlassCard>
          <GlassCard variant="sm" className="p-4 text-center" hoverable={false}>
            <p
              className={cn(
                'text-2xl font-bold',
                getScoreColor(sortedRecords[0].score)
              )}
            >
              {sortedRecords[0].score.toFixed(0)}
            </p>
            <p className="text-xs text-tf-secondary mt-1">最高分</p>
          </GlassCard>
        </div>
      )}

      {/* Match result cards */}
      {sortedRecords.map((record) => (
        <MatchResultCard
          key={record.id}
          record={record}
          onClick={() => setOpenRecord(record)}
        />
      ))}

      {/* Full report dialog */}
      <MatchReportDialog
        record={openRecord}
        onClose={() => setOpenRecord(null)}
      />
    </div>
  );
}

/* ── overview card ───────────────────────────────────────── */

function MatchResultCard({
  record,
  onClick,
}: {
  record: MatchResultRecord;
  onClick: () => void;
}) {
  const jdPreview = record.jobDescription
    ? truncate(record.jobDescription.replace(/\n/g, ' '), 120)
    : '';

  return (
    <GlassCard
      className="p-5 cursor-pointer transition-all duration-300 hover:shadow-lg group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-serif font-bold text-tf-primary truncate">
              {record.jobTitle || '未命名职位'}
            </h4>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                getScoreBg(record.score)
              )}
            >
              {getScoreLabel(record.score)}
            </span>
          </div>

          {jdPreview && (
            <p className="text-xs text-tf-text-secondary leading-relaxed mb-2 line-clamp-2">
              {jdPreview}
            </p>
          )}

          {record.summary && (
            <p className="text-sm text-tf-secondary leading-relaxed line-clamp-2">
              {record.summary}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 text-xs text-tf-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(record.createdAt)}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-tf-text-secondary/50 group-hover:text-tf-accent transition-colors" />
          </div>
        </div>

        {/* Right: score ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${record.score}, 100`}
              className={getScoreColor(record.score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn('text-xs font-bold', getScoreColor(record.score))}
            >
              {record.score.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── full report dialog ──────────────────────────────────── */

function MatchReportDialog({
  record,
  onClose,
}: {
  record: MatchResultRecord | null;
  onClose: () => void;
}) {
  if (!record) return null;

  const dimensions = record.dimensions || [];
  const hasDimensions = dimensions.length > 0;

  return (
    <Dialog
      open={!!record}
      onClose={onClose}
      maxWidth="3xl"
      title={record.jobTitle || '匹配报告'}
    >
      <div className="space-y-5">
        {/* Score + Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Score ring */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={`${record.score}, 100`}
                className={getScoreColor(record.score)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-xl font-bold leading-none', getScoreColor(record.score))}>
                {record.score.toFixed(0)}
              </span>
              <span className="text-[10px] text-tf-text-secondary mt-0.5">/ 100</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={cn(
                  'inline-block px-3 py-1 rounded-lg text-xs font-medium',
                  getScoreBg(record.score)
                )}
              >
                {getScoreLabel(record.score)}
              </span>
              <span className="text-xs text-tf-text-secondary">
                匹配时间：{new Date(record.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column layout: Strengths & Weaknesses + Dimension scores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Strengths & Weaknesses (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Strengths */}
            {record.strengths && record.strengths.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-medium text-tf-primary mb-2.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  候选人优势
                </h4>
                <ul className="space-y-2">
                  {record.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-tf-secondary"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {record.weaknesses && record.weaknesses.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-medium text-tf-primary mb-2.5 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  待提升项
                </h4>
                <ul className="space-y-2">
                  {record.weaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-tf-secondary"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Dimension scores (compact sidebar) */}
          {hasDimensions && (
            <div className="p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
              <h4 className="text-sm font-medium text-tf-primary mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-tf-accent" />
                各维度评分
              </h4>
              <div className="space-y-3">
                {dimensions.map((dim) => (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-tf-primary font-medium">
                        {dim.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-tf-text-secondary">
                          {formatPercent((dim.weight || 0) * 100, 0)}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-bold',
                            getScoreColor(dim.score)
                          )}
                        >
                          {dim.score}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
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
                    {dim.details && dim.details.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {dim.details.map((detail, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-tf-text-secondary pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-tf-accent/40"
                          >
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendation */}
        {(record.recommendation || record.summary) && (
          <div className="p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-tf-primary mb-2 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-tf-accent" />
              综合推荐
            </h4>
            <p className="text-sm text-tf-secondary leading-relaxed">
              {record.recommendation || record.summary}
            </p>
          </div>
        )}

        {/* Job Description — collapsible with scroll */}
        {record.jobDescription && (
          <div className="p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-medium text-tf-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-tf-accent" />
              岗位描述
            </h4>
            <div className="max-h-60 overflow-y-auto pr-2 -mr-1">
              <p className="text-sm text-tf-secondary leading-relaxed whitespace-pre-wrap">
                {record.jobDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
