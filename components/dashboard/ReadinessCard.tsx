"use client"

const TIER_CONFIG = {
  bronze: { label: "Bronze", color: "text-[oklch(0.65_0.12_55)]", bg: "bg-[oklch(0.16_0.04_55)]", border: "border-[oklch(0.30_0.08_55)]" },
  silver: { label: "Silver", color: "text-[oklch(0.72_0.04_265)]", bg: "bg-[oklch(0.16_0.02_265)]", border: "border-[oklch(0.30_0.04_265)]" },
  gold: { label: "Gold", color: "text-[oklch(0.78_0.15_85)]", bg: "bg-[oklch(0.16_0.05_85)]", border: "border-[oklch(0.30_0.10_85)]" },
  emerald: { label: "Emerald", color: "text-[oklch(0.72_0.16_160)]", bg: "bg-[oklch(0.14_0.05_160)]", border: "border-[oklch(0.28_0.10_160)]" },
}

const READINESS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  developing: "Developing",
  approaching_ready: "Approaching Ready",
  interview_ready: "Interview Ready",
}

type Props = {
  avgScore: number
  evaluatedSessions: number
  readinessLevel: string
  tier: "bronze" | "silver" | "gold" | "emerald"
}

export function ReadinessCard({ avgScore, evaluatedSessions, readinessLevel, tier }: Props) {
  const t = TIER_CONFIG[tier]
  const pct = Math.round((avgScore / 10) * 100)

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">Overall Readiness</p>
          <p className="text-ink text-3xl font-bold tabular-nums">
            {evaluatedSessions > 0 ? avgScore.toFixed(1) : "—"}
            {evaluatedSessions > 0 && <span className="text-ink-muted text-base font-normal">/10</span>}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${t.color} ${t.bg} ${t.border}`}>
          {t.label}
        </span>
      </div>

      {evaluatedSessions > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-ink-muted text-xs">{READINESS_LABELS[readinessLevel] ?? readinessLevel}</span>
            <span className="text-brand text-xs font-medium">{pct}%</span>
          </div>
          <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
            <div
              className="h-2 bg-brand rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-ink-muted text-xs">
        {evaluatedSessions === 0
          ? "Complete your first interview to see your score."
          : `Based on ${evaluatedSessions} evaluated session${evaluatedSessions !== 1 ? "s" : ""}`}
      </p>
    </div>
  )
}
