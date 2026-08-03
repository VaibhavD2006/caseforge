'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/resources', label: 'Resources' },
  { href: '/drills', label: 'Drills' },
  { href: '/goals', label: 'Goals' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/history', label: 'History' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/settings', label: 'Settings' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="border-border-subtle bg-surface sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-brand flex h-6 w-6 items-center justify-center rounded-lg">
              <span className="text-[10px] font-bold text-[oklch(0.10_0.012_148)]">
                CF
              </span>
            </div>
            <span className="text-ink text-sm font-semibold">CaseForge</span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-ink font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/resources"
          className="bg-brand hover:bg-brand-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[oklch(0.10_0.012_148)] transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Browse Resources
        </Link>
      </div>
    </nav>
  )
}
