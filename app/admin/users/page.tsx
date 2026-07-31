import { getAdminUserTable } from '@/lib/db/queries/admin'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await getAdminUserTable(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink mb-1 text-xl font-bold">All Users</h1>
        <p className="text-ink-muted text-sm">{users.length} users total.</p>
      </div>

      <div className="bg-surface border-border-subtle overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border-subtle border-b">
                {[
                  'Name',
                  'Email',
                  'Role',
                  'Org',
                  'Sessions',
                  "Eval'd",
                  'Avg Score',
                  'AI Cost',
                  'Last Active',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-ink-faint px-4 py-3 text-left text-xs font-medium"
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
                  <td className="text-ink px-4 py-3 font-medium">
                    {u.name ?? '—'}
                  </td>
                  <td className="text-ink-muted px-4 py-3 text-xs">
                    {u.email ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        u.role === 'admin' || u.role === 'super_admin'
                          ? 'text-brand bg-brand-subtle border-brand-muted'
                          : 'text-ink-faint border-border-subtle'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="text-ink-muted px-4 py-3 text-xs">
                    {u.organization ?? '—'}
                  </td>
                  <td className="text-ink px-4 py-3 tabular-nums">
                    {u.session_count}
                  </td>
                  <td className="text-ink px-4 py-3 tabular-nums">
                    {u.evaluated_count}
                  </td>
                  <td className="text-ink px-4 py-3 tabular-nums">
                    {u.avg_score ?? '—'}
                  </td>
                  <td className="text-ink-faint px-4 py-3 text-xs tabular-nums">
                    {u.costFormatted}
                  </td>
                  <td className="text-ink-muted px-4 py-3 text-xs">
                    {u.lastActiveFormatted}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-ink-faint px-4 py-8 text-center text-sm"
                  >
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface border-border-subtle rounded-xl border p-5">
        <p className="text-ink mb-2 text-sm font-semibold">
          Grant admin access
        </p>
        <p className="text-ink-muted text-xs leading-relaxed">
          To make someone an admin, run in the Supabase SQL editor:
        </p>
        <pre className="border-border-subtle text-ink-muted mt-2 overflow-x-auto rounded-lg border bg-[oklch(0.11_0.012_148)] p-3 text-xs">
          {`UPDATE users SET role = 'admin', organization = '180dc_ncstate'\nWHERE email = 'their@email.com';`}
        </pre>
      </div>
    </div>
  )
}
