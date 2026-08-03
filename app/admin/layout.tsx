import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="bg-bg min-h-screen">
      <nav className="border-border-subtle bg-surface sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-brand flex h-6 w-6 items-center justify-center rounded-lg">
                <span className="text-[10px] font-bold text-[oklch(0.10_0.012_148)]">
                  CF
                </span>
              </div>
              <span className="text-ink text-sm font-semibold">CaseForge</span>
              <span className="text-ink-faint rounded border border-[oklch(0.28_0.08_22)] bg-[oklch(0.16_0.05_22)] px-1.5 py-0.5 text-xs text-[oklch(0.60_0.18_22)]">
                Admin
              </span>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <Link
                href="/admin"
                className="text-ink-muted hover:text-ink text-sm transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/users"
                className="text-ink-muted hover:text-ink text-sm transition-colors"
              >
                Users
              </Link>
              <Link
                href="/admin/resources"
                className="text-ink-muted hover:text-ink text-sm transition-colors"
              >
                Resources
              </Link>
              <Link
                href="/admin/settings"
                className="text-ink-muted hover:text-ink text-sm transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-ink-faint hover:text-ink text-xs transition-colors"
          >
            ← App
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
