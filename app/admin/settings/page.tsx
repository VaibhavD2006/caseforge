import { getConfigSettings } from "@/lib/db/queries/admin"
import ConfigSettingsClient from "./settings-client"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getConfigSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-xl font-bold mb-1">Config Settings</h1>
        <p className="text-ink-muted text-sm">
          Edit leaderboard rules, season dates, and feature toggles. No code deploy required.
        </p>
      </div>
      <ConfigSettingsClient settings={settings.map((s) => ({
        key: s.key,
        value: JSON.stringify(s.valueJson),
        description: s.description ?? "",
      }))} />
    </div>
  )
}
