'use client'

import { useState } from 'react'
import { Save, Check } from 'lucide-react'

type Setting = { key: string; value: string; description: string }

export default function ConfigSettingsClient({
  settings,
}: {
  settings: Setting[]
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function save(key: string) {
    setSaving(key)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        <div
          key={s.key}
          className="bg-surface border-border-subtle rounded-xl border p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-ink font-mono text-sm font-medium">{s.key}</p>
              {s.description && (
                <p className="text-ink-faint mt-0.5 text-xs">{s.description}</p>
              )}
              <input
                type="text"
                value={values[s.key] ?? ''}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [s.key]: e.target.value }))
                }
                className="border-border-subtle bg-bg text-ink focus:border-brand-muted mt-2 w-full rounded-lg border px-3 py-1.5 font-mono text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={() => save(s.key)}
              disabled={saving === s.key}
              className="bg-brand hover:bg-brand-hover mt-6 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[oklch(0.10_0.012_148)] transition-colors disabled:opacity-60"
            >
              {saved === s.key ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saved === s.key ? 'Saved' : saving === s.key ? '…' : 'Save'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
