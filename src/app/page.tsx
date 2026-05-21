// ============================================================
// TalentFlow — Landing Page
// ============================================================

'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  FileText,
  GitBranch,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'AI 简历解析',
    description: '多格式简历上传，AI 自动提取结构化候选人信息，秒级完成解析。',
  },
  {
    icon: GitBranch,
    title: '技能图谱',
    description: '可视化技能网络，洞察能力关联与演化路径，精准定位人才画像。',
  },
  {
    icon: Users,
    title: '智能匹配',
    description: '多维度加权匹配算法，技能/经验/文化/潜力四维评估，匹配度一目了然。',
  },
];

const STATS = [
  { value: '95%', label: '匹配准确率', icon: TrendingUp },
  { value: '10x', label: '效率提升', icon: Zap },
  { value: '60s', label: '平均处理时间', icon: Clock },
  { value: '99%', label: '数据安全', icon: Shield },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-tf-accent/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-tf-accent/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-tf-accent/2 blur-3xl" />
      </div>

      {/* Floating Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-card flex items-center gap-1 px-2 py-2">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 cursor-pointer">
            <Sparkles className="w-5 h-5 text-tf-accent" />
            <span className="font-serif font-bold text-tf-primary text-sm">
              TalentFlow
            </span>
          </Link>

          <div className="w-px h-6 bg-black/10 mx-1" />

          <Link href="#features" className="px-3 py-2 rounded-xl text-sm text-tf-secondary hover:text-tf-primary hover:bg-black/5 transition-all duration-300 cursor-pointer">
            功能
          </Link>
          <Link href="#stats" className="px-3 py-2 rounded-xl text-sm text-tf-secondary hover:text-tf-primary hover:bg-black/5 transition-all duration-300 cursor-pointer">
            数据
          </Link>
          <Link href="/settings" className="px-3 py-2 rounded-xl text-sm text-tf-secondary hover:text-tf-primary hover:bg-black/5 transition-all duration-300 cursor-pointer">
            设置
          </Link>

          <div className="w-px h-6 bg-black/10 mx-1" />

          <Link href="/upload">
            <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              开始使用
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">AI 驱动的新一代招聘决策平台</span>
          </div>
        </div>

        <h1 className="animate-fade-in-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-tf-primary mb-6 leading-tight">
          人才智能匹配
          <br />
          <span className="gradient-text">重新定义招聘</span>
        </h1>

        <p className="animate-fade-in-up-delay-2 text-lg sm:text-xl text-tf-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          从简历解析到技能图谱，从智能匹配到面试助手 —
          <br className="hidden sm:block" />
          TalentFlow 用 AI 重新构建招聘全流程，让每一次人才决策都更精准、更高效。
        </p>

        <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/upload">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              开始使用
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg">
              了解更多
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-tf-primary mb-4">
            三大核心能力
          </h2>
          <p className="text-tf-secondary max-w-xl mx-auto">
            AI 深度赋能招聘全流程，从信息提取到决策支持，一站式完成
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassCard key={feature.title} className="p-8 text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tf-accent/10 mb-6 group-hover:bg-tf-accent/20 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-tf-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold text-tf-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-tf-secondary leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 sm:p-12" shimmer>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-tf-primary mb-4">
                用数据说话
              </h2>
              <p className="text-tf-secondary">
                TalentFlow 已为众多企业提升招聘效能
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="w-6 h-6 text-tf-accent mx-auto mb-3" />
                    <div className="text-3xl sm:text-4xl font-bold text-tf-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-tf-secondary">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard className="p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-tf-primary mb-4">
              准备好提升您的招聘效能了吗？
            </h2>
            <p className="text-tf-secondary mb-8 max-w-lg mx-auto">
              只需上传简历，AI 即刻为您呈现深度分析与精准匹配
            </p>
            <Link href="/upload">
              <Button size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                立即体验
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tf-accent" />
            <span className="font-serif font-bold text-tf-primary text-sm">
              TalentFlow
            </span>
          </div>
          <p className="text-xs text-tf-text-secondary">
            AI 驱动的招聘决策智能体 — 小鹏 AI 公开赛参赛作品
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-xs text-tf-text-secondary hover:text-tf-primary transition-colors cursor-pointer"
            >
              模型配置
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-tf-text-secondary hover:text-tf-primary transition-colors cursor-pointer"
            >
              数据看板
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
