import {
  getAdminOverviewStats,
  getAdminUserTable,
} from '@/lib/db/queries/admin'
import { Users, FileText, TrendingUp, DollarSign, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-surface border-border-subtle rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <Icon className="text-ink-faint h-4 w-4" />
      </div>
      <p className="text-ink text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-ink-faint mt-1 text-xs">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const [stats, users] = await Promise.all([
    getAdminOverviewStats(),
    getAdminUserTable(10),
  ])

  const avgCostPerSession =
    stats.evaluatedSessions > 0
      ? `$${(stats.totalCostCents / stats.evaluatedSessions / 100).toFixed(4)}/session`
      : '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-ink mb-1 text-2xl font-bold">
          180DC Admin — CaseForge
        </h1>
        <p className="text-ink-muted text-sm">
          NC State / 180 Degrees Consulting monitoring dashboard.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          sub={`${stats.activeUsers30d} active (30d)`}
        />
        <StatCard
          label="Sessions (7d)"
          value={stats.sessions7d}
          icon={Activity}
          sub={`${stats.totalSessions} total · ${stats.evaluatedSessions} evaluated`}
        />
        <StatCard
          label="Avg Score"
          value={stats.avgScore ?? '—'}
          icon={TrendingUp}
          sub="across all evaluated sessions"
        />
        <StatCard
          label="AI Cost"
          value={stats.totalCostFormatted}
          icon={DollarSign}
          sub={avgCostPerSession}
        />
      </div>

      {/* Recent users */}
      <div className="bg-surface border-border-subtle overflow-hidden rounded-xl border">
        <div className="border-border-subtle flex items-center justify-between border-b px-5 py-4">
          <p className="text-ink text-sm font-semibold">
            Top Users by Activity
          </p>
          <a
            href="/admin/users"
            className="text-brand hover:text-brand-hover text-xs transition-colors"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border-subtle border-b">
                {[
                  'Name',
                  'Email',
                  'Sessions',
                  'Avg Score',
                  'AI Cost',
                  'Last Active',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-ink-faint px-5 py-3 text-left text-xs font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-border-subtle hover:bg-surface-hover border-b transition-colors last:border-0"
                >
                  <td className="text-ink px-5 py-3 font-medium">
                    {u.name ?? '—'}
                  </td>
                  <td className="text-ink-muted px-5 py-3">{u.email ?? '—'}</td>
                  <td className="text-ink px-5 py-3 tabular-nums">
                    {u.session_count}
                  </td>
                  <td className="text-ink px-5 py-3 tabular-nums">
                    {u.avg_score ?? '—'}
                  </td>
                  <td className="text-ink-faint px-5 py-3 text-xs tabular-nums">
                    {u.costFormatted}
                  </td>
                  <td className="text-ink-muted px-5 py-3 text-xs">
                    {u.lastActiveFormatted}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-faint px-5 py-8 text-center text-sm"
                  >
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-surface border-border-subtle rounded-xl border p-5">
        <p className="text-ink mb-3 text-sm font-semibold">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/users"
            className="bg-brand-subtle text-brand border-brand-muted hover:bg-brand rounded-lg border px-3 py-1.5 text-xs transition-colors hover:text-[oklch(0.10_0.012_148)]"
          >
            Manage users
          </a>
          <a
            href="/admin/settings"
            className="border-border-subtle text-ink-muted hover:text-ink hover:border-border-strong rounded-lg border px-3 py-1.5 text-xs transition-colors"
          >
            Edit config settings
          </a>
          <a
            href="/docs/upkeep"
            className="border-border-subtle text-ink-muted hover:text-ink hover:border-border-strong rounded-lg border px-3 py-1.5 text-xs transition-colors"
          >
            Upkeep guide
          </a>
        </div>
      </div>
    </div>
  )
}
