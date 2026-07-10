"use client"

import { useState } from "react"
import Link from "next/link"

const DIMENSION_LABELS: Record<string, string> = {
  structure: "Structure",
  hypothesis: "Hypothesis",
  quantitative: "Quantitative",
  business_judgment: "Business Judgment",
  synthesis: "Synthesis",
  communication: "Communication",
  confidence: "Confidence",
}

const TIER_COLORS: Record<string, string> = {
  bronze: "text-[oklch(0.68_0.12_55)]",
  silver: "text-[oklch(0.78_0.01_258)]",
  gold: "text-[oklch(0.80_0.14_78)]",
  emerald: "text-[oklch(0.62_0.15_158)]",
}

const TIER_BAR_COLORS: Record<string, string> = {
  bronze: "bg-[oklch(0.68_0.12_55)]",
  silver: "bg-[oklch(0.78_0.01_258)]",
  gold: "bg-[oklch(0.80_0.14_78)]",
  emerald: "bg-[oklch(0.62_0.15_158)]",
}

const READINESS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  developing: "Developing",
  approaching_ready: "Approaching Ready",
  interview_ready: "Interview Ready",
}

const READINESS_PROGRESS: Record<string, number> = {
  not_started: 0,
  developing: 33,
  approaching_ready: 66,
  interview_ready: 100,
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
  evaluation_pending: "Pending review",
  evaluated: "Reviewed",
}

const FIRM_LABELS: Record<string, string> = {
  mbb: "MBB",
  big4: "Big Four",
  boutique: "Boutique",
  generic: "Generic",
}

const TYPE_LABELS: Record<string, string> = {
  case: "Case",
  market_sizing: "Market sizing",
  behavioral: "Behavioral",
  drill: "Drill",
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

type Session = {
  id: string
  firmStyle: string
  interviewType: string
  status: string
  createdAt: Date
  durationSeconds: number | null
  turnCount: number
}

type Scorecard = {
  sessionId: string
  overallScore: string | null
  dimensionScores: Record<string, number> | null
  topStrengths: string[] | null
  topWeaknesses: string[] | null
}

type WeaknessTag = {
  id: string
  tagLabel: string
  dimension: string
  occurrenceCount: number
  isPersistent: boolean
}

type DashboardClientProps = {
  sessions: Session[]
  scorecards: Scorecard[]
  weaknesses: WeaknessTag[]
  avgScore: number
  evaluatedSessions: number
  readinessLevel: string
  tier: string
}

export default function DashboardClient({
  sessions,
  scorecards,
  weaknesses,
  avgScore,
  evaluatedSessions,
  readinessLevel,
  tier,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"sessions" | "analytics">(
    "sessions"
  )

  const isEmpty = sessions.length === 0
  const scorecardMap = new Map(scorecards.map((s) => [s.sessionId, s]))

  // Compute per-dimension averages
  const dimensionTotals: Record<string, { sum: number; count: number }> = {}
  for (const card of scorecards) {
    if (!card.dimensionScores) continue
    for (const [dim, score] of Object.entries(card.dimensionScores)) {
      if (!dimensionTotals[dim]) dimensionTotals[dim] = { sum: 0, count: 0 }
      dimensionTotals[dim].sum += score
      dimensionTotals[dim].count += 1
    }
  }
  const dimensionAvgs = Object.entries(dimensionTotals).map(([dim, v]) => ({
    dim,
    avg: v.sum / v.count,
  })).sort((a, b) => a.avg - b.avg)

  // Score trend (last 8 evaluated sessions)
  const scoreTrend = scorecards
    .slice(-8)
    .map((s) => Number(s.overallScore ?? 0))
    .filter((s) => s > 0)

  const maxTrend = Math.max(...scoreTrend, 10)

  return (
    <div className="min-h-screen bg-[oklch(0.11_0.012_258)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[oklch(0.93_0.005_258)] text-xl font-semibold">
              Dashboard
            </h1>
            {!isEmpty && (
              <p className="text-[oklch(0.40_0.008_258)] text-sm mt-0.5">
                {evaluatedSessions} session{evaluatedSessions !== 1 ? "s" : ""}{" "}
                evaluated
              </p>
            )}
          </div>
          <Link
            href="/interview/new"
            className="px-4 py-2 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150"
          >
            New mock
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[oklch(0.20_0.012_258)]">
          {(["sessions", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "border-[oklch(0.62_0.19_258)] text-[oklch(0.93_0.005_258)]"
                  : "border-transparent text-[oklch(0.45_0.008_258)] hover:text-[oklch(0.70_0.005_258)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <>
            {isEmpty ? (
              <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-12 text-center">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.20_0.015_258)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-[oklch(0.62_0.19_258)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-1">No sessions yet</p>
                <p className="text-[oklch(0.40_0.008_258)] text-xs mb-6">
                  Complete your first mock interview to see scores and progress.
                </p>
                <Link href="/interview/new" className="inline-flex px-5 py-2.5 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150">
                  Start your first mock
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => {
                  const card = scorecardMap.get(s.id)
                  const isEvaluated = s.status === "evaluated" && card
                  return (
                    <div key={s.id} className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[oklch(0.93_0.005_258)] text-sm font-medium">
                              {FIRM_LABELS[s.firmStyle] ?? s.firmStyle}
                            </span>
                            <span className="text-[oklch(0.40_0.008_258)] text-xs">
                              {TYPE_LABELS[s.interviewType] ?? s.interviewType}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              s.status === "evaluated"
                                ? "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.04_158)]"
                                : s.status === "evaluation_pending"
                                  ? "text-[oklch(0.72_0.15_78)] bg-[oklch(0.18_0.05_78)]"
                                  : "text-[oklch(0.40_0.008_258)] bg-[oklch(0.20_0.010_258)]"
                            }`}>
                              {STATUS_LABELS[s.status] ?? s.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[oklch(0.40_0.008_258)] text-xs">{formatDate(s.createdAt)}</span>
                            {s.durationSeconds && (
                              <span className="text-[oklch(0.40_0.008_258)] text-xs">{formatDuration(s.durationSeconds)}</span>
                            )}
                            <span className="text-[oklch(0.40_0.008_258)] text-xs">{s.turnCount} turns</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          {isEvaluated && card?.overallScore && (
                            <span className="text-[oklch(0.93_0.005_258)] text-sm font-semibold tabular-nums">
                              {Number(card.overallScore).toFixed(1)}
                            </span>
                          )}
                          {isEvaluated && (
                            <Link href={`/feedback/${s.id}`} className="text-[oklch(0.62_0.19_258)] text-xs hover:text-[oklch(0.67_0.19_258)] transition-colors">
                              View feedback
                            </Link>
                          )}
                          {s.status === "evaluation_pending" && (
                            <Link href={`/feedback/${s.id}`} className="text-[oklch(0.72_0.15_78)] text-xs hover:underline">
                              Check status
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {evaluatedSessions === 0 ? (
              <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-8 text-center">
                <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-1">No analytics yet</p>
                <p className="text-[oklch(0.40_0.008_258)] text-xs mb-4">
                  Complete and evaluate a mock interview to see your performance data.
                </p>
                <Link href="/interview/new" className="inline-flex px-4 py-2 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors">
                  Start a mock
                </Link>
              </div>
            ) : (
              <>
                {/* Score + Tier + Readiness row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                    <div className="text-[oklch(0.93_0.005_258)] text-2xl font-bold tabular-nums">
                      {avgScore.toFixed(1)}
                    </div>
                    <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">Avg score</div>
                    <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">/ 10</div>
                  </div>
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                    <div className={`text-2xl font-bold capitalize ${TIER_COLORS[tier] ?? "text-[oklch(0.93_0.005_258)]"}`}>
                      {tier}
                    </div>
                    <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">Tier</div>
                  </div>
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                    <div className="text-[oklch(0.93_0.005_258)] text-2xl font-bold tabular-nums">
                      {evaluatedSessions}
                    </div>
                    <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">Evaluated</div>
                  </div>
                </div>

                {/* Readiness progress */}
                <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[oklch(0.93_0.005_258)] text-sm font-medium">Readiness</span>
                    <span className="text-[oklch(0.62_0.19_258)] text-sm font-medium">
                      {READINESS_LABELS[readinessLevel]}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[oklch(0.22_0.012_258)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[oklch(0.62_0.19_258)] transition-all duration-500"
                      style={{ width: `${READINESS_PROGRESS[readinessLevel] ?? 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Not started", "Developing", "Approaching", "Ready"].map((label) => (
                      <span key={label} className="text-[oklch(0.35_0.008_258)] text-xs">{label}</span>
                    ))}
                  </div>
                </div>

                {/* Score trend */}
                {scoreTrend.length >= 2 && (
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
                    <h3 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-4">Score trend</h3>
                    <div className="flex items-end gap-1.5 h-20">
                      {scoreTrend.map((score, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[oklch(0.40_0.008_258)] text-[10px] tabular-nums">
                            {score.toFixed(1)}
                          </span>
                          <div
                            className={`w-full rounded-t ${TIER_BAR_COLORS[tier] ?? "bg-[oklch(0.62_0.19_258)]"} opacity-80`}
                            style={{ height: `${(score / maxTrend) * 56}px`, minHeight: "4px" }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-[oklch(0.35_0.008_258)] text-xs">Last {scoreTrend.length} sessions</span>
                    </div>
                  </div>
                )}

                {/* Dimension breakdown */}
                {dimensionAvgs.length > 0 && (
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
                    <h3 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-4">Dimension breakdown</h3>
                    <div className="space-y-3">
                      {dimensionAvgs.map(({ dim, avg }) => (
                        <div key={dim}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[oklch(0.62_0.010_258)] text-xs">
                              {DIMENSION_LABELS[dim] ?? dim}
                            </span>
                            <span className="text-[oklch(0.93_0.005_258)] text-xs font-medium tabular-nums">
                              {avg.toFixed(1)}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[oklch(0.22_0.012_258)] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                avg >= 7.5
                                  ? "bg-[oklch(0.62_0.15_158)]"
                                  : avg >= 5.0
                                    ? "bg-[oklch(0.62_0.19_258)]"
                                    : "bg-[oklch(0.60_0.18_22)]"
                              }`}
                              style={{ width: `${(avg / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weakness patterns */}
                {weaknesses.length > 0 && (
                  <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
                    <h3 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">Recurring weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map((w) => (
                        <span
                          key={w.id}
                          className={`px-2.5 py-1 rounded-md text-xs border ${
                            w.isPersistent
                              ? "border-[oklch(0.35_0.10_22)] bg-[oklch(0.14_0.04_22)] text-[oklch(0.75_0.12_22)]"
                              : "border-[oklch(0.25_0.015_258)] bg-[oklch(0.18_0.010_258)] text-[oklch(0.62_0.010_258)]"
                          }`}
                        >
                          {w.tagLabel}
                          {w.occurrenceCount > 1 && (
                            <span className="ml-1 opacity-60">×{w.occurrenceCount}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
