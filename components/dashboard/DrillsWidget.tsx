"use client"

import Link from "next/link"
import { Zap, ChevronRight } from "lucide-react"

const DIFF_COLORS: Record<string, string> = {
  easy: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  medium: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  hard: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
}

type Drill = {
  id: string
  title: string
  skillFocus: string
  difficulty: string
  estimatedMinutes: number
}

type Props = { drills: Drill[] }

export function DrillsWidget({ drills }: Props) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand" />
          <p className="text-ink text-sm font-semibold">Recommended Drills</p>
        </div>
        <Link href="/drills" className="text-ink-muted text-xs hover:text-ink transition-colors">View all</Link>
      </div>
      {drills.length === 0 ? (
        <div>
          <p className="text-ink-faint text-sm mb-3">No drills recommended yet.</p>
          <Link href="/drills" className="text-brand text-sm hover:text-brand-hover transition-colors">Browse drill library →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {drills.map((d) => (
            <Link
              key={d.id}
              href={`/drills/${d.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border-subtle hover:border-brand-muted transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-ink text-xs font-medium truncate">{d.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-ink-faint text-xs capitalize">{d.skillFocus.replace("_", " ")}</span>
                  <span className="text-ink-faint text-xs">·</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border ${DIFF_COLORS[d.difficulty] ?? "text-ink-muted bg-surface border-border-subtle"}`}>
                    {d.difficulty}
                  </span>
                  <span className="text-ink-faint text-xs">· {d.estimatedMinutes}min</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-brand flex-shrink-0 ml-2 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
