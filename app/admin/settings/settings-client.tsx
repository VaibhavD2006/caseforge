"use client"

import { useState } from "react"
import { Save, Check } from "lucide-react"

type Setting = { key: string; value: string; description: string }

export default function ConfigSettingsClient({ settings }: { settings: Setting[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function save(key: string) {
    setSaving(key)
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      })
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-3">
      {settings.map((s) => (
        <div key={s.key} className="bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-ink text-sm font-mono font-medium">{s.key}</p>
              {s.description && (
                <p className="text-ink-faint text-xs mt-0.5">{s.description}</p>
              )}
              <input
                type="text"
                value={values[s.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                className="mt-2 w-full px-3 py-1.5 rounded-lg border border-border-subtle bg-bg text-ink text-sm font-mono focus:outline-none focus:border-brand-muted"
              />
            </div>
            <button
              onClick={() => save(s.key)}
              disabled={saving === s.key}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-6 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {saved === s.key ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved === s.key ? "Saved" : saving === s.key ? "…" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
