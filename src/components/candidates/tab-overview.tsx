// ============================================================
// TalentFlow — Overview Tab for Candidate Detail
// ============================================================

'use client';

import { GlassCard } from '@/components/ui/glass-card';
import type { CandidateRecord } from '@/types';
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Calendar,
} from 'lucide-react';

interface TabOverviewProps {
  candidate: CandidateRecord;
}

export function TabOverview({ candidate }: TabOverviewProps) {
  const { profile } = candidate;

  return (
    <div className="space-y-6">
      {/* Basic info card */}
      <GlassCard className="p-6" hoverable={false}>
        <h3 className="font-serif font-bold text-tf-primary mb-4">基本信息</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tf-accent/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-tf-accent" />
            </div>
            <div>
              <p className="text-xs text-tf-text-secondary">邮箱</p>
              <p className="text-sm text-tf-primary">
                {profile.email || '未填写'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tf-accent/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-tf-accent" />
            </div>
            <div>
              <p className="text-xs text-tf-text-secondary">电话</p>
              <p className="text-sm text-tf-primary">
                {profile.phone || '未填写'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tf-accent/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-tf-accent" />
            </div>
            <div>
              <p className="text-xs text-tf-text-secondary">当前职位</p>
              <p className="text-sm text-tf-primary">
                {profile.currentTitle || '未填写'}
                {profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tf-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-tf-accent" />
            </div>
            <div>
              <p className="text-xs text-tf-text-secondary">工作年限</p>
              <p className="text-sm text-tf-primary">
                {profile.yearsOfExperience > 0
                  ? `${profile.yearsOfExperience} 年`
                  : '未填写'}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Summary */}
      {profile.summary && (
        <GlassCard className="p-6" hoverable={false}>
          <h3 className="font-serif font-bold text-tf-primary mb-3">简历摘要</h3>
          <p className="text-sm text-tf-secondary leading-relaxed whitespace-pre-line">
            {profile.summary}
          </p>
        </GlassCard>
      )}

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <GlassCard className="p-6" hoverable={false}>
          <h3 className="font-serif font-bold text-tf-primary mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-tf-accent" />
            教育背景
          </h3>
          <div className="space-y-4">
            {(profile.education || []).map((edu, idx) => (
              <div
                key={idx}
                className="glass-card-xs p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-tf-primary">
                      {edu.school || '未知学校'}
                    </p>
                    <p className="text-sm text-tf-secondary">
                      {edu.degree} {edu.major && `· ${edu.major}`}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs text-tf-accent mt-1">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-tf-text-secondary whitespace-nowrap">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Work Experience */}
      {profile.workExperience && profile.workExperience.length > 0 && (
        <GlassCard className="p-6" hoverable={false}>
          <h3 className="font-serif font-bold text-tf-primary mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-tf-accent" />
            工作经历
          </h3>
          <div className="space-y-4">
            {(profile.workExperience || []).map((work, idx) => (
              <div
                key={idx}
                className="glass-card-xs p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-tf-primary">
                      {work.title || '未知职位'}
                    </p>
                    <p className="text-sm text-tf-secondary">
                      {work.company}
                    </p>
                  </div>
                  <span className="text-xs text-tf-text-secondary whitespace-nowrap">
                    {work.startDate} — {work.endDate}
                  </span>
                </div>
                {work.description && (
                  <p className="text-sm text-tf-secondary leading-relaxed whitespace-pre-line">
                    {work.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <GlassCard className="p-6" hoverable={false}>
          <h3 className="font-serif font-bold text-tf-primary mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-tf-accent" />
            项目经历
          </h3>
          <div className="space-y-4">
            {(profile.projects || []).map((proj, idx) => (
              <div
                key={idx}
                className="glass-card-xs p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-tf-primary">
                      {proj.name || '未命名项目'}
                    </p>
                    <p className="text-sm text-tf-secondary">{proj.role}</p>
                  </div>
                  <span className="text-xs text-tf-text-secondary whitespace-nowrap">
                    {proj.startDate} — {proj.endDate}
                  </span>
                </div>
                {proj.description && (
                  <p className="text-sm text-tf-secondary leading-relaxed whitespace-pre-line mb-2">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 rounded-lg bg-tf-accent/5 text-tf-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Raw text (collapsible) */}
      {profile.rawText && (
        <GlassCard className="p-6" hoverable={false}>
          <details>
            <summary className="font-serif font-bold text-tf-primary cursor-pointer select-none">
              原始文本
            </summary>
            <div className="mt-3 p-4 glass-card-xs text-sm text-tf-secondary leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
              {profile.rawText}
            </div>
          </details>
        </GlassCard>
      )}
    </div>
  );
}
