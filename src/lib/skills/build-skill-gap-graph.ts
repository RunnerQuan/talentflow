import type {
  JobSkillRequirement,
  Skill,
  SkillGapEdge,
  SkillGapGraphData,
  SkillGapNode,
} from '@/types';

function normalizeSkillName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function skillNodeId(name: string): string {
  return normalizeSkillName(name).replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-');
}

function gapLevelFor(requirement: JobSkillRequirement, candidateSkill?: Skill): SkillGapNode['gapLevel'] {
  if (candidateSkill) return 'none';
  return requirement.importance === 'must' ? 'major' : 'minor';
}

export function buildSkillGapGraph(
  candidateSkills: Skill[],
  jobSkills: JobSkillRequirement[]
): SkillGapGraphData {
  const candidateByName = new Map(
    candidateSkills.map((skill) => [normalizeSkillName(skill.name), skill])
  );
  const jobByName = new Map(jobSkills.map((skill) => [normalizeSkillName(skill.name), skill]));
  const nodeMap = new Map<string, SkillGapNode>();
  const edges: SkillGapEdge[] = [];

  for (const requirement of jobSkills) {
    const key = normalizeSkillName(requirement.name);
    const candidateSkill = candidateByName.get(key);
    const id = skillNodeId(requirement.name);
    const missing = !candidateSkill;

    nodeMap.set(id, {
      id,
      name: requirement.name,
      category: requirement.category,
      level: candidateSkill?.level,
      source: candidateSkill ? 'both' : 'missing',
      importance: requirement.importance,
      gapLevel: gapLevelFor(requirement, candidateSkill),
      candidateEvidence: candidateSkill
        ? `候选人技能：${candidateSkill.name}，熟练度 ${candidateSkill.level}/5`
        : undefined,
      jdEvidence: requirement.evidence,
    });

    edges.push({
      source: 'job-requirements',
      target: id,
      relation: missing ? 'missing' : 'requires',
    });
  }

  for (const skill of candidateSkills) {
    const key = normalizeSkillName(skill.name);
    if (jobByName.has(key)) continue;

    const id = skillNodeId(skill.name);
    nodeMap.set(id, {
      id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      source: 'candidate',
      gapLevel: 'none',
      candidateEvidence: `候选人技能：${skill.name}，熟练度 ${skill.level}/5`,
    });

    edges.push({
      source: 'candidate-profile',
      target: id,
      relation: 'has_evidence',
    });
  }

  const nodes: SkillGapNode[] = [
    {
      id: 'candidate-profile',
      name: '候选人画像',
      category: 'Profile',
      source: 'candidate',
      gapLevel: 'none',
    },
    {
      id: 'job-requirements',
      name: '岗位要求',
      category: 'JD',
      source: 'job',
      gapLevel: 'none',
    },
    ...Array.from(nodeMap.values()).sort((a, b) => {
      const weight = { both: 0, missing: 1, candidate: 2, job: 3 };
      return weight[a.source] - weight[b.source] || a.name.localeCompare(b.name, 'zh-CN');
    }),
  ];

  return { nodes, edges };
}

export function summarizeSkillGap(graph: SkillGapGraphData) {
  const skillNodes = graph.nodes.filter(
    (node) => node.id !== 'candidate-profile' && node.id !== 'job-requirements'
  );
  const mustNodes = skillNodes.filter((node) => node.importance === 'must');
  const preferredNodes = skillNodes.filter((node) => node.importance === 'preferred');
  const matchedMust = mustNodes.filter((node) => node.source === 'both').length;
  const matchedPreferred = preferredNodes.filter((node) => node.source === 'both').length;
  const missing = skillNodes.filter((node) => node.source === 'missing');

  return {
    mustMatched: matchedMust,
    mustTotal: mustNodes.length,
    preferredMatched: matchedPreferred,
    preferredTotal: preferredNodes.length,
    missingSkills: missing.map((node) => node.name),
    majorGaps: missing.filter((node) => node.gapLevel === 'major').map((node) => node.name),
  };
}
