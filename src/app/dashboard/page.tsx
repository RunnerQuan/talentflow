// ============================================================
// TalentFlow — Efficiency Dashboard Page
// ============================================================

'use client';

import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import type { ROIInputs, ROIOutputs } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Users,
  Calculator,
  DollarSign,
  Timer,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

/** Mock efficiency trend data. */
const EFFICIENCY_TREND = [
  { month: '1月', matches: 12, avgTime: 45, efficiency: 1.2 },
  { month: '2月', matches: 18, avgTime: 38, efficiency: 1.5 },
  { month: '3月', matches: 25, avgTime: 32, efficiency: 2.0 },
  { month: '4月', matches: 35, avgTime: 25, efficiency: 2.8 },
  { month: '5月', matches: 48, avgTime: 18, efficiency: 3.5 },
  { month: '6月', matches: 62, avgTime: 12, efficiency: 4.8 },
  { month: '7月', matches: 78, avgTime: 10, efficiency: 5.5 },
  { month: '8月', matches: 95, avgTime: 8, efficiency: 6.2 },
];

/** Mock usage frequency data. */
const USAGE_FREQUENCY = [
  { day: '周一', resume: 15, match: 8, interview: 3 },
  { day: '周二', resume: 22, match: 12, interview: 5 },
  { day: '周三', resume: 18, match: 15, interview: 7 },
  { day: '周四', resume: 25, match: 18, interview: 4 },
  { day: '周五', resume: 30, match: 22, interview: 8 },
  { day: '周六', resume: 8, match: 5, interview: 2 },
  { day: '周日', resume: 5, match: 3, interview: 1 },
];

/** Stat card data. */
const STAT_CARDS = [
  {
    icon: Target,
    label: '累计匹配次数',
    value: '373',
    change: '+28%',
    color: 'text-tf-accent',
    bgColor: 'bg-tf-accent/10',
  },
  {
    icon: Clock,
    label: '平均处理时间',
    value: '8.2分钟',
    change: '-82%',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Zap,
    label: '效率提升倍数',
    value: '6.2x',
    change: '+420%',
    color: 'text-tf-accent',
    bgColor: 'bg-tf-accent/10',
  },
  {
    icon: Users,
    label: '处理候选人',
    value: '156',
    change: '+45%',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

export default function DashboardPage() {
  /** ROI Calculator state. */
  const [roiInputs, setROIInputs] = useState<ROIInputs>({
    teamSize: 5,
    avgSalary: 15000,
    monthlyResumes: 200,
    timePerResume: 45,
  });

  /** Calculate ROI outputs. */
  const roiOutputs = useMemo<ROIOutputs>(() => {
    const aiTimePerResume = 8; // minutes with AI
    const monthlyTimeSavedHours =
      (roiInputs.monthlyResumes * (roiInputs.timePerResume - aiTimePerResume)) / 60;
    const yearlyTimeSavedHours = monthlyTimeSavedHours * 12;
    const hourlyCost = roiInputs.avgSalary / 22 / 8; // monthly salary / working days / hours
    const yearlyCostSaved = yearlyTimeSavedHours * hourlyCost * roiInputs.teamSize;
    const aiMonthlyCost = 200; // estimated AI API cost
    const roiPercentage =
      ((yearlyCostSaved - aiMonthlyCost * 12) / (aiMonthlyCost * 12)) * 100;

    return {
      monthlyTimeSaved: Math.round(monthlyTimeSavedHours * 10) / 10,
      yearlyCostSaved: Math.round(yearlyCostSaved),
      roiPercentage: Math.round(roiPercentage),
    };
  }, [roiInputs]);

  const handleROIChange = (field: keyof ROIInputs, value: string) => {
    setROIInputs((prev) => ({
      ...prev,
      [field]: Math.max(0, Number(value) || 0),
    }));
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 glass-card-sm px-4 py-2 mb-4">
            <BarChart3 className="w-4 h-4 text-tf-accent" />
            <span className="text-sm text-tf-secondary">数据看板</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-tf-primary mb-2">
            效率提升看板
          </h1>
          <p className="text-tf-secondary">
            可视化展示 TalentFlow 为您带来的效率提升与成本优化
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((stat) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={stat.label} className="p-5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bgColor)}>
                  <Icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <p className="text-2xl font-bold text-tf-primary mb-0.5">{stat.value}</p>
                <p className="text-xs text-tf-text-secondary mb-2">{stat.label}</p>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-md',
                    stat.change.startsWith('+')
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-tf-accent/10 text-tf-accent'
                  )}
                >
                  {stat.change}
                </span>
              </GlassCard>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Efficiency trend chart */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-tf-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tf-accent" />
              效率趋势
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={EFFICIENCY_TREND}>
                <defs>
                  <linearGradient id="gradientEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CA8A04" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#CA8A04" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#CA8A04"
                  strokeWidth={2}
                  fill="url(#gradientEfficiency)"
                  name="效率倍数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Usage frequency chart */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-tf-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-tf-accent" />
              使用频次
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={USAGE_FREQUENCY} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="resume" fill="#CA8A04" radius={[4, 4, 0, 0]} name="简历解析" />
                <Bar dataKey="match" fill="#D97706" radius={[4, 4, 0, 0]} name="匹配评估" />
                <Bar dataKey="interview" fill="#B45309" radius={[4, 4, 0, 0]} name="面试助手" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* ROI Calculator */}
        <GlassCard className="p-8">
          <h3 className="text-lg font-serif font-bold text-tf-primary mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-tf-accent" />
            ROI 计算器
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div>
              <p className="text-xs font-medium text-tf-secondary mb-4 uppercase tracking-wider">
                输入参数
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="招聘团队人数"
                  type="number"
                  value={roiInputs.teamSize}
                  onChange={(e) => handleROIChange('teamSize', e.target.value)}
                  icon={<Users className="w-4 h-4" />}
                />
                <Input
                  label="平均月薪 (元)"
                  type="number"
                  value={roiInputs.avgSalary}
                  onChange={(e) => handleROIChange('avgSalary', e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <Input
                  label="月处理简历数"
                  type="number"
                  value={roiInputs.monthlyResumes}
                  onChange={(e) => handleROIChange('monthlyResumes', e.target.value)}
                  icon={<Target className="w-4 h-4" />}
                />
                <Input
                  label="单份耗时 (分钟)"
                  type="number"
                  value={roiInputs.timePerResume}
                  onChange={(e) => handleROIChange('timePerResume', e.target.value)}
                  icon={<Timer className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Outputs */}
            <div>
              <p className="text-xs font-medium text-tf-secondary mb-4 uppercase tracking-wider">
                预期收益
              </p>
              <div className="space-y-4">
                <GlassCard variant="xs" className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-tf-accent/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-tf-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-tf-primary">
                      {formatNumber(roiOutputs.monthlyTimeSaved)} 小时
                    </p>
                    <p className="text-xs text-tf-text-secondary">每月节省时间</p>
                  </div>
                </GlassCard>

                <GlassCard variant="xs" className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-tf-primary">
                      {formatCurrency(roiOutputs.yearlyCostSaved)}
                    </p>
                    <p className="text-xs text-tf-text-secondary">年度节省成本</p>
                  </div>
                </GlassCard>

                <GlassCard variant="xs" className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-tf-primary">
                      {formatNumber(roiOutputs.roiPercentage)}%
                    </p>
                    <p className="text-xs text-tf-text-secondary">投资回报率</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
