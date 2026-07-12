"use client"

import Link from "next/link"
import { Target } from "lucide-react"

type Goal = {
  id: string
  title: string
  goalType: string
  targetValue: string | null
  currentValue: string | null
  targetDate: string | null
  status: string
}

type Props = { goals: Goal[] }

function progressPct(goal: Goal): number {
  const cur = Number(goal.currentValue ?? 0)
  const target = Number(goal.targetValue ?? 1)
  if (target === 0) return 0
  return Math.min(100, Math.round((cur / target) * 100))
}

export function GoalsWidget({ goals }: Props) {
  const active = goals.filter((g) => g.status === "active")

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-brand" />
          <p className="text-ink text-sm font-semibold">Goals</p>
        </div>
        <Link href="/goals" className="text-ink-muted text-xs hover:text-ink transition-colors">Manage</Link>
      </div>
      {active.length === 0 ? (
        <div>
          <p className="text-ink-faint text-sm mb-3">No active goals.</p>
          <Link
            href="/goals"
            className="inline-flex items-center gap-1 text-brand text-sm font-medium hover:text-brand-hover transition-colors"
          >
            + Set a goal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {active.slice(0, 3).map((g) => {
            const pct = progressPct(g)
            const daysLeft = g.targetDate
              ? Math.max(0, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 86400000))
              : null

            return (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-ink text-xs font-medium truncate flex-1">{g.title}</p>
                  {daysLeft !== null && (
                    <span className={`text-xs ml-2 flex-shrink-0 ${daysLeft <= 3 ? "text-[oklch(0.60_0.18_22)]" : "text-ink-faint"}`}>
                      {daysLeft}d left
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-brand rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint text-xs">{Number(g.currentValue ?? 0).toFixed(1)}</span>
                  <span className="text-ink-faint text-xs">{pct}% · target {Number(g.targetValue ?? 0).toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
