import { NextRequest, NextResponse } from 'next/server';
import type { BatchMatchResult, BatchMatchSummary, CandidateProfile, ModelSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidates, jdText, modelName, apiKey, baseURL } = body as {
      candidates: CandidateProfile[];
      jdText: string;
      modelName: string;
      apiKey: string;
      baseURL: string;
    };

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: '请至少选择一个候选人' }, { status: 400 });
    }
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

    const resultSchema = z.object({
      results: z.array(
        z.object({
          candidateName: z.string(),
          score: z.number().min(0).max(100),
          rank: z.number().min(1),
          level: z.enum(['A', 'B', 'C', 'D']),
          highlights: z.array(z.string()),
          risks: z.array(z.string()),
          suggestedAction: z.enum(['直接技术面', 'HR 初筛', '进入人才库', '暂不推荐']),
        })
      ),
      summary: z.object({
        totalCandidates: z.number(),
        recommendedCount: z.number(),
        averageScore: z.number(),
        topCandidateName: z.string(),
      }),
    });

    const candidateSummaries = candidates
      .map((candidate, index) => {
        const skills = candidate.skills?.map((skill) => `${skill.name}(${skill.level}/5)`).join('、') || '暂无';
        const projects = candidate.projects?.map((project) => `${project.name}: ${project.description}`).join('；') || '暂无';
        const work = candidate.workExperience?.map((exp) => `${exp.title}@${exp.company}: ${exp.description}`).join('；') || '暂无';
        return `候选人 ${index + 1}: ${candidate.name}
当前职位：${candidate.currentTitle} @ ${candidate.currentCompany}
工作年限：${candidate.yearsOfExperience}
技能：${skills}
工作经历：${work}
项目经历：${projects}`;
      })
      .join('\n\n');

    const prompt = `你是招聘筛选智能体。请根据岗位 JD，对多个候选人进行排序。

要求：
1. 每个候选人输出 score、rank、level、highlights、risks、suggestedAction。
2. score 为 0-100。
3. level：A 强匹配，B 基本匹配，C 部分匹配，D 不推荐。
4. 排名必须按照 score 从高到低。
5. 不能编造候选人没有的经历。
6. 每个候选人至少输出 2 条优势、2 条风险、1 个建议动作。

岗位 JD：
---
${jdText}
---

候选人列表：
${candidateSummaries}`;

    let parsed: { results: BatchMatchResult[]; summary: BatchMatchSummary };
    try {
      const { object } = await generateObject({ model, schema: resultSchema, prompt, temperature: 0.2 });
      parsed = object as { results: BatchMatchResult[]; summary: BatchMatchSummary };
    } catch {
      const { text } = await generateText({
        model,
        prompt: `${prompt}

重要：只输出合法 JSON，不要 markdown。格式：
{ "results": [{ "candidateName": "姓名", "score": 90, "rank": 1, "level": "A", "highlights": ["优势1","优势2"], "risks": ["风险1","风险2"], "suggestedAction": "直接技术面" }], "summary": { "totalCandidates": 3, "recommendedCount": 2, "averageScore": 78, "topCandidateName": "姓名" } }`,
        temperature: 0.2,
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI 模型未能返回有效 JSON');
      parsed = JSON.parse(jsonMatch[0]) as { results: BatchMatchResult[]; summary: BatchMatchSummary };
    }

    const sorted = parsed.results
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        score: Math.round(item.score),
      }));

    const summary: BatchMatchSummary = {
      totalCandidates: sorted.length,
      recommendedCount: sorted.filter((item) => item.level === 'A' || item.level === 'B').length,
      averageScore: sorted.length
        ? Math.round(sorted.reduce((sum, item) => sum + item.score, 0) / sorted.length)
        : 0,
      topCandidateName: sorted[0]?.candidateName || '',
    };

    return NextResponse.json({ results: sorted, summary });
  } catch (error) {
    console.error('[batch-match] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? `批量排序失败: ${error.message}` : '批量排序失败' },
      { status: 500 }
    );
  }
}
