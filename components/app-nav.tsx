import Link from "next/link"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview/new", label: "Interview" },
  { href: "/drills", label: "Drills" },
  { href: "/resources", label: "Resources" },
  { href: "/goals", label: "Goals" },
  { href: "/analytics", label: "Analytics" },
  { href: "/history", label: "History" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/settings", label: "Settings" },
]

export function AppNav() {
  return (
    <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-[10px] font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold text-sm">CaseForge</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-muted text-sm hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/interview/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors"
        >
          Start Interview
        </Link>
      </div>
    </nav>
  )
}
