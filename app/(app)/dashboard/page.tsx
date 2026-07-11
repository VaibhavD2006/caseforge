import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import {
  interviewSessions,
  scorecards,
  weaknessTags,
  progressSnapshots,
  goals,
  users,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { computeReadinessLevel, computeTier } from "@/lib/utils/readiness"
import { getRecommendedDrills } from "@/lib/db/queries/drills"
import { getProfileByUserId } from "@/lib/db/queries/profile"
import DashboardClient from "./dashboard-client"

async function getDashboardData(userId: string) {
  const [sessions, userScorecards, userWeaknesses, snapshots, userGoals, userData] =
    await Promise.all([
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
        .limit(8),
      db
        .select()
        .from(progressSnapshots)
        .where(eq(progressSnapshots.userId, userId))
        .orderBy(desc(progressSnapshots.createdAt))
        .limit(10),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1),
    ])

  const evaluatedSessions = userScorecards.length
  const avgScore =
    evaluatedSessions > 0
      ? userScorecards.reduce((sum, s) => sum + Number(s.overallScore ?? 0), 0) / evaluatedSessions
      : 0

  // Compute dimension averages across all scorecards
  const dimensionSums: Record<string, number> = {}
  const dimensionCounts: Record<string, number> = {}
  for (const sc of userScorecards) {
    const dims = sc.dimensionScores as Record<string, { score: number }> | null
    if (!dims) continue
    for (const [dim, data] of Object.entries(dims)) {
      dimensionSums[dim] = (dimensionSums[dim] ?? 0) + data.score
      dimensionCounts[dim] = (dimensionCounts[dim] ?? 0) + 1
    }
  }
  const avgDimensionScores = Object.fromEntries(
    Object.keys(dimensionSums).map((d) => [
      d,
      Math.round(((dimensionSums[d] ?? 0) / (dimensionCounts[d] ?? 1)) * 10) / 10,
    ])
  )

  // Scorecard lookup for recent sessions
  const scorecardMap = new Map(userScorecards.map((c) => [c.sessionId, c]))

  // Latest recruiter summary
  const latestRecruiterSummary =
    userScorecards.find((c) => c.recruiterSummary)?.recruiterSummary ?? null

  // Trend data: last 10 evaluated sessions
  const trendData = userScorecards.slice(0, 10).reverse().map((c, i) => ({
    label: `#${i + 1}`,
    score: Number(c.overallScore ?? 0),
  }))

  const recommendedDrills = await getRecommendedDrills(userId, 3)

  const profile = await getProfileByUserId(userId)
  const targetFirms = (profile?.targetFirms as string[]) ?? []

  return {
    sessions,
    scorecardMap,
    weaknesses: userWeaknesses,
    avgScore,
    evaluatedSessions,
    avgDimensionScores,
    readinessLevel: computeReadinessLevel(evaluatedSessions, avgScore),
    tier: computeTier(avgScore),
    latestRecruiterSummary,
    trendData,
    goals: userGoals,
    recommendedDrills,
    userName: userData[0]?.name ?? null,
    targetFirms,
  }
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.id
  if (!userId) redirect("/sign-in")

  const data = await getDashboardData(userId)

  return (
    <DashboardClient
      userName={data.userName}
      sessions={data.sessions.map((s) => ({
        id: s.id,
        firmStyle: s.firmStyle,
        interviewType: s.interviewType,
        status: s.status,
        createdAt: s.createdAt,
        score: Number(data.scorecardMap.get(s.id)?.overallScore ?? null) || null,
      }))}
      weaknesses={data.weaknesses.map((w) => ({
        id: w.id,
        tagLabel: w.tagLabel,
        dimension: w.dimension,
        occurrenceCount: w.occurrenceCount,
        isPersistent: w.isPersistent,
      }))}
      avgScore={data.avgScore}
      evaluatedSessions={data.evaluatedSessions}
      avgDimensionScores={data.avgDimensionScores}
      readinessLevel={data.readinessLevel}
      tier={data.tier}
      latestRecruiterSummary={data.latestRecruiterSummary}
      trendData={data.trendData}
      goals={data.goals.map((g) => ({
        id: g.id,
        title: g.title,
        goalType: g.goalType,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        targetDate: g.targetDate,
        status: g.status,
      }))}
      recommendedDrills={data.recommendedDrills.map((d) => ({
        id: d.id,
        title: d.title,
        skillFocus: d.skillFocus,
        difficulty: d.difficulty,
        estimatedMinutes: d.estimatedMinutes,
      }))}
      targetFirms={data.targetFirms}
    />
  )
}
