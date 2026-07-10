import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { interviewSessions, scorecards, weaknessTags } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { computeReadinessLevel, computeTier } from "@/lib/utils/readiness"
import DashboardClient from "./dashboard-client"

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
      .limit(8),
  ])

  const evaluatedSessions = userScorecards.length
  const avgScore =
    evaluatedSessions > 0
      ? userScorecards.reduce(
          (sum, s) => sum + Number(s.overallScore ?? 0),
          0
        ) / evaluatedSessions
      : 0

  return {
    sessions,
    scorecards: userScorecards,
    weaknesses: userWeaknesses,
    avgScore,
    evaluatedSessions,
    readinessLevel: computeReadinessLevel(evaluatedSessions, avgScore),
    tier: computeTier(avgScore),
  }
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.id

  if (!userId) redirect("/sign-in")

  const data = await getDashboardData(userId)

  return (
    <DashboardClient
      sessions={data.sessions.map((s) => ({
        id: s.id,
        firmStyle: s.firmStyle,
        interviewType: s.interviewType,
        status: s.status,
        createdAt: s.createdAt,
        durationSeconds: s.durationSeconds,
        turnCount: s.turnCount,
      }))}
      scorecards={data.scorecards.map((c) => ({
        sessionId: c.sessionId!,
        overallScore: c.overallScore,
        dimensionScores: c.dimensionScores as Record<string, number> | null,
        topStrengths: c.topStrengths,
        topWeaknesses: c.topWeaknesses,
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
      readinessLevel={data.readinessLevel}
      tier={data.tier}
    />
  )
}
