"use client"

const DIMENSIONS = [
  { key: "structure", label: "Structure" },
  { key: "hypothesis", label: "Hypothesis" },
  { key: "quantitative", label: "Quant" },
  { key: "business_judgment", label: "Biz Judgment" },
  { key: "synthesis", label: "Synthesis" },
  { key: "communication", label: "Communication" },
  { key: "confidence", label: "Confidence" },
]

type Props = { scores: Record<string, number> | null }

export function DimensionBreakdown({ scores }: Props) {
  if (!scores || Object.keys(scores).length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <p className="text-ink text-sm font-semibold mb-4">Dimension Scores</p>
        <p className="text-ink-faint text-sm">Complete an interview to see your breakdown.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <p className="text-ink text-sm font-semibold mb-4">Dimension Scores</p>
      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label }) => {
          const score = scores[key] ?? 0
          const pct = (score / 10) * 100
          const color =
            score >= 7.5
              ? "bg-[oklch(0.62_0.15_158)]"
              : score >= 5
                ? "bg-brand"
                : "bg-[oklch(0.60_0.18_22)]"

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-ink-muted text-xs w-24 flex-shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-ink text-xs font-medium tabular-nums w-6 text-right">{score.toFixed(1)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
