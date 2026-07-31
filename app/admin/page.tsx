import { getAdminOverviewStats, getAdminUserTable } from "@/lib/db/queries/admin"
import { Users, FileText, TrendingUp, DollarSign, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

function StatCard({ label, value, sub, icon: Icon }: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-ink-muted text-xs font-medium uppercase tracking-wide">{label}</p>
        <Icon className="w-4 h-4 text-ink-faint" />
      </div>
      <p className="text-ink text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-ink-faint text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const [stats, users] = await Promise.all([
    getAdminOverviewStats(),
    getAdminUserTable(10),
  ])

  const avgCostPerSession = stats.evaluatedSessions > 0
    ? `$${(stats.totalCostCents / stats.evaluatedSessions / 100).toFixed(4)}/session`
    : "—"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-ink text-2xl font-bold mb-1">180DC Admin — CaseForge</h1>
        <p className="text-ink-muted text-sm">NC State / 180 Degrees Consulting monitoring dashboard.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users}
          sub={`${stats.activeUsers30d} active (30d)`} />
        <StatCard label="Sessions (7d)" value={stats.sessions7d} icon={Activity}
          sub={`${stats.totalSessions} total · ${stats.evaluatedSessions} evaluated`} />
        <StatCard label="Avg Score" value={stats.avgScore ?? "—"} icon={TrendingUp}
          sub="across all evaluated sessions" />
        <StatCard label="AI Cost" value={stats.totalCostFormatted} icon={DollarSign}
          sub={avgCostPerSession} />
      </div>

      {/* Recent users */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <p className="text-ink text-sm font-semibold">Top Users by Activity</p>
          <a href="/admin/users" className="text-brand text-xs hover:text-brand-hover transition-colors">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {["Name", "Email", "Sessions", "Avg Score", "AI Cost", "Last Active"].map((h) => (
                  <th key={h} className="text-left text-ink-faint text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{u.name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{u.email ?? "—"}</td>
                  <td className="px-5 py-3 text-ink tabular-nums">{u.session_count}</td>
                  <td className="px-5 py-3 text-ink tabular-nums">{u.avg_score ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-faint tabular-nums text-xs">{u.costFormatted}</td>
                  <td className="px-5 py-3 text-ink-muted text-xs">{u.lastActiveFormatted}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink-faint text-sm">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <p className="text-ink text-sm font-semibold mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/users" className="text-xs px-3 py-1.5 rounded-lg bg-brand-subtle text-brand border border-brand-muted hover:bg-brand hover:text-[oklch(0.10_0.012_148)] transition-colors">
            Manage users
          </a>
          <a href="/admin/settings" className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink hover:border-border-strong transition-colors">
            Edit config settings
          </a>
          <a href="/docs/upkeep" className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-ink hover:border-border-strong transition-colors">
            Upkeep guide
          </a>
        </div>
      </div>
    </div>
  )
}
