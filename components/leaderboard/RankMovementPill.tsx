"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type Movement = { delta: number; direction: "up" | "down" | "same" | "new" }

export function RankMovementPill({ movement }: { movement: Movement }) {
  if (movement.direction === "new") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(0.14_0.05_160)] text-[oklch(0.72_0.16_160)] border border-[oklch(0.28_0.10_160)]">
        NEW
      </span>
    )
  }
  if (movement.direction === "same") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-ink-faint border border-border-subtle">
        <Minus className="w-2.5 h-2.5" />
        —
      </span>
    )
  }
  const isUp = movement.direction === "up"
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        isUp
          ? "bg-[oklch(0.14_0.05_148)] text-brand border-[oklch(0.25_0.08_148)]"
          : "bg-[oklch(0.15_0.05_22)] text-[oklch(0.62_0.18_22)] border-[oklch(0.28_0.10_22)]"
      }`}
    >
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {movement.delta}
    </span>
  )
}
