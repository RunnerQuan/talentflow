// ============================================================
// TalentFlow — Skill Graph SVG Visualization
// ============================================================

'use client';

import { useState, useMemo, useCallback } from 'react';
import { getSkillLevelLabel } from '@/lib/utils';
import type { SkillNode, SkillEdge, SkillGraphData, Skill } from '@/types';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressBar } from '@/components/ui/progress';
import {
  Code2,
  Database,
  Globe,
  Server,
  Layers,
  Cpu,
  Palette,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';

/** Category color map. */
const CATEGORY_COLORS: Record<string, string> = {
  '编程语言': '#CA8A04',
  '前端': '#D97706',
  '后端': '#B45309',
  '数据库': '#92400E',
  'DevOps': '#78350F',
  'AI/ML': '#CA8A04',
  '设计': '#A16207',
  '数据': '#854D0E',
  '安全': '#713F12',
  '其他': '#44403C',
};

/** Category icon map. */
const CATEGORY_ICONS: Record<string, typeof Code2> = {
  '编程语言': Code2,
  '前端': Globe,
  '后端': Server,
  '数据库': Database,
  'DevOps': Layers,
  'AI/ML': Cpu,
  '设计': Palette,
  '数据': BarChart3,
  '安全': Shield,
  '其他': Zap,
};

/** Default category for unknown skills. */
const DEFAULT_CATEGORY = '其他';

/**
 * Generate skill graph data from a flat list of skills.
 * Positions nodes in a force-directed-ish layout using categories as clusters.
 */
export function buildSkillGraph(skills: Skill[]): SkillGraphData {
  const categoryGroups: Record<string, Skill[]> = {};
  skills.forEach((skill) => {
    const cat = skill.category || DEFAULT_CATEGORY;
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(skill);
  });

  const categories = Object.keys(categoryGroups);
  const centerX = 340;
  const centerY = 250;
  const clusterRadius = 140;

  const nodes: SkillNode[] = [];
  const edges: SkillEdge[] = [];

  categories.forEach((cat, catIdx) => {
    const angle = (2 * Math.PI * catIdx) / categories.length - Math.PI / 2;
    const cx = centerX + clusterRadius * Math.cos(angle);
    const cy = centerY + clusterRadius * Math.sin(angle);

    const groupSkills = categoryGroups[cat];
    groupSkills.forEach((skill, skillIdx) => {
      const subAngle = (2 * Math.PI * skillIdx) / groupSkills.length;
      const subRadius = 40 + groupSkills.length * 8;
      const x = cx + subRadius * Math.cos(subAngle);
      const y = cy + subRadius * Math.sin(subAngle);

      nodes.push({
        id: skill.name,
        name: skill.name,
        category: cat,
        level: skill.level,
        x: Math.max(30, Math.min(650, x)),
        y: Math.max(30, Math.min(470, y)),
      });
    });

    // Connect skills within the same category
    for (let i = 0; i < groupSkills.length - 1; i++) {
      for (let j = i + 1; j < groupSkills.length; j++) {
        edges.push({
          source: groupSkills[i].name,
          target: groupSkills[j].name,
          relation: 'complementary',
        });
      }
    }
  });

  return { nodes, edges };
}

interface SkillGraphProps {
  skills: Skill[];
  onNodeClick?: (skill: Skill) => void;
}

export function SkillGraph({ skills, onNodeClick }: SkillGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const graphData = useMemo(() => buildSkillGraph(skills), [skills]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, SkillNode>();
    graphData.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [graphData.nodes]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode(nodeId === selectedNode ? null : nodeId);
      const skill = skills.find((s) => s.name === nodeId);
      if (skill && onNodeClick) onNodeClick(skill);
    },
    [selectedNode, skills, onNodeClick]
  );

  const selectedSkill = skills.find((s) => s.name === selectedNode);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* SVG Graph */}
      <GlassCard className="flex-1 p-4 sm:p-6 overflow-hidden">
        <svg
          viewBox="0 0 680 500"
          className="w-full h-auto"
          style={{ minHeight: 300 }}
        >
          {/* Edges */}
          {graphData.edges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const isHighlighted =
              edge.source === selectedNode || edge.target === selectedNode ||
              edge.source === hoveredNode || edge.target === hoveredNode;

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? '#CA8A04' : 'rgba(0,0,0,0.06)'}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeDasharray={edge.relation === 'prerequisite' ? '4,4' : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {graphData.nodes.map((node) => {
            const isSelected = node.id === selectedNode;
            const isHovered = node.id === hoveredNode;
            const baseRadius = 8 + node.level * 3;
            const radius = isSelected ? baseRadius + 4 : isHovered ? baseRadius + 2 : baseRadius;
            const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS[DEFAULT_CATEGORY];

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Glow */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill={color}
                    opacity={0.15}
                    className="transition-all duration-300"
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={isSelected ? color : `${color}CC`}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.6)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-300"
                />
                {/* Label */}
                {(isSelected || isHovered || node.level >= 4) && (
                  <text
                    x={node.x}
                    y={node.y + radius + 14}
                    textAnchor="middle"
                    fill="#1C1917"
                    fontSize={10}
                    fontWeight={isSelected ? 600 : 400}
                    className="transition-all duration-300 pointer-events-none"
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </GlassCard>

      {/* Detail panel */}
      <div className="lg:w-72 flex-shrink-0">
        {selectedSkill ? (
          <GlassCard className="p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[selectedSkill.category] || CATEGORY_COLORS[DEFAULT_CATEGORY]}20`,
                }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS[selectedSkill.category] || Zap;
                  return (
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: CATEGORY_COLORS[selectedSkill.category] || CATEGORY_COLORS[DEFAULT_CATEGORY],
                      }}
                    />
                  );
                })()}
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-tf-primary">
                  {selectedSkill.name}
                </h3>
                <span className="text-xs text-tf-text-secondary">
                  {selectedSkill.category}
                </span>
              </div>
            </div>

            <ProgressBar
              value={selectedSkill.level}
              max={5}
              label="熟练度"
              showPercent
              color="accent"
              className="mb-4"
            />

            <div className="glass-card-xs p-3 text-center">
              <span className="text-2xl font-bold text-tf-accent">
                {getSkillLevelLabel(selectedSkill.level)}
              </span>
              <p className="text-xs text-tf-text-secondary mt-1">当前等级</p>
            </div>

            {/* Related skills in same category */}
            <div className="mt-4">
              <p className="text-xs font-medium text-tf-primary mb-2">同类别技能</p>
              <div className="flex flex-wrap gap-1.5">
                {skills
                  .filter((s) => s.category === selectedSkill.category && s.name !== selectedSkill.name)
                  .map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleNodeClick(s.name)}
                      className="inline-block px-2.5 py-1 text-xs rounded-lg bg-tf-accent/10 text-tf-accent cursor-pointer hover:bg-tf-accent/20 transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard variant="sm" className="p-6 text-center">
            <Code2 className="w-8 h-8 text-tf-text-secondary/30 mx-auto mb-3" />
            <p className="text-sm text-tf-text-secondary">
              点击图谱中的节点查看技能详情
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
