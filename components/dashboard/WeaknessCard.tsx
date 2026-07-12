"use client"

import Link from "next/link"

const DIM_COLORS: Record<string, string> = {
  structure: "bg-[oklch(0.18_0.05_258)] text-[oklch(0.70_0.15_258)] border-[oklch(0.30_0.08_258)]",
  hypothesis: "bg-[oklch(0.16_0.05_290)] text-[oklch(0.70_0.15_290)] border-[oklch(0.28_0.08_290)]",
  quantitative: "bg-[oklch(0.16_0.05_225)] text-[oklch(0.65_0.15_225)] border-[oklch(0.28_0.08_225)]",
  business_judgment: "bg-[oklch(0.16_0.05_55)] text-[oklch(0.72_0.12_55)] border-[oklch(0.28_0.08_55)]",
  synthesis: "bg-brand-subtle text-brand border-brand-muted",
  communication: "bg-[oklch(0.16_0.05_320)] text-[oklch(0.70_0.14_320)] border-[oklch(0.28_0.08_320)]",
  confidence: "bg-[oklch(0.16_0.05_22)] text-[oklch(0.65_0.15_22)] border-[oklch(0.28_0.08_22)]",
}

type Weakness = {
  id: string
  tagLabel: string
  dimension: string
  occurrenceCount: number
  isPersistent: boolean
}

type Props = { weaknesses: Weakness[] }

export function WeaknessCard({ weaknesses }: Props) {
  if (weaknesses.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <p className="text-ink text-sm font-semibold mb-2">Recurring Weaknesses</p>
        <p className="text-ink-faint text-sm">No patterns detected yet. Complete more interviews.</p>
      </div>
    )
  }

  const persistent = weaknesses.filter((w) => w.isPersistent)
  const recent = weaknesses.filter((w) => !w.isPersistent).slice(0, 4)

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink text-sm font-semibold">Recurring Weaknesses</p>
        <Link href="/drills" className="text-brand text-xs hover:text-brand-hover transition-colors">Practice →</Link>
      </div>
      {persistent.length > 0 && (
        <div className="mb-3">
          <p className="text-[oklch(0.60_0.18_22)] text-xs font-medium mb-2">Persistent patterns</p>
          <div className="flex flex-wrap gap-1.5">
            {persistent.slice(0, 4).map((w) => (
              <span
                key={w.id}
                className={`text-xs px-2 py-0.5 rounded-full border ${DIM_COLORS[w.dimension] ?? "bg-surface-raised text-ink-muted border-border-strong"}`}
              >
                {w.tagLabel}
              </span>
            ))}
          </div>
        </div>
      )}
      {recent.length > 0 && (
        <div>
          <p className="text-ink-muted text-xs font-medium mb-2">Recent patterns</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((w) => (
              <span
                key={w.id}
                className={`text-xs px-2 py-0.5 rounded-full border ${DIM_COLORS[w.dimension] ?? "bg-surface-raised text-ink-muted border-border-strong"}`}
              >
                {w.tagLabel} ×{w.occurrenceCount}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
