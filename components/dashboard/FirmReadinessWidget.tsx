"use client"

// ponytail: oklch values match the existing dashboard color palette; no new design tokens needed

const FIRM_BENCHMARKS: Record<string, { label: string; minScore: number; dimensions: string[] }> = {
  mbb: {
    label: "MBB",
    minScore: 7.5,
    dimensions: ["structure", "hypothesis", "synthesis", "business_judgment"],
  },
  big4: {
    label: "Big Four",
    minScore: 6.5,
    dimensions: ["structure", "communication", "business_judgment"],
  },
  boutique: {
    label: "Boutique",
    minScore: 7.0,
    dimensions: ["hypothesis", "synthesis", "quantitative"],
  },
  generic: {
    label: "General Consulting",
    minScore: 6.0,
    dimensions: ["structure", "communication"],
  },
}

type Props = {
  avgDimensions: Record<string, number>
  targetFirms: string[]
}

function computeReadiness(firmKey: string, avgDimensions: Record<string, number>) {
  // ponytail: non-null assert safe — generic key always exists in the const above
  const bench = (FIRM_BENCHMARKS[firmKey.toLowerCase()] ?? FIRM_BENCHMARKS.generic)!
  const scores = bench.dimensions.map((d) => avgDimensions[d] ?? 0).filter((s) => s > 0)
  if (scores.length === 0) return { pct: 0, label: "No data", barColor: "oklch(0.32 0.10 148)" }
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const pct = Math.round(Math.min(100, (avg / bench.minScore) * 100))
  const label =
    pct >= 100 ? "Ready" : pct >= 75 ? "Approaching" : pct >= 50 ? "Developing" : "Early Stage"
  const barColor =
    pct >= 100
      ? "oklch(0.72 0.16 160)"
      : pct >= 75
      ? "oklch(0.72 0.20 148)"
      : pct >= 50
      ? "oklch(0.72 0.15 78)"
      : "oklch(0.32 0.10 148)"
  return { pct, label, barColor }
}

export function FirmReadinessWidget({ avgDimensions, targetFirms }: Props) {
  const keys = (targetFirms.length > 0 ? targetFirms : ["mbb", "big4", "boutique", "generic"]).slice(0, 4)

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <p className="text-ink-muted text-xs uppercase tracking-wider mb-4">Firm Readiness</p>
      <div className="space-y-3">
        {keys.map((key) => {
          const bench = (FIRM_BENCHMARKS[key.toLowerCase()] ?? FIRM_BENCHMARKS.generic)!
          const { pct, label, barColor } = computeReadiness(key, avgDimensions)
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-ink text-sm font-medium">{bench.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink-muted text-xs">{label}</span>
                  <span className="text-ink-faint text-xs tabular-nums">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {Object.keys(avgDimensions).length === 0 && (
        <p className="text-ink-faint text-xs mt-3">Complete an interview to see firm readiness.</p>
      )}
    </div>
  )
}
