'use client';

import Link from 'next/link';
import { ArrowRight, KeyRound, PlayCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export function DemoEntry() {
  return (
    <GlassCard className="overflow-hidden p-6 sm:p-8" shimmer>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-tf-accent/10 px-3 py-1.5 text-xs font-medium text-tf-accent">
            <KeyRound className="h-3.5 w-3.5" />
            Demo Mode · 无需 API Key
          </div>
          <h2 className="text-2xl font-bold text-tf-primary sm:text-3xl">
            没有模型配置，也能完整体验招聘决策闭环
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-tf-secondary sm:text-base">
            系统将加载模拟候选人、Java 后端岗位 JD、预生成 AI 匹配证据链、风险追问和候选人排序，
            适合比赛现场稳定演示。
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <Link href="/demo">
            <Button size="lg" icon={<PlayCircle className="h-5 w-5" />}>
              一键体验
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="secondary" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
              上传简历开始
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
