// ============================================================
// TalentFlow — Floating Navbar (Liquid Glass)
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Upload,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/upload', label: '简历解析', icon: Upload },
  { href: '/candidates', label: '候选人管理', icon: UserCircle },
  { href: '/match', label: '智能匹配', icon: Users },
  { href: '/interview', label: '面试助手', icon: MessageSquare },
  { href: '/dashboard', label: '数据看板', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Don't show on landing page — it has its own hero nav. */
  if (pathname === '/') return null;

  return (
    <>
      {/* Desktop floating nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="glass-card flex items-center gap-1 px-2 py-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-tf-accent" />
            <span className="font-serif font-bold text-tf-primary text-sm">
              TalentFlow
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-black/10 mx-1" />

          {/* Nav links */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
                  'transition-all duration-300 cursor-pointer',
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

          {/* Divider */}
          <div className="w-px h-6 bg-black/10 mx-1" />

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
              'transition-all duration-300 cursor-pointer',
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
            <span className="font-serif font-bold text-tf-primary text-sm">
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
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm',
                    'transition-all duration-300 cursor-pointer',
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
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm',
                'transition-all duration-300 cursor-pointer',
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
