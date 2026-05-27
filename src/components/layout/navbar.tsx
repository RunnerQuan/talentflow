// ============================================================
// TalentFlow — Floating Navbar (Liquid Glass)
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  Sparkles,
  Upload,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  UserCircle,
  ListOrdered,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/upload', label: '简历解析', icon: Upload },
  { href: '/candidates', label: '候选人管理', icon: UserCircle },
  { href: '/match', label: '智能匹配', icon: Users },
  { href: '/ranking', label: '批量排序', icon: ListOrdered },
  { href: '/interview', label: '面试助手', icon: MessageSquare },
  { href: '/dashboard', label: '数据看板', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop floating nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="glass-card flex items-center gap-1 px-2.5 py-2.5 whitespace-nowrap">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-tf-accent" />
            <span className="font-serif font-bold text-tf-primary text-[15px]">
              TalentFlow
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-black/10 mx-1.5" />

          {/* Nav links */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-max items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[15px] whitespace-nowrap',
                  'transition-all duration-300 cursor-pointer font-medium',
                  isActive
                    ? 'bg-tf-accent/10 text-tf-accent font-medium'
                    : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap leading-none">{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-black/10 mx-1.5" />

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex min-w-max items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] whitespace-nowrap',
              'transition-all duration-300 cursor-pointer font-medium',
              pathname === '/settings'
                ? 'bg-tf-accent/10 text-tf-accent font-medium'
                : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
            )}
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-card-sm rounded-none border-x-0 border-t-0 flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-5 h-5 text-tf-accent" />
            <span className="font-serif font-bold text-tf-primary text-[15px]">
              TalentFlow
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-tf-primary" />
            ) : (
              <Menu className="w-5 h-5 text-tf-primary" />
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="glass-card-sm rounded-none border-x-0 flex flex-col px-4 py-2 animate-fade-in-up">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-[15px]',
                    'transition-all duration-300 cursor-pointer font-medium whitespace-nowrap',
                    isActive
                      ? 'bg-tf-accent/10 text-tf-accent font-medium'
                      : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-[15px]',
                'transition-all duration-300 cursor-pointer font-medium whitespace-nowrap',
                pathname === '/settings'
                  ? 'bg-tf-accent/10 text-tf-accent font-medium'
                  : 'text-tf-secondary hover:text-tf-primary hover:bg-black/5'
              )}
            >
              <Settings className="w-4 h-4" />
              <span>模型配置</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
