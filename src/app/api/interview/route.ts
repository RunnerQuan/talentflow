// ============================================================
// TalentFlow — Interview API Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type {
  ModelSettings,
  CandidateProfile,
  InterviewRound,
  InterviewQuestion,
  InterviewEvaluation,
  InterviewReport,
} from '@/types';
import { generateId } from '@/lib/utils';

const ROUND_DESCRIPTIONS: Record<InterviewRound, string> = {
  screening: '初筛面试 — 考察基本背景、沟通能力和岗位兴趣',
  technical: '技术面试 — 深入考察技术能力、项目经验和问题解决能力',
  cultural: '文化面试 — 考察价值观、团队协作和文化契合度',
  final: '终面 — 综合评估，包括职业规划、薪资期望和最终录用决策',
};

/**
 * POST /api/interview
 * Supports three actions:
 * - generate: Generate interview questions
 * - evaluate: Evaluate an answer to a question
 * - report: Generate a full interview report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, modelName, apiKey, baseURL } = body as {
      action: 'generate' | 'evaluate' | 'report';
      modelName: string;
      apiKey: string;
      baseURL: string;
    };

    if (!modelName || !apiKey || !baseURL) {
      return NextResponse.json({ error: '请先配置 AI 模型、API Key 和 Base URL' }, { status: 400 });
    }

    const modelSettings: ModelSettings = {
      modelName,
      apiKey,
      baseURL,
    };

    // Dynamic imports to keep server-only
    const { createModel } = await import('@/lib/ai/models');
    const zod = await import('zod');

    const model = createModel(modelSettings);
    const { z } = zod;

    switch (action) {
      case 'generate': {
        const { candidate, round, count = 5 } = body as {
          candidate: CandidateProfile;
          round: InterviewRound;
          count?: number;
        };

        if (!candidate) {
          return NextResponse.json({ error: '请提供候选人信息' }, { status: 400 });
        }

        const questionsSchema = z.object({
          questions: z
            .array(
              z.object({
                question: z.string().describe('面试问题'),
                category: z.string().describe('问题类别'),
                difficulty: z.enum(['easy', 'medium', 'hard']).describe('难度'),
                expectedAnswer: z.string().describe('参考答案/期望回答要点'),
                followUp: z.string().describe('追问问题'),
              })
            )
            .describe('面试问题列表'),
        });

        const candidateSummary = buildCandidateSummary(candidate);

        const questionsPrompt = `你是一个专业的面试官。请根据以下信息生成${count}个高质量面试问题。

面试轮次：${ROUND_DESCRIPTIONS[round] || '通用面试'}

${candidateSummary}

要求：
1. 问题应针对候选人的具体背景定制
2. 难度分布：至少1个简单、2个中等、1个困难
3. 问题应涵盖该面试轮次的核心考察点
4. 每个问题需附带参考答案要点和追问问题

请生成面试问题：`;

        const object = await generateObjectWithFallback<{ questions: Array<{ question: string; category: string; difficulty: string; expectedAnswer: string; followUp: string }> }>({
          model,
          schema: questionsSchema,
          prompt: questionsPrompt,
          temperature: 0.3,
          fallbackJsonHint: 'JSON 格式：{ "questions": [{ "question": "问题", "category": "类别", "difficulty": "easy/medium/hard", "expectedAnswer": "参考答案", "followUp": "追问" }] }',
        });

        const questions: InterviewQuestion[] = object.questions.map((q) => ({
          ...q,
          difficulty: q.difficulty as InterviewQuestion['difficulty'],
          id: generateId(),
        }));

        return NextResponse.json({ questions });
      }

      case 'evaluate': {
        const { question, answer } = body as {
          question: InterviewQuestion;
          answer: string;
        };

        if (!question || !answer) {
          return NextResponse.json({ error: '请提供问题和回答' }, { status: 400 });
        }

        const evaluationSchema = z.object({
          score: z.number().min(0).max(100).describe('回答得分 0-100'),
          feedback: z.string().describe('详细反馈'),
        });

        const evalPrompt = `你是一个专业的面试评估专家。请对候选人的回答进行评估。

面试问题：${question.question}
问题类别：${question.category}
难度：${question.difficulty}
参考答案要点：${question.expectedAnswer}

候选人回答：
${answer}

请从以下维度评估：
1. 回答的完整性和准确性
2. 逻辑性和条理性
3. 专业深度
4. 实例和经验的引用

给出0-100的分数和详细反馈：`;

        const evalResult = await generateObjectWithFallback<{ score: number; feedback: string }>({
          model,
          schema: evaluationSchema,
          prompt: evalPrompt,
          temperature: 0.2,
          fallbackJsonHint: 'JSON 格式：{ "score": 0-100的数字, "feedback": "详细反馈" }',
        });

        const evaluation: InterviewEvaluation = {
          questionId: question.id,
          answer,
          score: Math.round(evalResult.score),
          feedback: evalResult.feedback,
        };

        return NextResponse.json({ evaluation });
      }

      case 'report': {
        const { candidate, round, questions, evaluations } = body as {
          candidate: CandidateProfile;
          round: InterviewRound;
          questions: InterviewQuestion[];
          evaluations: InterviewEvaluation[];
        };

        if (!candidate || !questions || !evaluations) {
          return NextResponse.json({ error: '缺少报告数据' }, { status: 400 });
        }

        const reportSchema = z.object({
          overallScore: z.number().min(0).max(100).describe('总体评分'),
          recommendation: z.string().describe('录用建议'),
          summary: z.string().describe('面试总结'),
        });

        const evalSummary = evaluations
          .map((e, i) => {
            const q = questions.find((q) => q.id === e.questionId);
            return `问题${i + 1}：${q?.question || '未知问题'}
回答：${e.answer}
得分：${e.score}/100
反馈：${e.feedback}`;
          })
          .join('\n\n');

        const avgScore =
          evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
            : 0;

        const reportPrompt = `你是一个专业的面试评估总监。请根据以下面试记录生成综合面试报告。

候选人：${candidate.name}
面试轮次：${ROUND_DESCRIPTIONS[round] || '通用面试'}
平均得分：${Math.round(avgScore)}/100

各问题评估详情：
${evalSummary}

请给出：
1. 总体评分（0-100）
2. 录用建议（强烈推荐/推荐/待定/不推荐）
3. 综合面试总结（100-200字）

面试总结应包括候选人的核心优势、不足之处和发展潜力评估。`;

        const reportResult = await generateObjectWithFallback<{ overallScore: number; recommendation: string; summary: string }>({
          model,
          schema: reportSchema,
          prompt: reportPrompt,
          temperature: 0.2,
          fallbackJsonHint: 'JSON 格式：{ "overallScore": 0-100的数字, "recommendation": "录用建议", "summary": "面试总结" }',
        });

        const report: InterviewReport = {
          candidateName: candidate.name,
          round,
          questions,
          evaluations,
          overallScore: Math.round(reportResult.overallScore),
          recommendation: reportResult.recommendation,
          summary: reportResult.summary,
        };

        return NextResponse.json({ report });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[interview] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `操作失败: ${error.message}`
            : '面试助手操作失败',
      },
      { status: 500 }
    );
  }
}

/** Build a candidate summary string for AI prompts. */
function buildCandidateSummary(candidate: CandidateProfile): string {
  return `
候选人信息：
- 姓名：${candidate.name}
- 当前职位：${candidate.currentTitle} @ ${candidate.currentCompany}
- 工作年限：${candidate.yearsOfExperience}年
- 技能：${(candidate.skills || []).map((s) => `${s.name}(${s.level}/5)`).join('、') || '暂无'}
- 工作经历：${(candidate.workExperience || []).map((w) => `${w.title}@${w.company}: ${w.description}`).join('；') || '暂无'}
- 项目经历：${(candidate.projects || []).map((p) => `${p.name}: ${p.description}`).join('；') || '暂无'}
`;
}

/**
 * 通用 generateObject 降级辅助函数。
 * 优先使用 generateObject（结构化输出），失败时降级到 generateText + JSON 提取。
 */
async function generateObjectWithFallback<T>(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  prompt: string;
  temperature?: number;
  fallbackJsonHint: string;
}): Promise<T> {
  const { generateObject, generateText } = await import('ai');

  try {
    const { object } = await generateObject({
      model: params.model,
      schema: params.schema,
      prompt: params.prompt,
      temperature: params.temperature ?? 0.2,
    });
    return object as T;
  } catch (objectError) {
    console.warn('[interview] generateObject failed, falling back to generateText:', objectError instanceof Error ? objectError.message : objectError);

    const jsonPrompt = `${params.prompt}

重要：请直接输出一个合法的 JSON 对象，不要包含任何其他文字、解释或 markdown 标记。
${params.fallbackJsonHint}`;

    const { text } = await generateText({
      model: params.model,
      prompt: jsonPrompt,
      temperature: params.temperature ?? 0.2,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 模型未能返回有效的 JSON 格式');
    }

    return JSON.parse(jsonMatch[0]) as T;
  }
}
