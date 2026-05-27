import { NextRequest, NextResponse } from 'next/server';
import type { JobSkillRequirement, ModelSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jdText, modelName, apiKey, baseURL } = body as {
      jdText: string;
      modelName: string;
      apiKey: string;
      baseURL: string;
    };

    if (!jdText?.trim()) {
      return NextResponse.json({ error: '请输入岗位描述' }, { status: 400 });
    }
    if (!modelName || !apiKey || !baseURL) {
      return NextResponse.json({ error: '请先配置 AI 模型、API Key 和 Base URL' }, { status: 400 });
    }

    const modelSettings: ModelSettings = { modelName, apiKey, baseURL };
    const { createModel } = await import('@/lib/ai/models');
    const { generateObject, generateText } = await import('ai');
    const { z } = await import('zod');

    const model = createModel(modelSettings);
    const schema = z.object({
      skills: z.array(
        z.object({
          name: z.string(),
          category: z.string(),
          importance: z.enum(['must', 'preferred', 'bonus']),
          evidence: z.string(),
        })
      ),
    });

    const prompt = `你是招聘岗位分析助手。请从以下 JD 中抽取岗位技能要求。

要求：
1. 输出技能名称、类别、重要性和 JD 原文证据。
2. importance 可选：must（硬性要求）、preferred（优先条件）、bonus（加分项）。
3. 技能类别参考：编程语言、前端、后端、数据库、DevOps、AI/ML、数据、安全、设计、其他。
4. 不要抽取“沟通能力”“责任心”等过泛能力，除非 JD 明确强调。

JD：
---
${jdText}
---`;

    let skills: JobSkillRequirement[];
    try {
      const { object } = await generateObject({ model, schema, prompt, temperature: 0.1 });
      skills = object.skills as JobSkillRequirement[];
    } catch {
      const { text } = await generateText({
        model,
        temperature: 0.1,
        prompt: `${prompt}

重要：只输出合法 JSON，不要 markdown。格式：
{ "skills": [{ "name": "Java", "category": "编程语言", "importance": "must", "evidence": "JD 原文" }] }`,
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI 模型未能返回有效 JSON');
      skills = JSON.parse(jsonMatch[0]).skills as JobSkillRequirement[];
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[extract-jd-skills] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? `技能抽取失败: ${error.message}` : '技能抽取失败' },
      { status: 500 }
    );
  }
}
