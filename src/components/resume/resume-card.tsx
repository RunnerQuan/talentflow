// ============================================================
// TalentFlow — Resume Result Card
// ============================================================

'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { ProgressBar } from '@/components/ui/progress';
import { cn, getSkillLevelLabel } from '@/lib/utils';
import type { CandidateProfile } from '@/types';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code2,
  Building2,
  Calendar,
} from 'lucide-react';

interface ResumeCardProps {
  candidate: CandidateProfile;
}

export function ResumeCard({ candidate }: ResumeCardProps) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-tf-accent/10 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-tf-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-serif font-bold text-tf-primary mb-1">
              {candidate.name || '未知姓名'}
            </h3>
            <p className="text-sm text-tf-secondary mb-3">
              {candidate.currentTitle || '未知职位'}
              {candidate.currentCompany ? ` @ ${candidate.currentCompany}` : ''}
              {candidate.yearsOfExperience > 0
                ? ` · ${candidate.yearsOfExperience}年经验`
                : ''}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-tf-text-secondary">
              {candidate.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {candidate.email}
                </span>
              )}
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        {candidate.summary && (
          <p className="mt-4 text-sm text-tf-secondary leading-relaxed border-t border-black/5 pt-4">
            {candidate.summary}
          </p>
        )}
      </GlassCard>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <GlassCard variant="sm" className="p-6">
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary mb-4">
            <Code2 className="w-4 h-4 text-tf-accent" />
            技能画像
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidate.skills.slice(0, 12).map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="text-xs text-tf-primary w-24 truncate">
                  {skill.name}
                </span>
                <ProgressBar
                  value={skill.level}
                  max={5}
                  color="accent"
                  className="flex-1"
                />
                <span className="text-xs text-tf-text-secondary w-10 text-right">
                  {getSkillLevelLabel(skill.level)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Work Experience */}
      {candidate.workExperience && candidate.workExperience.length > 0 && (
        <GlassCard variant="sm" className="p-6">
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary mb-4">
            <Briefcase className="w-4 h-4 text-tf-accent" />
            工作经历
          </h4>
          <div className="space-y-4">
            {candidate.workExperience.map((work, i) => (
              <div
                key={i}
                className={cn(
                  'pl-4 border-l-2 border-tf-accent/20',
                  i < candidate.workExperience.length - 1 && 'pb-4'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-tf-primary">
                    {work.title}
                  </span>
                  <span className="text-xs text-tf-text-secondary">@ {work.company}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-tf-text-secondary mb-2">
                  <Calendar className="w-3 h-3" />
                  {work.startDate} — {work.endDate}
                </div>
                <p className="text-xs text-tf-secondary leading-relaxed">
                  {work.description}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Education */}
      {candidate.education && candidate.education.length > 0 && (
        <GlassCard variant="sm" className="p-6">
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary mb-4">
            <GraduationCap className="w-4 h-4 text-tf-accent" />
            教育背景
          </h4>
          <div className="space-y-3">
            {candidate.education.map((edu, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-tf-primary">{edu.school}</p>
                  <p className="text-xs text-tf-text-secondary">
                    {edu.degree} · {edu.major}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </div>
                <span className="text-xs text-tf-text-secondary">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Projects */}
      {candidate.projects && candidate.projects.length > 0 && (
        <GlassCard variant="sm" className="p-6">
          <h4 className="flex items-center gap-2 text-sm font-medium text-tf-primary mb-4">
            <Building2 className="w-4 h-4 text-tf-accent" />
            项目经历
          </h4>
          <div className="space-y-4">
            {candidate.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-tf-primary">{proj.name}</span>
                  <span className="text-xs text-tf-text-secondary">· {proj.role}</span>
                </div>
                <p className="text-xs text-tf-secondary mb-2 leading-relaxed">
                  {proj.description}
                </p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="inline-block px-2 py-0.5 text-xs rounded-lg bg-tf-accent/10 text-tf-accent"
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
    </div>
  );
}
