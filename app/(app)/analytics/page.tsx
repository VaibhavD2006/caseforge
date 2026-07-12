import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { scorecards, interviewSessions, weaknessTags } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import AnalyticsClient from "./analytics-client"

export default async function AnalyticsPage() {
  const session = await requireAuth()
  const userId = session.user.id!

  const [allScorecards, allSessions, allWeaknesses] = await Promise.all([
    db.select().from(scorecards).where(eq(scorecards.userId, userId)).orderBy(desc(scorecards.createdAt)).limit(50),
    db.select().from(interviewSessions).where(eq(interviewSessions.userId, userId)).orderBy(desc(interviewSessions.createdAt)).limit(50),
    db.select().from(weaknessTags).where(eq(weaknessTags.userId, userId)).orderBy(desc(weaknessTags.occurrenceCount)).limit(12),
  ])

  // Score trend (last 20 evaluated sessions, chronological)
  const scoreTrend = allScorecards.slice(0, 20).reverse().map((c, i) => ({
    label: `#${i + 1}`,
    score: Number(c.overallScore ?? 0),
  }))

  // Dimension averages
  const dimSums: Record<string, number> = {}
  const dimCounts: Record<string, number> = {}
  for (const sc of allScorecards) {
    const dims = sc.dimensionScores as Record<string, { score: number }> | null
    if (!dims) continue
    for (const [d, v] of Object.entries(dims)) {
      dimSums[d] = (dimSums[d] ?? 0) + v.score
      dimCounts[d] = (dimCounts[d] ?? 0) + 1
    }
  }
  const avgDimensions = Object.fromEntries(
    Object.keys(dimSums).map((d) => [d, Math.round(((dimSums[d] ?? 0) / (dimCounts[d] ?? 1)) * 10) / 10])
  )

  // Mode performance
  const modeScores: Record<string, { sum: number; count: number }> = {}
  for (const sc of allScorecards) {
    const sess = allSessions.find((s) => s.id === sc.sessionId)
    const mode = sess?.interviewType ?? "unknown"
    if (!modeScores[mode]) modeScores[mode] = { sum: 0, count: 0 }
    modeScores[mode].sum += Number(sc.overallScore ?? 0)
    modeScores[mode].count++
  }
  const modeAvg = Object.entries(modeScores).map(([mode, v]) => ({
    mode,
    avg: Math.round((v.sum / v.count) * 10) / 10,
    count: v.count,
  }))

  // Session freq last 8 weeks
  const now = Date.now()
  const weekCounts: number[] = Array(8).fill(0)
  for (const s of allSessions) {
    const weeksAgo = Math.floor((now - new Date(s.createdAt).getTime()) / (7 * 86400000))
    if (weeksAgo >= 0 && weeksAgo < 8) weekCounts[weeksAgo] = (weekCounts[weeksAgo] ?? 0) + 1
  }
  const sessionFreq = weekCounts.reverse().map((count, i) => ({ label: `W-${7 - i}`, count }))

  return (
    <AnalyticsClient
      scoreTrend={scoreTrend}
      avgDimensions={avgDimensions}
      modeAvg={modeAvg}
      sessionFreq={sessionFreq}
      weaknesses={allWeaknesses.map((w) => ({ label: w.tagLabel, count: w.occurrenceCount, dimension: w.dimension }))}
      totalSessions={allSessions.length}
      evaluatedSessions={allScorecards.length}
    />
  )
}
