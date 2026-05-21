// ============================================================
// TalentFlow — Skills Tab for Candidate Detail
// ============================================================

'use client';

import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressBar } from '@/components/ui/progress';
import { SkillGraph } from '@/components/skills/skill-graph';
import type { CandidateRecord } from '@/types';
import { cn, getSkillLevelLabel } from '@/lib/utils';
import { Network, List } from 'lucide-react';

interface TabSkillsProps {
  candidate: CandidateRecord;
}

type ViewMode = 'graph' | 'list';

export function TabSkills({ candidate }: TabSkillsProps) {
  const { skills } = candidate.profile;
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  /** Unique categories from skills */
  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || '其他'));
    return ['all', ...Array.from(cats)];
  }, [skills]);

  /** Filtered skills by category */
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'all') return skills;
    return skills.filter((s) => (s.category || '其他') === selectedCategory);
  }, [skills, selectedCategory]);

  if (skills.length === 0) {
    return (
      <GlassCard className="p-8 text-center" hoverable={false}>
        <Network className="w-10 h-10 text-tf-text-secondary/30 mx-auto mb-3" />
        <p className="text-tf-secondary">该候选人暂无技能数据</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* View mode toggle + category filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* View mode toggle */}
        <div className="flex gap-1 glass-card-xs p-1">
          <button
            onClick={() => setViewMode('graph')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer',
              viewMode === 'graph'
                ? 'bg-tf-accent/10 text-tf-accent font-medium'
                : 'text-tf-secondary hover:text-tf-primary'
            )}
          >
            <Network className="w-3.5 h-3.5" />
            图谱
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-tf-accent/10 text-tf-accent font-medium'
                : 'text-tf-secondary hover:text-tf-primary'
            )}
          >
            <List className="w-3.5 h-3.5" />
            列表
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-tf-accent/10 text-tf-accent font-medium'
                  : 'glass-card-xs text-tf-secondary hover:text-tf-primary'
              )}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'graph' ? (
        <SkillGraph skills={filteredSkills} />
      ) : (
        <GlassCard className="p-6" hoverable={false}>
          <div className="space-y-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="glass-card-xs p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-tf-primary text-sm">
                      {skill.name}
                    </p>
                    <p className="text-xs text-tf-text-secondary">
                      {skill.category || '其他'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-tf-accent">
                    {getSkillLevelLabel(skill.level)}
                  </span>
                </div>
                <ProgressBar
                  value={skill.level}
                  max={5}
                  color="accent"
                  showPercent={false}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
