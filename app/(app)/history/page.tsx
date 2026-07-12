import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { interviewSessions, scorecards } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import HistoryClient from "./history-client"

export default async function HistoryPage() {
  const session = await requireAuth()
  const userId = session.user.id!

  const [sessions, userScorecards] = await Promise.all([
    db.select().from(interviewSessions).where(eq(interviewSessions.userId, userId)).orderBy(desc(interviewSessions.createdAt)),
    db.select({ sessionId: scorecards.sessionId, overallScore: scorecards.overallScore }).from(scorecards).where(eq(scorecards.userId, userId)),
  ])

  const scoreMap = new Map(userScorecards.map((c) => [c.sessionId, Number(c.overallScore ?? 0)]))

  return (
    <HistoryClient
      sessions={sessions.map((s) => ({
        id: s.id,
        firmStyle: s.firmStyle,
        interviewType: s.interviewType,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        score: scoreMap.get(s.id) ?? null,
      }))}
    />
  )
}
