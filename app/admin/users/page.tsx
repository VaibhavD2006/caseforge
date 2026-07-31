import { getAdminUserTable } from "@/lib/db/queries/admin"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const users = await getAdminUserTable(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-xl font-bold mb-1">All Users</h1>
        <p className="text-ink-muted text-sm">{users.length} users total.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {["Name", "Email", "Role", "Org", "Sessions", "Eval'd", "Avg Score", "AI Cost", "Last Active"].map((h) => (
                  <th key={h} className="text-left text-ink-faint text-xs font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      u.role === "admin" || u.role === "super_admin"
                        ? "text-brand bg-brand-subtle border-brand-muted"
                        : "text-ink-faint border-border-subtle"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{u.organization ?? "—"}</td>
                  <td className="px-4 py-3 text-ink tabular-nums">{u.session_count}</td>
                  <td className="px-4 py-3 text-ink tabular-nums">{u.evaluated_count}</td>
                  <td className="px-4 py-3 text-ink tabular-nums">{u.avg_score ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-faint text-xs tabular-nums">{u.costFormatted}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{u.lastActiveFormatted}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-ink-faint text-sm">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <p className="text-ink text-sm font-semibold mb-2">Grant admin access</p>
        <p className="text-ink-muted text-xs leading-relaxed">
          To make someone an admin, run in the Supabase SQL editor:
        </p>
        <pre className="mt-2 bg-[oklch(0.11_0.012_148)] border border-border-subtle rounded-lg p-3 text-xs text-ink-muted overflow-x-auto">
          {`UPDATE users SET role = 'admin', organization = '180dc_ncstate'\nWHERE email = 'their@email.com';`}
        </pre>
      </div>
    </div>
  )
}
