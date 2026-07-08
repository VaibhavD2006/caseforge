import { redirect } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import {
  interviewSessions,
  scorecards,
  weaknessTags,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { computeReadinessLevel, computeTier } from "@/lib/utils/readiness"

async function getDashboardData(userId: string) {
  const [sessions, userScorecards, userWeaknesses] = await Promise.all([
    db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.userId, userId))
      .orderBy(desc(interviewSessions.createdAt))
      .limit(20),
    db
      .select()
      .from(scorecards)
      .where(eq(scorecards.userId, userId))
      .orderBy(desc(scorecards.createdAt)),
    db
      .select()
      .from(weaknessTags)
      .where(eq(weaknessTags.userId, userId))
      .orderBy(desc(weaknessTags.occurrenceCount))
      .limit(6),
  ])

  const evaluatedSessions = userScorecards.length
  const avgScore =
    evaluatedSessions > 0
      ? userScorecards.reduce((sum, s) => sum + Number(s.overallScore ?? 0), 0) /
        evaluatedSessions
      : 0

  const readinessLevel = computeReadinessLevel(evaluatedSessions, avgScore)
  const tier = computeTier(avgScore)

  const scorecardMap = new Map(userScorecards.map((s) => [s.sessionId, s]))

  return {
    sessions,
    avgScore,
    evaluatedSessions,
    readinessLevel,
    tier,
    scorecardMap,
    weaknesses: userWeaknesses,
  }
}

const READINESS_LABELS: Record<string, string> = {
  not_started: "Not started",
  developing: "Developing",
  approaching_ready: "Approaching ready",
  interview_ready: "Interview ready",
}

const TIER_COLORS: Record<string, string> = {
  bronze: "text-[oklch(0.68_0.12_55)]",
  silver: "text-[oklch(0.78_0.01_258)]",
  gold: "text-[oklch(0.80_0.14_78)]",
  emerald: "text-[oklch(0.62_0.15_158)]",
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

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.id

  if (!userId) redirect("/sign-in")

  const {
    sessions,
    avgScore,
    evaluatedSessions,
    readinessLevel,
    tier,
    scorecardMap,
    weaknesses,
  } = await getDashboardData(userId)

  const isEmpty = sessions.length === 0

  return (
    <div className="min-h-screen bg-[oklch(0.11_0.012_258)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            className="px-4 py-2 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150 cursor-pointer"
          >
            New mock
          </Link>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-12 text-center">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.20_0.015_258)] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-5 h-5 text-[oklch(0.62_0.19_258)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-1">
              No sessions yet
            </p>
            <p className="text-[oklch(0.40_0.008_258)] text-xs mb-6">
              Complete your first mock interview to see your scores and
              progress here.
            </p>
            <Link
              href="/interview/new"
              className="inline-flex px-5 py-2.5 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150 cursor-pointer"
            >
              Start your first mock
            </Link>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                <div className="text-[oklch(0.93_0.005_258)] text-2xl font-bold tabular-nums">
                  {evaluatedSessions > 0 ? avgScore.toFixed(1) : "—"}
                </div>
                <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">
                  Avg score
                </div>
              </div>
              <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                <div
                  className={`text-2xl font-bold capitalize ${TIER_COLORS[tier] ?? "text-[oklch(0.93_0.005_258)]"}`}
                >
                  {tier}
                </div>
                <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">
                  Tier
                </div>
              </div>
              <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 text-center">
                <div className="text-[oklch(0.93_0.005_258)] text-2xl font-bold tabular-nums">
                  {sessions.length}
                </div>
                <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">
                  Sessions
                </div>
              </div>
            </div>

            {/* Readiness */}
            <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[oklch(0.40_0.008_258)] text-xs mb-1">
                    Readiness level
                  </div>
                  <div className="text-[oklch(0.93_0.005_258)] text-sm font-medium">
                    {READINESS_LABELS[readinessLevel]}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[oklch(0.40_0.008_258)] text-xs mb-1">
                    Progress
                  </div>
                  <div className="text-[oklch(0.62_0.19_258)] text-sm font-medium">
                    {readinessLevel === "not_started" && "Start practicing"}
                    {readinessLevel === "developing" && "Keep going"}
                    {readinessLevel === "approaching_ready" && "Almost there"}
                    {readinessLevel === "interview_ready" && "You're ready"}
                  </div>
                </div>
              </div>
            </div>

            {/* Weakness tags */}
            {weaknesses.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
                  Recurring patterns
                </h2>
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
                        <span className="ml-1 opacity-60">
                          ×{w.occurrenceCount}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session history */}
            <h2 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Session history
            </h2>
            <div className="space-y-2">
              {sessions.map((s) => {
                const card = scorecardMap.get(s.id)
                const isEvaluated = s.status === "evaluated" && card
                return (
                  <div
                    key={s.id}
                    className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[oklch(0.93_0.005_258)] text-sm font-medium">
                            {FIRM_LABELS[s.firmStyle] ?? s.firmStyle}
                          </span>
                          <span className="text-[oklch(0.40_0.008_258)] text-xs">
                            {TYPE_LABELS[s.interviewType] ?? s.interviewType}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              s.status === "evaluated"
                                ? "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.04_158)]"
                                : s.status === "evaluation_pending"
                                  ? "text-[oklch(0.72_0.15_78)] bg-[oklch(0.18_0.05_78)]"
                                  : "text-[oklch(0.40_0.008_258)] bg-[oklch(0.20_0.010_258)]"
                            }`}
                          >
                            {STATUS_LABELS[s.status] ?? s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[oklch(0.40_0.008_258)] text-xs">
                            {formatDate(s.createdAt)}
                          </span>
                          {s.durationSeconds && (
                            <span className="text-[oklch(0.40_0.008_258)] text-xs">
                              {formatDuration(s.durationSeconds)}
                            </span>
                          )}
                          <span className="text-[oklch(0.40_0.008_258)] text-xs">
                            {s.turnCount} turns
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        {isEvaluated && card?.overallScore && (
                          <span className="text-[oklch(0.93_0.005_258)] text-sm font-semibold tabular-nums">
                            {Number(card.overallScore).toFixed(1)}
                          </span>
                        )}
                        {isEvaluated && (
                          <Link
                            href={`/feedback/${s.id}`}
                            className="text-[oklch(0.62_0.19_258)] text-xs hover:text-[oklch(0.67_0.19_258)] transition-colors cursor-pointer"
                          >
                            View feedback
                          </Link>
                        )}
                        {s.status === "evaluation_pending" && (
                          <Link
                            href={`/feedback/${s.id}`}
                            className="text-[oklch(0.72_0.15_78)] text-xs hover:underline cursor-pointer"
                          >
                            Check status
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
