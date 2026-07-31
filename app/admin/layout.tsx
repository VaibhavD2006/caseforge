import { requireAdmin } from "@/lib/auth/admin"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-[oklch(0.10_0.012_148)] text-[10px] font-bold">CF</span>
              </div>
              <span className="text-ink font-semibold text-sm">CaseForge</span>
              <span className="text-ink-faint text-xs px-1.5 py-0.5 bg-[oklch(0.16_0.05_22)] border border-[oklch(0.28_0.08_22)] rounded text-[oklch(0.60_0.18_22)]">Admin</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/admin" className="text-sm text-ink-muted hover:text-ink transition-colors">Overview</Link>
              <Link href="/admin/users" className="text-sm text-ink-muted hover:text-ink transition-colors">Users</Link>
              <Link href="/admin/settings" className="text-sm text-ink-muted hover:text-ink transition-colors">Settings</Link>
            </div>
          </div>
          <Link href="/dashboard" className="text-ink-faint text-xs hover:text-ink transition-colors">← App</Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
