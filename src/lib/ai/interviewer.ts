// ============================================================
// TalentFlow — AI Interview Assistant
// ============================================================

import { generateObject } from 'ai';
import { z } from 'zod';
import type {
  ModelSettings,
  CandidateProfile,
  InterviewRound,
  InterviewQuestion,
  InterviewEvaluation,
  InterviewReport,
} from '@/types';
import { createModel } from './models';
import { generateId } from '@/lib/utils';

/** Schema for question generation. */
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

/** Schema for answer evaluation. */
const evaluationSchema = z.object({
  score: z.number().min(0).max(100).describe('回答得分 0-100'),
  feedback: z.string().describe('详细反馈'),
});

/** Schema for full interview report. */
const reportSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('总体评分'),
  recommendation: z.string().describe('录用建议'),
  summary: z.string().describe('面试总结'),
});

/** Map round type to descriptive text. */
const ROUND_DESCRIPTIONS: Record<InterviewRound, string> = {
  screening: '初筛面试 — 考察基本背景、沟通能力和岗位兴趣',
  technical: '技术面试 — 深入考察技术能力、项目经验和问题解决能力',
  cultural: '文化面试 — 考察价值观、团队协作和文化契合度',
  final: '终面 — 综合评估，包括职业规划、薪资期望和最终录用决策',
};

/**
 * Generate interview questions for a candidate based on round type.
 */
export async function generateInterviewQuestions(
  candidate: CandidateProfile,
  round: InterviewRound,
  modelSettings: ModelSettings,
  count: number = 5
): Promise<InterviewQuestion[]> {
  const model = createModel(modelSettings);

  const candidateSummary = `
候选人信息：
- 姓名：${candidate.name}
- 当前职位：${candidate.currentTitle} @ ${candidate.currentCompany}
- 工作年限：${candidate.yearsOfExperience}年
- 技能：${(candidate.skills || []).map((s) => `${s.name}(${s.level}/5)`).join('、') || '暂无'}
- 工作经历：${(candidate.workExperience || []).map((w) => `${w.title}@${w.company}: ${w.description}`).join('；') || '暂无'}
- 项目经历：${(candidate.projects || []).map((p) => `${p.name}: ${p.description}`).join('；') || '暂无'}
`;

  const { object } = await generateObject({
    model,
    schema: questionsSchema,
    prompt: `你是一个专业的面试官。请根据以下信息生成${count}个高质量面试问题。

面试轮次：${ROUND_DESCRIPTIONS[round]}

${candidateSummary}

要求：
1. 问题应针对候选人的具体背景定制
2. 难度分布：至少1个简单、2个中等、1个困难
3. 问题应涵盖该面试轮次的核心考察点
4. 每个问题需附带参考答案要点和追问问题

请生成面试问题：`,
    temperature: 0.3,
  });

  return object.questions.map((q) => ({
    ...q,
    id: generateId(),
  }));
}

/**
 * Evaluate a candidate's answer to an interview question.
 */
export async function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
  modelSettings: ModelSettings
): Promise<InterviewEvaluation> {
  const model = createModel(modelSettings);

  const { object } = await generateObject({
    model,
    schema: evaluationSchema,
    prompt: `你是一个专业的面试评估专家。请对候选人的回答进行评估。

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

给出0-100的分数和详细反馈：`,
    temperature: 0.2,
  });

  return {
    questionId: question.id,
    answer,
    score: Math.round(object.score),
    feedback: object.feedback,
  };
}

/**
 * Generate a complete interview report.
 */
export async function generateInterviewReport(
  candidate: CandidateProfile,
  round: InterviewRound,
  questions: InterviewQuestion[],
  evaluations: InterviewEvaluation[],
  modelSettings: ModelSettings
): Promise<InterviewReport> {
  const model = createModel(modelSettings);

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

  const { object } = await generateObject({
    model,
    schema: reportSchema,
    prompt: `你是一个专业的面试评估总监。请根据以下面试记录生成综合面试报告。

候选人：${candidate.name}
面试轮次：${ROUND_DESCRIPTIONS[round]}
平均得分：${Math.round(avgScore)}/100

各问题评估详情：
${evalSummary}

请给出：
1. 总体评分（0-100）
2. 录用建议（强烈推荐/推荐/待定/不推荐）
3. 综合面试总结（100-200字）

面试总结应包括候选人的核心优势、不足之处和发展潜力评估。`,
    temperature: 0.2,
  });

  return {
    candidateName: candidate.name,
    round,
    questions,
    evaluations,
    overallScore: Math.round(object.overallScore),
    recommendation: object.recommendation,
    summary: object.summary,
  };
}
