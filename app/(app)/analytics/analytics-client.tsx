"use client"

import Link from "next/link"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart2 } from "lucide-react"

const DIM_LABELS: Record<string, string> = {
  structure: "Structure",
  hypothesis: "Hypothesis",
  quantitative: "Quantitative",
  business_judgment: "Business Judgment",
  synthesis: "Synthesis",
  communication: "Communication",
  confidence: "Confidence",
}

const MODE_LABELS: Record<string, string> = {
  case: "Case",
  market_sizing: "Market Sizing",
  behavioral: "Behavioral",
  drill: "Drill",
}

type Props = {
  scoreTrend: { label: string; score: number }[]
  avgDimensions: Record<string, number>
  modeAvg: { mode: string; avg: number; count: number }[]
  sessionFreq: { label: string; count: number }[]
  weaknesses: { label: string; count: number; dimension: string }[]
  totalSessions: number
  evaluatedSessions: number
}

const CHART_GREEN = "oklch(0.72 0.20 148)"
const CHART_MUTED = "oklch(0.32 0.10 148)"
const AXIS_COLOR = "oklch(0.42 0.008 148)"
const GRID_COLOR = "oklch(0.24 0.015 148)"

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <p className="text-ink text-sm font-semibold mb-4">{title}</p>
      {children}
    </div>
  )
}

export default function AnalyticsClient({ scoreTrend, avgDimensions, modeAvg, sessionFreq, weaknesses, totalSessions, evaluatedSessions }: Props) {
  const dimData = Object.entries(avgDimensions).map(([d, v]) => ({ dim: DIM_LABELS[d] ?? d, score: v }))

  if (evaluatedSessions === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center">
          <BarChart2 className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <p className="text-ink text-base font-semibold mb-1">No data yet</p>
          <p className="text-ink-muted text-sm mb-4">Complete your first interview to see analytics.</p>
          <Link href="/interview/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors">
            Start interview
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand" />
            <span className="text-ink font-semibold text-sm">Analytics</span>
          </div>
          <Link href="/dashboard" className="text-ink-muted text-xs hover:text-ink transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total sessions", value: totalSessions },
            { label: "Evaluated", value: evaluatedSessions },
            { label: "Dimensions tracked", value: Object.keys(avgDimensions).length },
            { label: "Weaknesses flagged", value: weaknesses.length },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-border-subtle rounded-xl p-4 text-center">
              <p className="text-ink text-2xl font-bold mb-0.5">{s.value}</p>
              <p className="text-ink-faint text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Score trend */}
          <ChartCard title="Score over time">
            {scoreTrend.length < 2 ? (
              <p className="text-ink-faint text-sm">Need at least 2 sessions to show trend.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "oklch(0.14 0.013 148)", border: "1px solid oklch(0.24 0.015 148)", borderRadius: 8, color: "oklch(0.95 0.005 148)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke={CHART_GREEN} strokeWidth={2} dot={{ fill: CHART_GREEN, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Dimension averages */}
          <ChartCard title="Dimension averages">
            {dimData.length === 0 ? (
              <p className="text-ink-faint text-sm">No dimension data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dimData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                  <YAxis type="category" dataKey="dim" tick={{ fill: AXIS_COLOR, fontSize: 10 }} width={58} />
                  <Tooltip contentStyle={{ background: "oklch(0.14 0.013 148)", border: "1px solid oklch(0.24 0.015 148)", borderRadius: 8, color: "oklch(0.95 0.005 148)", fontSize: 12 }} />
                  <Bar dataKey="score" fill={CHART_GREEN} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Mode performance */}
          <ChartCard title="Performance by mode">
            {modeAvg.length === 0 ? (
              <p className="text-ink-faint text-sm">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modeAvg.map((m) => ({ ...m, mode: MODE_LABELS[m.mode] ?? m.mode }))} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="mode" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "oklch(0.14 0.013 148)", border: "1px solid oklch(0.24 0.015 148)", borderRadius: 8, color: "oklch(0.95 0.005 148)", fontSize: 12 }} />
                  <Bar dataKey="avg" fill={CHART_MUTED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Session frequency */}
          <ChartCard title="Sessions per week (last 8 weeks)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionFreq} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "oklch(0.14 0.013 148)", border: "1px solid oklch(0.24 0.015 148)", borderRadius: 8, color: "oklch(0.95 0.005 148)", fontSize: 12 }} />
                <Bar dataKey="count" fill={CHART_GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Weakness recurrence */}
        {weaknesses.length > 0 && (
          <ChartCard title="Weakness recurrence">
            <div className="space-y-2">
              {weaknesses.slice(0, 8).map((w) => (
                <div key={w.label} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-ink text-xs truncate">{w.label}</span>
                      <span className="text-ink-faint text-xs ml-2 flex-shrink-0">{w.count}×</span>
                    </div>
                    <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                      <div className="h-1 bg-[oklch(0.60_0.18_22)] rounded-full" style={{ width: `${Math.min(100, (w.count / (weaknesses[0]?.count ?? w.count)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-ink-faint text-xs capitalize flex-shrink-0 w-20 text-right">{w.dimension?.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </main>
    </div>
  )
}
