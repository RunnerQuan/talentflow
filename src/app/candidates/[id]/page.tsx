// ============================================================
// TalentFlow — Candidate Detail Page (Tab Router)
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useResumeStore } from '@/lib/store/resume-store';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ResumeDrawer } from '@/components/candidates/resume-drawer';
import { TabOverview } from '@/components/candidates/tab-overview';
import { TabSkills } from '@/components/candidates/tab-skills';
import { TabInterview } from '@/components/candidates/tab-interview';
import { TabMatch } from '@/components/candidates/tab-match';
import { cn } from '@/lib/utils';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type CandidateRecord,
  type CandidateStatus,
} from '@/types';
import {
  ArrowLeft,
  Eye,
  User,
  Network,
  MessageSquare,
  BarChart3,
  ChevronDown,
} from 'lucide-react';

const TABS = [
  { key: 'overview', label: '概览', icon: User },
  { key: 'skills', label: '技能图谱', icon: Network },
  { key: 'interview', label: '面试记录', icon: MessageSquare },
  { key: 'match', label: '匹配结果', icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const { getById, updateCandidate, isLoading: storeLoading } = useResumeStore();
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const c = getById(candidateId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external store to local state
    if (c) setCandidate(c);
  }, [candidateId, getById]);

  // Refresh candidate data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const c = useResumeStore.getState().getById(candidateId);
      if (c) setCandidate(c);
    }, 2000);
    return () => clearInterval(interval);
  }, [candidateId]);

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!candidate) return;
    await updateCandidate(candidateId, { status: newStatus });
    setCandidate((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setStatusDropdownOpen(false);
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card-sm p-8 text-center">
            <div className="w-8 h-8 border-2 border-tf-accent/30 border-t-tf-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-tf-secondary">加载候选人信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-8 text-center">
            <p className="text-tf-secondary mb-4">未找到该候选人</p>
            <Link href="/candidates">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回候选人列表
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  /** Render the active tab content. */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TabOverview candidate={candidate} />;
      case 'skills':
        return <TabSkills candidate={candidate} />;
      case 'interview':
        return <TabInterview candidateId={candidateId} />;
      case 'match':
        return <TabMatch candidateId={candidateId} />;
      default:
        return <TabOverview candidate={candidate} />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link
          href="/candidates"
          className="inline-flex items-center gap-2 text-sm text-tf-secondary hover:text-tf-primary mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          返回候选人列表
        </Link>

        {/* Header card */}
        <GlassCard className="p-6 mb-6" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-tf-primary mb-1">
                {candidate.profile.name || '未知姓名'}
              </h1>
              <p className="text-tf-secondary text-sm">
                {candidate.profile.currentTitle || '未填写职位'}
                {candidate.profile.currentCompany
                  ? ` @ ${candidate.profile.currentCompany}`
                  : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
                    STATUS_COLORS[candidate.status]
                  )}
                >
                  {STATUS_LABELS[candidate.status]}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {statusDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 glass-card-sm p-1 min-w-[140px]">
                      {(Object.keys(STATUS_LABELS) as CandidateStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer',
                              status === candidate.status
                                ? 'bg-tf-accent/10 text-tf-accent'
                                : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
                            )}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* View resume button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                icon={<Eye className="w-4 h-4" />}
              >
                查看简历
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'glass-card-sm bg-tf-accent/10 text-tf-accent font-medium'
                    : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in-up" key={activeTab}>
          {renderTabContent()}
        </div>

        {/* Resume drawer */}
        <ResumeDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          candidateId={candidateId}
          fileName={candidate.resumeFile.name}
          fileType={candidate.resumeFile.type}
        />
      </div>
    </div>
  );
}
