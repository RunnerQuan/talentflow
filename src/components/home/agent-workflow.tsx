'use client';

import {
  BrainCircuit,
  FileText,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { AgentCard, type HomeAgent } from '@/components/home/agent-card';

const agents: HomeAgent[] = [
  {
    id: 'parser',
    name: 'Resume Parser Agent',
    title: '简历解析智能体',
    description: '将 PDF、Word、图片简历解析为结构化候选人画像。',
    input: '原始简历文件',
    output: '结构化 Profile',
    status: 'completed',
    icon: FileText,
  },
  {
    id: 'profile',
    name: 'Profile Agent',
    title: '画像构建智能体',
    description: '汇总教育、经历、项目和技能，生成可用于决策的候选人画像。',
    input: '解析字段',
    output: '候选人画像',
    status: 'completed',
    icon: BrainCircuit,
  },
  {
    id: 'graph',
    name: 'Skill Graph Agent',
    title: '能力图谱智能体',
    description: '构建技能网络，并与岗位要求形成差距诊断。',
    input: 'Profile + JD',
    output: '技能命中与缺口',
    status: 'running',
    icon: GitBranch,
  },
  {
    id: 'matching',
    name: 'JD Matching Agent',
    title: '人岗匹配智能体',
    description: '输出多维分数、证据链、优势、风险与推荐动作。',
    input: '候选人画像 + JD',
    output: '可解释匹配结果',
    status: 'ready',
    icon: Target,
  },
  {
    id: 'interview',
    name: 'Interview Agent',
    title: '面试追问智能体',
    description: '基于匹配风险生成结构化追问和评分标准。',
    input: 'Yellow/Red 风险',
    output: '定向面试问题',
    status: 'ready',
    icon: MessageSquare,
  },
  {
    id: 'decision',
    name: 'Decision Agent',
    title: '决策建议智能体',
    description: '汇总证据、风险和面试反馈，输出下一步建议。',
    input: '匹配 + 面试',
    output: '招聘决策建议',
    status: 'ready',
    icon: ShieldCheck,
  },
];

export function AgentWorkflow() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent, index) => (
        <AgentCard key={agent.id} agent={agent} index={index} />
      ))}
    </div>
  );
}
