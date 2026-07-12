import { db } from "@/lib/db"
import { drills, drillAttempts, weaknessTags } from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import type { Drill } from "@/lib/db/schema"

export async function getActiveDrills(filters?: {
  skillFocus?: string
  difficulty?: string
}) {
  let query = db.select().from(drills).where(eq(drills.isActive, true)).$dynamic()

  if (filters?.skillFocus) {
    query = query.where(
      and(eq(drills.isActive, true), sql`${drills.skillFocus} = ${filters.skillFocus}`)
    )
  }
  if (filters?.difficulty) {
    query = query.where(
      and(eq(drills.isActive, true), sql`${drills.difficulty} = ${filters.difficulty}`)
    )
  }

  return db.select().from(drills).where(eq(drills.isActive, true)).orderBy(drills.skillFocus)
}

export async function getDrillById(id: string): Promise<Drill | undefined> {
  const [drill] = await db.select().from(drills).where(eq(drills.id, id)).limit(1)
  return drill
}

export async function createDrillAttempt(data: {
  drillId: string
  userId: string
  response: string
  score?: number
  feedback?: string
  improvementNote?: string
}) {
  const [attempt] = await db
    .insert(drillAttempts)
    .values({
      drillId: data.drillId,
      userId: data.userId,
      response: data.response,
      score: data.score?.toFixed(2),
      feedback: data.feedback,
      improvementNote: data.improvementNote,
    })
    .returning()

  await db
    .update(drills)
    .set({ timesAttempted: sql`${drills.timesAttempted} + 1` })
    .where(eq(drills.id, data.drillId))

  return attempt
}

export async function getUserDrillAttempts(userId: string, drillId?: string) {
  if (drillId) {
    return db
      .select()
      .from(drillAttempts)
      .where(and(eq(drillAttempts.userId, userId), eq(drillAttempts.drillId, drillId)))
      .orderBy(desc(drillAttempts.completedAt))
  }
  return db
    .select()
    .from(drillAttempts)
    .where(eq(drillAttempts.userId, userId))
    .orderBy(desc(drillAttempts.completedAt))
}

export async function getRecommendedDrills(userId: string, limit = 3) {
  // Get top weakness tag dimensions for user
  const userWeaknesses = await db
    .select({ dimension: weaknessTags.dimension })
    .from(weaknessTags)
    .where(eq(weaknessTags.userId, userId))
    .orderBy(desc(weaknessTags.occurrenceCount))
    .limit(3)

  if (userWeaknesses.length === 0) {
    return db.select().from(drills).where(eq(drills.isActive, true)).limit(limit)
  }

  const dimensions = userWeaknesses.map((w) => w.dimension)
  return db
    .select()
    .from(drills)
    .where(
      and(
        eq(drills.isActive, true),
        sql`${drills.skillFocus} = ANY(${dimensions})`
      )
    )
    .limit(limit)
}

export async function getUserAttemptCountPerDrill(userId: string) {
  const attempts = await db
    .select({ drillId: drillAttempts.drillId })
    .from(drillAttempts)
    .where(eq(drillAttempts.userId, userId))

  const counts: Record<string, number> = {}
  for (const a of attempts) {
    counts[a.drillId] = (counts[a.drillId] ?? 0) + 1
  }
  return counts
}
