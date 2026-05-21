// ============================================================
// TalentFlow — Resume Parser (AI-powered)
// ============================================================

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import type { ModelSettings, CandidateProfile } from '@/types';
import { createModel } from './models';

/** Zod schema for structured resume extraction. */
const candidateSchema = z.object({
  name: z.string().describe('候选人姓名'),
  email: z.string().describe('电子邮箱'),
  phone: z.string().describe('电话号码'),
  summary: z.string().describe('个人简介/自我评价'),
  education: z
    .array(
      z.object({
        school: z.string().describe('学校名称'),
        degree: z.string().describe('学位'),
        major: z.string().describe('专业'),
        startDate: z.string().describe('开始日期'),
        endDate: z.string().describe('结束日期'),
        gpa: z.string().optional().describe('GPA/绩点'),
      })
    )
    .describe('教育经历'),
  workExperience: z
    .array(
      z.object({
        company: z.string().describe('公司名称'),
        title: z.string().describe('职位'),
        startDate: z.string().describe('开始日期'),
        endDate: z.string().describe('结束日期'),
        description: z.string().describe('工作描述'),
      })
    )
    .describe('工作经历'),
  projects: z
    .array(
      z.object({
        name: z.string().describe('项目名称'),
        role: z.string().describe('担任角色'),
        startDate: z.string().describe('开始日期'),
        endDate: z.string().describe('结束日期'),
        description: z.string().describe('项目描述'),
        technologies: z.array(z.string()).describe('使用技术'),
      })
    )
    .describe('项目经历'),
  skills: z
    .array(
      z.object({
        name: z.string().describe('技能名称'),
        level: z.number().min(1).max(5).describe('熟练度 1-5'),
        category: z.string().describe('技能类别'),
      })
    )
    .describe('技能列表'),
  yearsOfExperience: z.number().describe('工作年限'),
  currentTitle: z.string().describe('当前职位'),
  currentCompany: z.string().describe('当前公司'),
});

const RESUME_PARSE_PROMPT = `你是一个专业的简历解析助手。请从以下简历文本中提取结构化的候选人信息。

请严格按照schema要求提取所有字段。如果某个字段在简历中没有明确提到，请合理推断或填写空字符串/空数组。

对于技能熟练度(level)：
- 1 = 了解（仅听说过或简单了解）
- 2 = 简单（能基本使用）
- 3 = 掌握（日常熟练使用）
- 4 = 精通（深入理解和实践）
- 5 = 专家（行业领先水平）

简历文本：
---
{resumeText}
---

请提取结构化信息：`;

/**
 * Parse raw resume text into a structured CandidateProfile using AI.
 * 优先使用 generateObject（结构化输出），失败时降级到 generateText + JSON 提取。
 */
export async function parseResumeWithAI(
  rawText: string,
  modelSettings: ModelSettings
): Promise<CandidateProfile> {
  const model = createModel(modelSettings);
  const prompt = RESUME_PARSE_PROMPT.replace('{resumeText}', rawText);

  try {
    // 优先尝试 generateObject（需要模型支持结构化输出 / function calling）
    const { object } = await generateObject({
      model,
      schema: candidateSchema,
      prompt,
      temperature: 0.1,
    });

    return {
      ...object,
      rawText,
    } as CandidateProfile;
  } catch (objectError) {
    // 降级方案：使用 generateText + JSON 提取（兼容所有模型）
    console.warn('[resume-parser] generateObject failed, falling back to generateText:', objectError instanceof Error ? objectError.message : objectError);

    const jsonPrompt = `${prompt}

重要：请直接输出一个合法的 JSON 对象，不要包含任何其他文字、解释或 markdown 标记。
JSON 必须包含以下字段：name, email, phone, summary, education (数组), workExperience (数组), projects (数组), skills (数组), yearsOfExperience (数字), currentTitle, currentCompany。
每个 education 项包含：school, degree, major, startDate, endDate, gpa（可选）。
每个 workExperience 项包含：company, title, startDate, endDate, description。
每个 projects 项包含：name, role, startDate, endDate, description, technologies (字符串数组)。
每个 skills 项包含：name (字符串), level (1-5 的数字), category (字符串)。`;

    const { text } = await generateText({
      model,
      prompt: jsonPrompt,
      temperature: 0.1,
    });

    // 从响应中提取 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 模型未能返回有效的 JSON 格式。请检查模型是否支持 JSON 输出。');
    }

    const parsedData = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    // 补全缺失字段
    const requiredFields = ['name', 'email', 'phone', 'summary', 'education', 'workExperience', 'projects', 'skills'];
    for (const field of requiredFields) {
      if (!(field in parsedData)) {
        parsedData[field] = field === 'summary' ? '' : [];
      }
    }
    if (typeof parsedData.yearsOfExperience !== 'number') parsedData.yearsOfExperience = 0;
    if (typeof parsedData.currentTitle !== 'string') parsedData.currentTitle = '';
    if (typeof parsedData.currentCompany !== 'string') parsedData.currentCompany = '';

    return {
      ...parsedData,
      rawText,
    } as CandidateProfile;
  }
}
