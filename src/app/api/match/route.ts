// ============================================================
// TalentFlow — Match API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { ModelSettings, CandidateProfile, MatchResult, MatchDimension } from '@/types';

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

    const matchPrompt = `你是一个专业的AI招聘匹配助手。请对候选人与岗位的匹配度进行全面评估。

评估维度和权重：
1. 技能匹配（权重40%）：候选人的技能是否与岗位要求匹配
2. 经验匹配（权重25%）：工作经验年限和行业经验是否符合
3. 文化匹配（权重20%）：候选人的职业发展方向和价值观是否匹配
4. 潜力匹配（权重15%）：候选人的学习能力、成长潜力

重要提示：
- 如果候选人的技能列表显示"简历中未明确列出技能清单"或技能信息不完整，请根据其工作经历、项目经历和技术栈来推断其技能水平
- 不要因为技能列表为空就给出低分或无法评估，应从整体履历综合判断
- 每个维度请给出分数(0-100)和详细说明

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
- recommendation: 字符串（综合推荐意见）`;

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
      if (typeof parsedData.overallScore !== 'number') parsedData.overallScore = 0;
    }

    const dimensions: MatchDimension[] = (parsedData.dimensions as Array<Record<string, unknown>>).map((d) => ({
      name: d.name as string,
      score: Math.round(d.score as number),
      weight: d.weight as number,
      details: d.details as string[],
    }));

    const result: MatchResult = {
      overallScore: Math.round(parsedData.overallScore as number),
      dimensions,
      strengths: parsedData.strengths as string[],
      weaknesses: parsedData.weaknesses as string[],
      recommendation: parsedData.recommendation as string,
      candidateName: candidate.name,
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
