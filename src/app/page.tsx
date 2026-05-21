// ============================================================
// TalentFlow — Landing Page
// ============================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

const HOME_SECTIONS = [
  { id: 'hero', label: '首页', hint: '平台总览' },
  { id: 'features', label: '功能', hint: '核心能力' },
  { id: 'stats', label: '数据', hint: '效果结果' },
] as const;

type HomeSectionId = (typeof HOME_SECTIONS)[number]['id'];
const HOME_SECTION_IDS = HOME_SECTIONS.map((section) => section.id) as HomeSectionId[];

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<HomeSectionId>('hero');
  const activeSectionRef = useRef<HomeSectionId>('hero');
  const wheelDeltaRef = useRef(0);
  const wheelLockRef = useRef(false);
  const wheelResetRef = useRef<number | null>(null);
  const wheelUnlockRef = useRef<number | null>(null);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const scrollToSection = useCallback((sectionId: HomeSectionId) => {
    const root = scrollRef.current;
    const target = root?.querySelector<HTMLElement>(`#${sectionId}`);
    if (!root || !target) return;

    root.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth',
    });
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!current) return;

        const id = current.target.id;
        if (id === 'hero' || id === 'features' || id === 'stats') {
          setActiveSection(id);
        }
      },
      {
        root,
        threshold: [0.45, 0.6, 0.75],
      }
    );

    root.querySelectorAll<HTMLElement>('[data-home-section]').forEach((section) => {
      observer.observe(section);
    });

    const onWheel = (event: WheelEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (Math.abs(event.deltaY) < 2) return;

      event.preventDefault();
      wheelDeltaRef.current += event.deltaY;

      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelResetRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
      }, 120);

      if (wheelLockRef.current) return;

      const threshold = 24;
      if (Math.abs(wheelDeltaRef.current) < threshold) return;

      const direction = wheelDeltaRef.current > 0 ? 1 : -1;
      wheelDeltaRef.current = 0;

      const currentIndex = HOME_SECTION_IDS.indexOf(activeSectionRef.current);
      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= HOME_SECTION_IDS.length) return;

      wheelLockRef.current = true;
      scrollToSection(HOME_SECTION_IDS[targetIndex]);

      if (wheelUnlockRef.current) {
        window.clearTimeout(wheelUnlockRef.current);
      }
      wheelUnlockRef.current = window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 700);
    };

    root.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      observer.disconnect();
      root.removeEventListener('wheel', onWheel);
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      if (wheelUnlockRef.current) {
        window.clearTimeout(wheelUnlockRef.current);
      }
    };
  }, [scrollToSection]);

  return (
    <div
      ref={scrollRef}
      className="relative h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain scroll-smooth [scrollbar-gutter:stable]"
    >
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-tf-accent/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-tf-accent/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tf-accent/2 blur-3xl" />
      </div>

      {/* Side navigation */}
      <aside className="fixed right-6 top-1/2 z-40 hidden xl:block -translate-y-1/2">
        <div className="glass-card-sm px-3 py-3">
          <p className="px-2 pb-3 text-xs font-medium uppercase tracking-[0.2em] text-tf-text-secondary">
            页面导航
          </p>
          <div className="flex flex-col gap-2">
            {HOME_SECTIONS.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-300',
                    active
                      ? 'bg-tf-accent/10 text-tf-accent shadow-sm'
                      : 'text-tf-secondary hover:bg-black/5 hover:text-tf-primary'
                  )}
                >
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition-colors',
                      active ? 'bg-tf-accent' : 'bg-black/15'
                    )}
                  />
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-[11px]">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Hero Section */}
      <section
        id="hero"
        data-home-section
        className="snap-start snap-always h-[100dvh] px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center text-center pt-24 pb-16">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-tf-accent" />
              <span className="text-sm text-tf-secondary">AI 驱动的新一代招聘决策平台</span>
            </div>
          </div>

          <h1 className="animate-fade-in-up-delay-1 text-4xl font-bold leading-tight text-tf-primary sm:text-5xl lg:text-6xl">
            人才智能匹配
            <br />
            <span className="gradient-text">重新定义招聘</span>
          </h1>

          <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tf-secondary sm:text-xl">
            从简历解析到技能图谱，从智能匹配到面试助手 —
            <br className="hidden sm:block" />
            TalentFlow 用 AI 重新构建招聘全流程，让每一次人才决策都更精准、更高效。
          </p>

          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/upload">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                开始使用
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => scrollToSection('features')}
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        data-home-section
        className="snap-start snap-always h-[100dvh] px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-5">
              <Sparkles className="w-4 h-4 text-tf-accent" />
              <span className="text-sm text-tf-secondary">功能模块</span>
            </div>
            <h2 className="text-3xl font-bold text-tf-primary sm:text-4xl">
              三大核心能力
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-tf-secondary">
              AI 深度赋能招聘全流程，从信息提取到决策支持，一站式完成
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={feature.title} className="p-8 text-center group">
                  <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-tf-accent/10 transition-colors duration-300 group-hover:bg-tf-accent/20">
                    <Icon className="w-7 h-7 text-tf-accent" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-tf-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-tf-secondary">
                    {feature.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/upload">
              <Button size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                进入功能页
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        data-home-section
        className="snap-start snap-always h-[100dvh] px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-5">
              <Sparkles className="w-4 h-4 text-tf-accent" />
              <span className="text-sm text-tf-secondary">数据看板</span>
            </div>
            <h2 className="text-3xl font-bold text-tf-primary sm:text-4xl">
              用数据说话
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-tf-secondary">
              TalentFlow 已为众多企业提升招聘效能
            </p>
          </div>

          <GlassCard className="p-8 sm:p-12" shimmer>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="mx-auto mb-3 h-6 w-6 text-tf-accent" />
                    <div className="mb-1 text-3xl font-bold text-tf-primary sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="text-sm text-tf-secondary">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-tf-text-secondary">
              AI 驱动的招聘决策智能体 — 小鹏 AI 公开赛参赛作品
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/candidates"
                className="text-xs text-tf-text-secondary transition-colors hover:text-tf-primary"
              >
                候选人管理
              </Link>
              <Link
                href="/dashboard"
                className="text-xs text-tf-text-secondary transition-colors hover:text-tf-primary"
              >
                数据看板
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
