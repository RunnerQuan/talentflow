// ============================================================
// TalentFlow — Candidate List Page
// ============================================================

'use client';

import { useState, useMemo } from 'react';
import { useResumeStore } from '@/lib/store/resume-store';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CandidateCard } from '@/components/candidates/candidate-card';
import {
  STATUS_LABELS,
  type CandidateStatus,
} from '@/types';
import {
  UserCircle,
  Search,
  Users,
  Upload,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_FILTER_OPTIONS: Array<{ value: CandidateStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'new', label: STATUS_LABELS.new },
  { value: 'screening', label: STATUS_LABELS.screening },
  { value: 'interviewing', label: STATUS_LABELS.interviewing },
  { value: 'offer', label: STATUS_LABELS.offer },
  { value: 'rejected', label: STATUS_LABELS.rejected },
];

export default function CandidatesPage() {
  const { candidates, isLoading } = useResumeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');

  /** Filtered and searched candidates */
  const filteredCandidates = useMemo(() => {
    let result = candidates;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.profile.name.toLowerCase().includes(query) ||
          c.profile.email.toLowerCase().includes(query) ||
          c.profile.currentTitle.toLowerCase().includes(query) ||
          c.profile.currentCompany.toLowerCase().includes(query)
      );
    }

    return result;
  }, [candidates, statusFilter, searchQuery]);

  /** Status counts for stat cards */
  const statusCounts = useMemo(() => {
    const counts: Record<CandidateStatus, number> = {
      new: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    };
    candidates.forEach((c) => {
      counts[c.status]++;
    });
    return counts;
  }, [candidates]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card-sm p-8 text-center">
            <div className="w-8 h-8 border-2 border-tf-accent/30 border-t-tf-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-tf-secondary">加载候选人数据...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <UserCircle className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">候选人管理</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            候选人管理
          </h1>
          <p className="text-tf-secondary">
            管理所有已解析的候选人简历，跟踪招聘流程各阶段
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <GlassCard variant="sm" className="p-4 text-center" hoverable={false}>
            <p className="text-2xl font-bold text-tf-primary">{candidates.length}</p>
            <p className="text-xs text-tf-secondary mt-1">总人数</p>
          </GlassCard>
          {(Object.keys(STATUS_LABELS) as CandidateStatus[]).map((status) => (
            <GlassCard
              key={status}
              variant="sm"
              className="p-4 text-center cursor-pointer"
              onClick={() =>
                setStatusFilter(statusFilter === status ? 'all' : status)
              }
            >
              <p className="text-2xl font-bold text-tf-primary">
                {statusCounts[status]}
              </p>
              <p className="text-xs text-tf-secondary mt-1">
                {STATUS_LABELS[status]}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tf-text-secondary/50" />
            <input
              type="text"
              placeholder="搜索候选人姓名、邮箱、职位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-card-sm bg-transparent text-sm text-tf-primary placeholder:text-tf-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-tf-accent/30"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-tf-text-secondary/50 flex-shrink-0 mr-1" />
            {STATUS_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer',
                  statusFilter === option.value
                    ? 'bg-tf-accent/10 text-tf-accent font-medium'
                    : 'glass-card-xs text-tf-secondary hover:text-tf-primary'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Candidates grid */}
        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            {candidates.length === 0 ? (
              <>
                <Users className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
                <p className="text-tf-secondary mb-2">暂无候选人数据</p>
                <p className="text-sm text-tf-text-secondary mb-6">
                  上传简历后，候选人将自动出现在这里
                </p>
                <Link href="/upload">
                  <Button icon={<Upload className="w-4 h-4" />}>
                    上传简历
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
                <p className="text-tf-secondary">未找到匹配的候选人</p>
                <p className="text-sm text-tf-text-secondary mt-1">
                  请尝试调整搜索条件或筛选状态
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
