// ============================================================
// TalentFlow — Match API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type {
  CandidateProfile,
  ExplainableMatchResult,
  MatchDimension,
  ModelSettings,
} from '@/types';

/**
 * POST /api/match
 * Accepts a JSON body with candidate, JD text, and model settings.
 * Returns a MatchResult with scores across 4 dimensions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate, jdText, modelName, apiKey, baseURL } = body as {
      candidate: CandidateProfile;
      jdText: string;
      modelName: string;
      apiKey: string;
      baseURL: string;
    };

    if (!candidate) {
      return NextResponse.json({ error: '请提供候选人信息' }, { status: 400 });
    }
    if (!jdText || !jdText.trim()) {
      return NextResponse.json({ error: '请输入岗位描述' }, { status: 400 });
    }
    if (!modelName || !apiKey || !baseURL) {
      return NextResponse.json({ error: '请先配置 AI 模型、API Key 和 Base URL' }, { status: 400 });
    }

    const modelSettings: ModelSettings = {
      modelName,
      apiKey,
      baseURL,
    };

    const { createModel } = await import('@/lib/ai/models');
    const { generateObject, generateText } = await import('ai');
    const { z } = await import('zod');

    const model = createModel(modelSettings);

    const matchEvidenceSchema = z.object({
      id: z.string(),
      dimension: z.string(),
      jdRequirement: z.string(),
      resumeEvidence: z.string(),
      evidenceType: z.enum(['skill', 'experience', 'project', 'education', 'summary', 'missing']),
      confidence: z.number().min(0).max(100),
      verdict: z.enum(['matched', 'partial', 'missing', 'uncertain']),
    });

    const matchRiskSchema = z.object({
      id: z.string(),
      level: z.enum(['green', 'yellow', 'red']),
      title: z.string(),
      description: z.string(),
      suggestedAction: z.string(),
    });

    const followUpQuestionSchema = z.object({
      id: z.string(),
      question: z.string(),
      targetRisk: z.string(),
      reason: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    });

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
      evidences: z.array(matchEvidenceSchema).describe('JD 要求到简历证据的可追溯证据链'),
      risks: z.array(matchRiskSchema).describe('绿色强匹配、黄色待追问、红色高风险'),
      followUpQuestions: z.array(followUpQuestionSchema).describe('基于 yellow/red 风险生成的面试追问'),
      decision: z.object({
        level: z.enum(['strong_recommend', 'recommend', 'hold', 'not_recommend']),
        nextStep: z.enum(['technical_interview', 'hr_screening', 'talent_pool', 'reject']),
        summary: z.string(),
      }),
    });

    // 构建技能信息，处理空数组情况
    const skillsText = candidate.skills && candidate.skills.length > 0
      ? candidate.skills.map((s) => `${s.name}(熟练度${s.level}/5)`).join('、')
      : '简历中未明确列出技能清单，请根据工作经历和项目经历推断候选人技能';

    // 构建工作经历，处理空数组情况
    const workExpText = candidate.workExperience && candidate.workExperience.length > 0
      ? candidate.workExperience.map((w) => `${w.title}@${w.company}：${w.description}`).join('；')
      : '无工作经历记录';

    // 构建项目经历，处理空数组情况
    const projectsText = candidate.projects && candidate.projects.length > 0
      ? candidate.projects.map((p) => `${p.name}：${p.description}${p.technologies && p.technologies.length > 0 ? `(技术栈：${p.technologies.join('、')})` : ''}`).join('；')
      : '无项目经历记录';

    // 构建教育背景，处理空数组情况
    const educationText = candidate.education && candidate.education.length > 0
      ? candidate.education.map((e) => `${e.school} ${e.degree} ${e.major}`).join('；')
      : '未提供教育背景';

    const candidateSummary = `
候选人信息：
- 姓名：${candidate.name || '未提供'}
- 当前职位：${candidate.currentTitle || '未提供'} @ ${candidate.currentCompany || '未提供'}
- 工作年限：${candidate.yearsOfExperience || 0}年
- 教育背景：${educationText}
- 技能：${skillsText}
- 工作经历：${workExpText}
- 项目经历：${projectsText}
- 个人简介：${candidate.summary || '未提供'}
`;

    const matchPrompt = `你是一个专业的招聘决策智能体。请基于岗位 JD 与候选人简历，输出可解释的人岗匹配结果。

你必须完成以下任务：
1. 计算总体匹配分 overallScore。
2. 按四个维度评分：
1. 技能匹配（权重40%）：候选人的技能是否与岗位要求匹配
2. 经验匹配（权重25%）：工作经验年限和行业经验是否符合
3. 岗位适配（权重20%）：候选人的职业方向与岗位任务是否匹配
4. 成长潜力（权重15%）：候选人的学习能力、成长潜力
3. 抽取证据链 evidences：
   - 每条证据必须包含 jdRequirement、resumeEvidence、confidence、verdict。
   - resumeEvidence 必须来自候选人经历、项目、技能或教育信息，不允许编造。
   - 如果候选人缺失某项能力，resumeEvidence 填写“简历中未发现直接证据”。
   - 每个匹配维度至少输出 1 条证据。
4. 输出 risks：
   - green 表示强匹配项
   - yellow 表示需要面试追问
   - red 表示明显能力缺口或重大不确定性
   - 至少输出 3 条风险标识。
5. 基于 yellow/red 风险生成 followUpQuestions，至少 3 个。
6. 输出 decision：
   - strong_recommend：强烈推荐进入下一轮
   - recommend：推荐进入下一轮
   - hold：暂缓，需要补充信息
   - not_recommend：不推荐

重要提示：
- 如果候选人的技能列表显示"简历中未明确列出技能清单"或技能信息不完整，请根据其工作经历、项目经历和技术栈来推断其技能水平
- 不要因为技能列表为空就给出低分或无法评估，应从整体履历综合判断
- 不允许编造简历不存在的经历；缺失能力必须明确标记为 missing

岗位描述(JD)：
---
${jdText}
---

${candidateSummary}

请给出匹配评估结果：`;

    let parsedData: Record<string, unknown>;

    try {
      const { object } = await generateObject({
        model,
        schema: matchResultSchema,
        prompt: matchPrompt,
        temperature: 0.2,
      });
      parsedData = object as Record<string, unknown>;
    } catch (objectError) {
      console.warn('[match] generateObject failed, falling back to generateText:', objectError instanceof Error ? objectError.message : objectError);

      const jsonPrompt = `${matchPrompt}

重要：请直接输出一个合法的 JSON 对象，不要包含任何其他文字、解释或 markdown 标记。
JSON 必须包含以下字段：
- overallScore: 0-100 的数字
- dimensions: 数组，每项包含 name(字符串), score(0-100数字), weight(0-1数字), details(字符串数组)
  维度应包括：技能匹配(weight 0.4), 经验匹配(weight 0.25), 文化匹配(weight 0.2), 潜力匹配(weight 0.15)
- strengths: 字符串数组（候选人优势）
- weaknesses: 字符串数组（候选人不足）
- recommendation: 字符串（综合推荐意见）
- evidences: 数组，每项包含 id, dimension, jdRequirement, resumeEvidence, evidenceType(skill/experience/project/education/summary/missing), confidence(0-100), verdict(matched/partial/missing/uncertain)
- risks: 数组，每项包含 id, level(green/yellow/red), title, description, suggestedAction
- followUpQuestions: 数组，每项包含 id, question, targetRisk, reason, difficulty(easy/medium/hard)
- decision: 对象，包含 level(strong_recommend/recommend/hold/not_recommend), nextStep(technical_interview/hr_screening/talent_pool/reject), summary`;

      const { text } = await generateText({
        model,
        prompt: jsonPrompt,
        temperature: 0.2,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 模型未能返回有效的 JSON 格式');
      }

      parsedData = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

      // 补全缺失字段
      if (!parsedData.dimensions) parsedData.dimensions = [];
      if (!parsedData.strengths) parsedData.strengths = [];
      if (!parsedData.weaknesses) parsedData.weaknesses = [];
      if (!parsedData.recommendation) parsedData.recommendation = '';
      if (!parsedData.evidences) parsedData.evidences = [];
      if (!parsedData.risks) parsedData.risks = [];
      if (!parsedData.followUpQuestions) parsedData.followUpQuestions = [];
      if (!parsedData.decision) {
        parsedData.decision = {
          level: 'hold',
          nextStep: 'hr_screening',
          summary: '模型未返回完整决策字段，建议人工复核。',
        };
      }
      if (typeof parsedData.overallScore !== 'number') parsedData.overallScore = 0;
    }

    const dimensions: MatchDimension[] = (parsedData.dimensions as Array<Record<string, unknown>>).map((d) => ({
      name: d.name as string,
      score: Math.round(d.score as number),
      weight: d.weight as number,
      details: d.details as string[],
    }));

    const result: ExplainableMatchResult = {
      overallScore: Math.round(parsedData.overallScore as number),
      dimensions,
      strengths: parsedData.strengths as string[],
      weaknesses: parsedData.weaknesses as string[],
      recommendation: parsedData.recommendation as string,
      candidateName: candidate.name,
      evidences: parsedData.evidences as ExplainableMatchResult['evidences'],
      risks: parsedData.risks as ExplainableMatchResult['risks'],
      followUpQuestions: parsedData.followUpQuestions as ExplainableMatchResult['followUpQuestions'],
      decision: parsedData.decision as ExplainableMatchResult['decision'],
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[match] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `匹配失败: ${error.message}`
            : '匹配过程中发生未知错误',
      },
      { status: 500 }
    );
  }
}
