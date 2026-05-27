// ============================================================
// TalentFlow — Agent Platform Homepage
// ============================================================

'use client';

import Link from 'next/link';
import { AgentWorkflow } from '@/components/home/agent-workflow';
import { DemoEntry } from '@/components/home/demo-entry';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  FileText,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const capabilities = [
  {
    icon: FileText,
    title: '简历解析',
    description: '多格式简历解析为结构化候选人画像，为后续 Agent 提供稳定输入。',
  },
  {
    icon: GitBranch,
    title: '能力图谱',
    description: '将候选人技能与岗位要求对齐，识别命中项、可迁移能力和关键缺口。',
  },
  {
    icon: Target,
    title: '智能匹配',
    description: '以 JD 要求、简历证据、风险判断和推荐动作解释每一个分数。',
  },
  {
    icon: MessageSquare,
    title: '面试决策',
    description: '从匹配风险自动生成追问，形成面试验证到最终建议的闭环。',
  },
];

const highlights = [
  {
    icon: Sparkles,
    title: 'Multi-Agent Workflow',
    description: '把招聘流程拆解为解析、画像、图谱、匹配、面试和决策多个智能体。',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence-based Matching',
    description: '每个结论都能追溯到 JD 要求、简历证据和风险判断。',
  },
  {
    icon: BarChart3,
    title: 'Batch Decision Ranking',
    description: '支持一个岗位下多个候选人排序，贴近真实招聘决策场景。',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-10 h-80 w-80 rounded-full bg-tf-accent/8 blur-3xl" />
        <div className="absolute right-[-12%] top-1/3 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute bottom-[-15%] left-1/3 h-[520px] w-[520px] rounded-full bg-stone-400/12 blur-3xl" />
      </div>

      <section className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-7xl grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 glass-card-sm px-4 py-2">
            <Sparkles className="h-4 w-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">AI 招聘决策智能体平台</span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-tf-accent">
            TalentFlow
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-tf-primary sm:text-5xl lg:text-6xl">
            AI 招聘决策
            <br />
            <span className="gradient-text">智能体平台</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tf-secondary">
            从简历解析、能力图谱到人岗匹配与面试决策，
            让招聘从经验判断走向证据驱动。
          </p>
          <p className="mt-4 text-base font-medium text-tf-primary">
            不是筛简历，而是重构招聘决策流。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo">
              <Button size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                一键体验
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="secondary" size="lg" icon={<FileText className="h-5 w-5" />}>
                上传简历开始
              </Button>
            </Link>
            <Link href="/candidates">
              <Button variant="ghost" size="lg" icon={<Users className="h-5 w-5" />}>
                查看候选人
              </Button>
            </Link>
          </div>
        </div>

        <GlassCard className="animate-fade-in-up-delay-1 p-5 sm:p-6" hoverable={false}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-tf-text-secondary">
                Decision Flow
              </p>
              <h2 className="mt-1 text-xl font-bold text-tf-primary">招聘决策闭环</h2>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
              Live Demo Ready
            </span>
          </div>

          <div className="space-y-3">
            {['Resume Parser', 'Profile Builder', 'Skill Gap Graph', 'JD Matching', 'Interview Follow-up', 'Decision Advice'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/45 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-tf-accent/10 text-xs font-bold text-tf-accent">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-tf-primary">{item}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-tf-accent"
                      style={{ width: `${92 - index * 8}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-tf-accent">Agent Workflow</p>
            <h2 className="text-3xl font-bold text-tf-primary">多智能体协同完成招聘判断</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-tf-secondary">
            每个 Agent 只处理一个清晰环节，输出结果被下游 Agent 继续使用，
            最终形成可解释、可追问、可复盘的招聘决策。
          </p>
        </div>
        <AgentWorkflow />
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold text-tf-accent">Core Capabilities</p>
          <h2 className="text-3xl font-bold text-tf-primary">从信息抽取到录用建议</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title} variant="sm" className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-tf-accent/10">
                  <Icon className="h-6 w-6 text-tf-accent" />
                </div>
                <h3 className="text-lg font-bold text-tf-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tf-secondary">{item.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <DemoEntry />
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title} variant="sm" className="p-6">
                <Icon className="mb-4 h-6 w-6 text-tf-accent" />
                <h3 className="text-lg font-bold text-tf-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-tf-secondary">{item.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
