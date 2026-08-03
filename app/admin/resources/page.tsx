import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"
import { getAllResourcesAdmin } from "@/lib/db/queries/resources"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminResourcesPage() {
  await requireAdmin()
  const resources = await getAllResourcesAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ink mb-1 text-xl font-bold">Resources</h1>
          <p className="text-ink-muted text-sm">{resources.length} resources in the library.</p>
        </div>
        <Link
          href="/admin/resources/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Resource
        </Link>
      </div>

      <div className="bg-surface border-border-subtle overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border-subtle border-b">
                {["Title", "Format", "Difficulty", "Featured", "Published", "Views", "Added"].map((h) => (
                  <th key={h} className="text-ink-faint px-4 py-3 text-left text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-border-subtle hover:bg-surface-hover border-b transition-colors last:border-0">
                  <td className="text-ink px-4 py-3 font-medium max-w-xs truncate">
                    <Link href={`/resources/${r.slug}`} className="hover:text-brand transition-colors">
                      {r.title}
                    </Link>
                  </td>
                  <td className="text-ink-muted px-4 py-3 text-xs">{r.format}</td>
                  <td className="text-ink-muted px-4 py-3 text-xs">{r.difficulty}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${r.isFeatured ? "text-brand bg-[oklch(0.14_0.05_158)]" : "text-ink-faint"}`}>
                      {r.isFeatured ? "★ Featured" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium ${r.isPublished ? "text-[oklch(0.62_0.15_158)]" : "text-[oklch(0.60_0.18_22)]"}`}>
                      {r.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="text-ink-muted px-4 py-3 tabular-nums text-xs">{r.viewCount}</td>
                  <td className="text-ink-faint px-4 py-3 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-ink-faint px-4 py-8 text-center text-sm">No resources yet. Add the first one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
