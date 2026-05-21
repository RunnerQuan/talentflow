// ============================================================
// TalentFlow — Interview Tab for Candidate Detail
// ============================================================

'use client';

import { useMemo } from 'react';
import { useInterviewStore } from '@/lib/store/interview-store';
import { GlassCard } from '@/components/ui/glass-card';
import { cn, getRoundLabel, timeAgo } from '@/lib/utils';
import type { InterviewRecord } from '@/types';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';

interface TabInterviewProps {
  candidateId: string;
}

/** Get recommendation display info. */
function getRecommendationInfo(rec: string): {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
} {
  const lower = rec.toLowerCase();
  if (lower.includes('hire') || lower.includes('推荐') || lower.includes('strong')) {
    return {
      icon: CheckCircle2,
      label: rec,
      color: 'text-emerald-600',
    };
  }
  if (lower.includes('reject') || lower.includes('不') || lower.includes('fail')) {
    return {
      icon: XCircle,
      label: rec,
      color: 'text-red-500',
    };
  }
  return {
    icon: MinusCircle,
    label: rec,
    color: 'text-amber-600',
  };
}

export function TabInterview({ candidateId }: TabInterviewProps) {
  const allRecords = useInterviewStore((s) => s.records);

  /** Filter and sort by creation date descending */
  const sortedRecords = useMemo(
    () =>
      allRecords
        .filter((r) => r.candidateId === candidateId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [allRecords, candidateId]
  );

  if (sortedRecords.length === 0) {
    return (
      <GlassCard className="p-8 text-center" hoverable={false}>
        <MessageSquare className="w-10 h-10 text-tf-text-secondary/30 mx-auto mb-3" />
        <p className="text-tf-secondary mb-1">暂无面试记录</p>
        <p className="text-sm text-tf-text-secondary">
          使用面试助手功能后，面试记录将出现在这里
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-tf-accent/10" />

        <div className="space-y-4">
          {sortedRecords.map((record) => (
            <InterviewTimelineItem key={record.id} record={record} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Single timeline item for an interview record. */
function InterviewTimelineItem({ record }: { record: InterviewRecord }) {
  const report = record.report;
  const recommendationInfo = report
    ? getRecommendationInfo(report.recommendation)
    : null;
  const RecIcon = recommendationInfo?.icon || MinusCircle;

  return (
    <div className="relative pl-12">
      {/* Timeline dot */}
      <div className="absolute left-3.5 top-5 w-3 h-3 rounded-full bg-tf-accent border-2 border-white shadow-sm" />

      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tf-accent/10 text-tf-accent mb-2">
              {getRoundLabel(record.round)}
            </span>
            <div className="flex items-center gap-2 text-xs text-tf-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(record.createdAt)}</span>
            </div>
          </div>

          {report && recommendationInfo && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                recommendationInfo.color
              )}
            >
              <RecIcon className="w-4 h-4" />
              {recommendationInfo.label}
            </div>
          )}
        </div>

        {/* Report summary */}
        {report && (
          <>
            {report.summary && (
              <p className="text-sm text-tf-secondary leading-relaxed mb-3">
                {report.summary}
              </p>
            )}

            {/* Score */}
            {report.overallScore > 0 && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-tf-text-secondary">综合评分</span>
                <div className="flex-1 h-2 rounded-full bg-tf-accent/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-tf-accent transition-all"
                    style={{ width: `${Math.min(100, report.overallScore)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-tf-accent">
                  {report.overallScore.toFixed(0)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Questions count */}
        <div className="flex items-center gap-4 text-xs text-tf-text-secondary">
          <span>{(record.questions || []).length} 个问题</span>
          <span>{(record.evaluations || []).length} 个评价</span>
        </div>
      </GlassCard>
    </div>
  );
}
