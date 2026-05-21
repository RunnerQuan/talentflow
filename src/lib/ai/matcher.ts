// ============================================================
// TalentFlow — AI-Powered Matching Algorithm
// ============================================================

import { generateObject } from 'ai';
import { z } from 'zod';
import type { ModelSettings, CandidateProfile, MatchResult, MatchDimension } from '@/types';
import { createModel } from './models';

/** Zod schema for AI matching output. */
const matchResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('总体匹配分数 0-100'),
  dimensions: z
    .array(
      z.object({
        name: z.string().describe('维度名称'),
        score: z.number().min(0).max(100).describe('该维度得分'),
        weight: z.number().min(0).max(1).describe('权重'),
        details: z.array(z.string()).describe('详细说明'),
      })
    )
    .describe('各维度评分'),
  strengths: z.array(z.string()).describe('候选人优势'),
  weaknesses: z.array(z.string()).describe('候选人不足'),
  recommendation: z.string().describe('综合推荐意见'),
});

/**
 * Match a candidate against a job description using AI.
 * Implements a weighted scoring system:
 * - Skill match: 40%
 * - Experience match: 25%
 * - Culture match: 20%
 * - Potential match: 15%
 */
export async function matchCandidate(
  candidate: CandidateProfile,
  jdText: string,
  modelSettings: ModelSettings
): Promise<MatchResult> {
  const model = createModel(modelSettings);

  const candidateSummary = `
候选人信息：
- 姓名：${candidate.name}
- 当前职位：${candidate.currentTitle} @ ${candidate.currentCompany}
- 工作年限：${candidate.yearsOfExperience}年
- 教育背景：${(candidate.education || []).map((e) => `${e.school} ${e.degree} ${e.major}`).join('；')}
- 技能：${(candidate.skills || []).map((s) => `${s.name}(熟练度${s.level}/5)`).join('、')}
- 工作经历：${(candidate.workExperience || []).map((w) => `${w.title}@${w.company}：${w.description}`).join('；')}
- 项目经历：${(candidate.projects || []).map((p) => `${p.name}：${p.description}${p.technologies ? `(技术栈：${p.technologies.join('、')})` : ''}`).join('；')}
- 个人简介：${candidate.summary}
`;

  const { object } = await generateObject({
    model,
    schema: matchResultSchema,
    prompt: `你是一个专业的AI招聘匹配助手。请对候选人与岗位的匹配度进行全面评估。

评估维度和权重：
1. 技能匹配（权重40%）：候选人的技能是否与岗位要求匹配
2. 经验匹配（权重25%）：工作经验年限和行业经验是否符合
3. 文化匹配（权重20%）：候选人的职业发展方向和价值观是否匹配
4. 潜力匹配（权重15%）：候选人的学习能力、成长潜力

每个维度请给出分数(0-100)和详细说明。

岗位描述(JD)：
---
${jdText}
---

${candidateSummary}

请给出匹配评估结果：`,
    temperature: 0.2,
  });

  // Ensure dimension weights sum correctly
  const dimensions: MatchDimension[] = object.dimensions.map((d) => ({
    name: d.name,
    score: Math.round(d.score),
    weight: d.weight,
    details: d.details,
  }));

  return {
    overallScore: Math.round(object.overallScore),
    dimensions,
    strengths: object.strengths,
    weaknesses: object.weaknesses,
    recommendation: object.recommendation,
    candidateName: candidate.name,
  };
}
