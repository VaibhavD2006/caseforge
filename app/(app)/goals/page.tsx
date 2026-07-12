"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Target, Plus, Trash2, CheckCircle } from "lucide-react"

type Goal = {
  id: string
  title: string
  goalType: string
  targetValue: string | null
  currentValue: string | null
  targetDate: string | null
  status: string
}

const GOAL_TYPES = [
  { value: "score_target", label: "Overall Score Target" },
  { value: "dimension_target", label: "Dimension Score Target" },
  { value: "session_count", label: "Session Count" },
  { value: "drill_count", label: "Drill Count" },
]

const DIMENSIONS = ["structure", "hypothesis", "quantitative", "business_judgment", "synthesis", "communication", "confidence"]

function pct(g: Goal) {
  const cur = Number(g.currentValue ?? 0)
  const target = Number(g.targetValue ?? 1)
  return target === 0 ? 0 : Math.min(100, Math.round((cur / target) * 100))
}

function daysLeft(dateStr: string | null) {
  if (!dateStr) return null
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", goalType: "score_target", targetValue: "", dimension: "", targetDate: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch("/api/goals")
    if (res.ok) setGoals(await res.json())
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function handleCreate() {
    if (!form.title.trim()) return
    setSaving(true)
    const body: Record<string, unknown> = {
      title: form.title,
      goalType: form.goalType,
      targetValue: form.targetValue ? Number(form.targetValue) : undefined,
      targetDate: form.targetDate || undefined,
      dimension: form.dimension || undefined,
    }
    const res = await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      const created = await res.json()
      setGoals((prev) => [created, ...prev])
      setShowForm(false)
      setForm({ title: "", goalType: "score_target", targetValue: "", dimension: "", targetDate: "" })
    }
    setSaving(false)
  }

  async function handleComplete(id: string) {
    await fetch(`/api/goals/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" />
            <span className="text-ink font-semibold text-sm">Goals</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-ink-muted text-xs hover:text-ink transition-colors">← Dashboard</Link>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New goal
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-ink text-xl font-bold mb-1">Your Goals</h1>
          <p className="text-ink-muted text-sm">Track what you&apos;re working toward.</p>
        </div>

        {/* New goal form */}
        {showForm && (
          <div className="bg-surface border border-brand-muted rounded-xl p-5 mb-6">
            <h2 className="text-ink text-sm font-semibold mb-4">New goal</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Goal title (e.g. Reach 7.5 avg score)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand-muted"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-ink-faint text-xs mb-1 block">Type</label>
                  <select
                    value={form.goalType}
                    onChange={(e) => setForm((f) => ({ ...f, goalType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand-muted cursor-pointer"
                  >
                    {GOAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-ink-faint text-xs mb-1 block">Target value</label>
                  <input
                    type="number"
                    placeholder="e.g. 7.5"
                    value={form.targetValue}
                    onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand-muted"
                  />
                </div>
              </div>
              {form.goalType === "dimension_target" && (
                <div>
                  <label className="text-ink-faint text-xs mb-1 block">Dimension</label>
                  <select
                    value={form.dimension}
                    onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand-muted cursor-pointer"
                  >
                    <option value="">Select dimension</option>
                    {DIMENSIONS.map((d) => <option key={d} value={d}>{d.replace("_", " ")}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-ink-faint text-xs mb-1 block">Target date (optional)</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand-muted"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => void handleCreate()} disabled={!form.title.trim() || saving} className="flex-1 py-2 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? "Saving…" : "Create goal"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-border-subtle text-ink-muted text-sm hover:border-border-strong transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-ink-faint text-sm py-12 justify-center">
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            Loading goals…
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-surface border border-border-subtle rounded-xl p-8 text-center">
            <Target className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink text-sm font-medium mb-1">No active goals</p>
            <p className="text-ink-muted text-xs mb-4">Set a target to track your prep progress.</p>
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 text-brand text-sm hover:text-brand-hover transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Create your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((g) => {
              const p = pct(g)
              const d = daysLeft(g.targetDate)
              const behind = d !== null && d <= 3 && p < 80
              return (
                <div key={g.id} className="bg-surface border border-border-subtle rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-ink text-sm font-semibold">{g.title}</p>
                      <p className="text-ink-faint text-xs capitalize mt-0.5">{g.goalType.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {behind && <span className="text-xs px-2 py-0.5 rounded-full border border-[oklch(0.60_0.18_22)] text-[oklch(0.60_0.18_22)]">At risk</span>}
                      {d !== null && <span className={`text-xs ${d <= 3 ? "text-[oklch(0.60_0.18_22)]" : "text-ink-faint"}`}>{d}d left</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-2">
                    <div className="h-1.5 bg-brand rounded-full transition-all" style={{ width: `${p}%` }} />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ink-faint text-xs">{Number(g.currentValue ?? 0).toFixed(1)} / {Number(g.targetValue ?? 0).toFixed(1)}</span>
                    <span className="text-ink-muted text-xs">{p}% complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => void handleComplete(g.id)} className="flex items-center gap-1 text-xs text-[oklch(0.62_0.15_158)] hover:opacity-80 transition-opacity cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Mark complete
                    </button>
                    <button type="button" onClick={() => void handleDelete(g.id)} className="flex items-center gap-1 text-xs text-ink-faint hover:text-[oklch(0.60_0.18_22)] transition-colors cursor-pointer ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
