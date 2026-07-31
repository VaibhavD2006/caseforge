import { db } from "@/lib/db"
import { users, interviewSessions, scorecards, configSettings } from "@/lib/db/schema"
import { eq, sql, desc, and, gte } from "drizzle-orm"
import { formatCostDollars } from "@/lib/ai/cost"

export async function getAdminOverviewStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000)

  const [totalUsers, activeSessions, allSessions, recentSessions] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(distinct ${interviewSessions.userId})` })
      .from(interviewSessions)
      .where(gte(interviewSessions.startedAt, thirtyDaysAgo)),
    db.select({
      total: sql<number>`count(*)`,
      evaluated: sql<number>`count(case when ${interviewSessions.status} = 'evaluated' then 1 end)`,
      totalCostCents: sql<number>`coalesce(sum(${interviewSessions.aiCostEstimateCents}::float), 0)`,
    }).from(interviewSessions),
    db.select({ count: sql<number>`count(*)` })
      .from(interviewSessions)
      .where(gte(interviewSessions.startedAt, sevenDaysAgo)),
  ])

  const avgScoreRow = await db.select({
    avg: sql<number>`avg(${scorecards.overallScore}::float)`,
  }).from(scorecards)

  return {
    totalUsers: Number(totalUsers[0]?.count ?? 0),
    activeUsers30d: Number(activeSessions[0]?.count ?? 0),
    totalSessions: Number(allSessions[0]?.total ?? 0),
    evaluatedSessions: Number(allSessions[0]?.evaluated ?? 0),
    sessions7d: Number(recentSessions[0]?.count ?? 0),
    totalCostCents: Number(allSessions[0]?.totalCostCents ?? 0),
    totalCostFormatted: formatCostDollars(Number(allSessions[0]?.totalCostCents ?? 0)),
    avgScore: avgScoreRow[0]?.avg ? Number(avgScoreRow[0].avg).toFixed(2) : null,
  }
}

export async function getAdminUserTable(limit = 50) {
  const rows = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.organization,
      u.email_verified,
      COUNT(i.id)::int                                          AS session_count,
      COUNT(CASE WHEN i.status = 'evaluated' THEN 1 END)::int  AS evaluated_count,
      ROUND(AVG(s.overall_score::float)::numeric, 2)           AS avg_score,
      COALESCE(SUM(i.ai_cost_estimate_cents::float), 0)        AS cost_cents,
      MAX(i.started_at)                                        AS last_active
    FROM users u
    LEFT JOIN interview_sessions i ON i.user_id = u.id
    LEFT JOIN scorecards s ON s.session_id = i.id AND s.user_id = u.id
    GROUP BY u.id, u.name, u.email, u.role, u.organization, u.email_verified
    ORDER BY session_count DESC
    LIMIT ${limit}
  `)

  return (rows as unknown as Array<{
    id: string
    name: string | null
    email: string | null
    role: string
    organization: string | null
    email_verified: Date | null
    session_count: number
    evaluated_count: number
    avg_score: string | null
    cost_cents: number
    last_active: Date | null
  }>).map((r) => ({
    ...r,
    costFormatted: formatCostDollars(Number(r.cost_cents)),
    lastActiveFormatted: r.last_active
      ? new Date(r.last_active).toLocaleDateString()
      : "Never",
  }))
}

export async function getConfigSettings() {
  return db.select().from(configSettings).orderBy(configSettings.key)
}

export async function upsertConfigSetting(key: string, valueJson: unknown, description?: string) {
  await db
    .insert(configSettings)
    .values({ key, valueJson, description, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: configSettings.key,
      set: { valueJson, updatedAt: new Date() },
    })
}

export async function setUserRole(userId: string, role: "student" | "admin" | "super_admin") {
  await db.update(users).set({ role }).where(eq(users.id, userId))
}
