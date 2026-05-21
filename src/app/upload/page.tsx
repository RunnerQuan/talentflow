// ============================================================
// TalentFlow — Resume Upload Page
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/resume/upload-zone';
import { useResumeStore } from '@/lib/store/resume-store';
import { useModelStore } from '@/lib/store/model-store';
import { putFile } from '@/lib/db';
import type { CandidateRecord, CandidateProfile } from '@/types';
import {
  Upload,
  Sparkles,
  FileText,
  Users,
  ChevronRight,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const {
    candidates,
    isUploading,
    error,
    addCandidate,
    loadFromDB,
    setUploading,
    setError,
  } = useResumeStore();

  const { settings: modelSettings, visionSettings } = useModelStore();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** Parse phase: 'idle' | 'uploading' | 'parsing' | 'done' */
  const [parsePhase, setParsePhase] = useState<'idle' | 'uploading' | 'parsing' | 'done'>('idle');

  /** Load candidates from IndexedDB on mount */
  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  /**
   * Persist parse state to localStorage so that navigating away
   * and coming back preserves the "parsing in progress" indicator.
   */
  const PERSIST_KEY = 'talentflow:parsing';

  /** Restore persisted parse state on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { fileName: string; phase: string; ts: number };
      // Only restore if less than 30 minutes old (avoid stale state)
      if (parsed.phase === 'parsing' && Date.now() - parsed.ts < 30 * 60 * 1000) {
        setParsePhase('parsing');
        setUploading(true);
        // Create a dummy File object so the UI shows the file name
        const f = new File([], parsed.fileName, { type: 'application/pdf' });
        setSelectedFile(f);
      }
    } catch {
      // ignore corrupt localStorage
    }
  }, [setUploading]);

  /** Save parse state to localStorage */
  const persistParseState = useCallback(
    (phase: string, file: File | null) => {
      try {
        if (phase === 'uploading' || phase === 'parsing') {
          localStorage.setItem(
            PERSIST_KEY,
            JSON.stringify({ fileName: file?.name || '', phase, ts: Date.now() })
          );
        } else {
          localStorage.removeItem(PERSIST_KEY);
        }
      } catch {
        // ignore quota errors
      }
    },
    []
  );

  /** Handle file selection from the upload zone. */
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
  }, [setError]);

  /** Parse the selected file using the API route. */
  const handleParse = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setParsePhase('uploading');
    persistParseState('uploading', selectedFile);
    setError(null);

    try {
      // Phase 1: Preparing upload (brief)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('modelName', modelSettings.modelName);
      formData.append('apiKey', modelSettings.apiKey);
      formData.append('baseURL', modelSettings.baseURL);

      // Vision model settings (if configured)
      if (visionSettings.enabled) {
        formData.append('visionEnabled', 'true');
        formData.append('visionModelName', visionSettings.modelName);
        formData.append('visionApiKey', visionSettings.apiKey);
        formData.append('visionBaseURL', visionSettings.baseURL);
      }

      // Phase 2: AI parsing (the long wait)
      setParsePhase('parsing');
      persistParseState('parsing', selectedFile);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '请求失败' }));
        throw new Error(errorData.error || '解析失败');
      }

      const data = await response.json();
      const profile: CandidateProfile = data.candidate;

      // Phase 3: Done — persist to IndexedDB
      setParsePhase('done');
      persistParseState('done', null);

      const now = new Date().toISOString();
      const candidateId = crypto.randomUUID();

      const record: CandidateRecord = {
        id: candidateId,
        profile,
        resumeFile: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        },
        tags: profile.skills ? profile.skills.slice(0, 5).map((s) => s.name) : [],
        status: 'new',
        createdAt: now,
        updatedAt: now,
      };

      // Store the raw file blob in IndexedDB files store
      await putFile(candidateId, selectedFile);
      // Store the candidate record
      await addCandidate(record);

      setSelectedFile(null);
      // Navigate to candidate detail page
      router.push(`/candidates/${candidateId}`);
    } catch (err) {
      setParsePhase('idle');
      persistParseState('idle', null);
      setError(err instanceof Error ? err.message : '解析过程中发生错误');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, modelSettings, visionSettings, addCandidate, setUploading, setError, router, persistParseState]);

  const isConfigured = modelSettings.modelName.length > 0 && modelSettings.apiKey.length > 0 && modelSettings.baseURL.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <Upload className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">简历解析</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            上传简历
          </h1>
          <p className="text-tf-secondary">
            上传候选人简历，AI 将自动提取结构化信息并生成人才画像
          </p>
        </div>

        {/* No API key warning */}
        {!isConfigured && (
          <GlassCard variant="sm" className="p-4 mb-6 flex items-center gap-3 border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-tf-primary">尚未配置 AI 模型</p>
              <p className="text-xs text-tf-secondary">请先在模型配置中设置模型名称、API Key 和 Base URL 才能使用 AI 解析功能</p>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                前往配置
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </GlassCard>
        )}

        {/* Upload zone */}
        <UploadZone onFileSelect={handleFileSelect} disabled={isUploading} />

        {/* Parse button & progress */}
        {(selectedFile || isUploading) && (
          <div className="mt-6">
            {isUploading && (
              <div className="mb-4">
                <ParseStatus phase={parsePhase} />
              </div>
            )}

            <div className="flex justify-end gap-3">
              {!isUploading && selectedFile && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedFile(null)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleParse}
                    disabled={!isConfigured}
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    AI 解析简历
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <GlassCard variant="sm" className="p-4 mt-6 flex items-center gap-3 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
          </GlassCard>
        )}

        {/* Candidates list */}
        {candidates.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-tf-primary">
                <Users className="w-5 h-5 text-tf-accent" />
                已解析候选人 ({candidates.length})
              </h2>
              <Link href="/candidates">
                <Button size="sm" variant="secondary">
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Candidate overview cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <CandidateOverviewCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {candidates.length === 0 && !isUploading && !selectedFile && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-tf-text-secondary/30 mx-auto mb-4" />
            <p className="text-tf-text-secondary">
              暂无已解析的简历，请上传文件开始
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ParseStatus — Phase-based loading indicator
// ============================================================

const PHASE_CONFIG = {
  uploading: {
    icon: Upload,
    text: '正在准备上传...',
    color: 'text-tf-accent',
    bgColor: 'bg-tf-accent/10',
  },
  parsing: {
    icon: Sparkles,
    text: 'AI 正在解析简历',
    color: 'text-tf-accent',
    bgColor: 'bg-tf-accent/10',
  },
  done: {
    icon: FileText,
    text: '解析完成！',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
} as const;

function ParseStatus({ phase }: { phase: 'idle' | 'uploading' | 'parsing' | 'done' }) {
  if (phase === 'idle') return null;

  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;

  return (
    <div className="glass-card-sm px-5 py-4 flex items-center gap-3">
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${config.bgColor}`}>
        <Icon className={`w-5 h-5 ${config.color} ${phase === 'parsing' ? 'animate-pulse' : ''}`} />
        {phase === 'parsing' && (
          <span className="absolute inset-0 rounded-xl border-2 border-tf-accent/30 animate-ping" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.color}`}>{config.text}</p>
        {phase === 'parsing' && (
          <p className="text-xs text-tf-text-secondary mt-0.5">
            正在与 AI 模型交互，请稍候...
          </p>
        )}
      </div>
      {phase === 'parsing' && (
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tf-accent/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-tf-accent/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-tf-accent/60 animate-bounce [animation-delay:300ms]" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// CandidateOverviewCard — Compact card on upload page
// ============================================================

function CandidateOverviewCard({ candidate }: { candidate: CandidateRecord }) {
  const { profile, resumeFile, createdAt } = candidate;
  const timeStr = createdAt
    ? new Date(createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Link href={`/candidates/${candidate.id}`}>
      <GlassCard
        className="p-5 cursor-pointer group"
        hoverable
      >
        {/* Header: avatar + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-tf-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-tf-accent">
              {profile.name ? profile.name.charAt(0) : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-tf-primary truncate group-hover:text-tf-accent transition-colors">
              {profile.name || '未知姓名'}
            </h3>
            <p className="text-xs text-tf-text-secondary truncate">
              {profile.currentTitle || '未知职位'}
              {profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-tf-text-secondary/40 group-hover:text-tf-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tf-text-secondary mb-3">
          {profile.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {profile.email}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {profile.phone}
            </span>
          )}
        </div>

        {/* Skills preview */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.name}
                className="inline-block px-2 py-0.5 text-xs rounded-lg bg-tf-accent/8 text-tf-accent"
              >
                {skill.name}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-lg bg-black/5 text-tf-text-secondary">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: file name + date */}
        <div className="flex items-center justify-between text-xs text-tf-text-secondary border-t border-black/5 pt-3">
          <span className="flex items-center gap-1 truncate max-w-[60%]">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            {resumeFile.name}
          </span>
          {timeStr && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {timeStr}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
