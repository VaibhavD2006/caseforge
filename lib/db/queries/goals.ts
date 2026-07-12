import { db } from "@/lib/db"
import { goals, scorecards, interviewSessions, drillAttempts } from "@/lib/db/schema"
import { eq, and, desc, count } from "drizzle-orm"
import type { Goal } from "@/lib/db/schema"

export async function getUserGoals(userId: string): Promise<Goal[]> {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.status, "active")))
    .orderBy(desc(goals.createdAt))
}

export async function createGoal(data: {
  userId: string
  title: string
  goalType: Goal["goalType"]
  targetValue?: number
  dimension?: Goal["dimension"]
  firmStyle?: Goal["firmStyle"]
  targetDate?: string
}) {
  const [goal] = await db
    .insert(goals)
    .values({
      userId: data.userId,
      title: data.title,
      goalType: data.goalType,
      targetValue: data.targetValue?.toFixed(2),
      dimension: data.dimension,
      firmStyle: data.firmStyle,
      targetDate: data.targetDate,
    })
    .returning()
  return goal
}

export async function updateGoal(id: string, userId: string, data: Partial<{
  title: string
  status: Goal["status"]
  targetValue: number
  targetDate: string
}>) {
  const payload: Record<string, unknown> = { ...data, updatedAt: new Date() }
  if (typeof payload.targetValue === "number") payload.targetValue = (payload.targetValue as number).toFixed(2)
  const [updated] = await db
    .update(goals)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set(payload as any)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning()
  return updated
}

export async function deleteGoal(id: string, userId: string) {
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)))
}

// Recompute goal currentValue from live data and update the record
export async function recomputeGoalProgress(goalId: string, userId: string) {
  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1)
  if (!goal) return

  let currentValue = 0

  if (goal.goalType === "session_count") {
    const rows = await db.select({ value: count() }).from(interviewSessions).where(eq(interviewSessions.userId, userId))
    currentValue = rows[0]?.value ?? 0
  } else if (goal.goalType === "score_target" || goal.goalType === "dimension_target") {
    const allScorecards = await db
      .select()
      .from(scorecards)
      .where(eq(scorecards.userId, userId))

    if (goal.goalType === "score_target") {
      const avg =
        allScorecards.length > 0
          ? allScorecards.reduce((s, c) => s + Number(c.overallScore ?? 0), 0) / allScorecards.length
          : 0
      currentValue = avg
    } else if (goal.dimension) {
      const dim = goal.dimension
      const scores = allScorecards
        .map((c) => {
          const ds = c.dimensionScores as Record<string, { score: number }> | null
          return ds?.[dim]?.score
        })
        .filter((s): s is number => s !== undefined)
      currentValue = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    }
  } else if (goal.goalType === "drill_count") {
    const rows = await db.select({ value: count() }).from(drillAttempts).where(eq(drillAttempts.userId, userId))
    currentValue = rows[0]?.value ?? 0
  }

  await db
    .update(goals)
    .set({ currentValue: currentValue.toFixed(2), updatedAt: new Date() })
    .where(eq(goals.id, goalId))

  return currentValue
}
