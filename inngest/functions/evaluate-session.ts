import { inngest } from "@/inngest/client"
import { db } from "@/lib/db"
import {
  interviewSessions,
  transcripts,
  scorecards,
  weaknessTags,
  progressSnapshots,
  caseLibrary,
} from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { evaluateSession } from "@/lib/ai/evaluator"
import { computeReadinessLevel, computeTier } from "@/lib/utils/readiness"
import weaknessTaxonomy from "@/config/rubrics/weakness-taxonomy.json"

const tagMeta = Object.fromEntries(
  weaknessTaxonomy.tags.map((t) => [t.key, t])
)

export const evaluateSessionFn = inngest.createFunction(
  {
    id: "evaluate-session",
    triggers: [{ event: "interview/session.completed" }],
  },
  async ({ event, step }: { event: { data: { sessionId: string; userId: string } }; step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const { sessionId, userId } = event.data as { sessionId: string; userId: string }

    // 1. Load session and transcript
    const [session, transcript] = await step.run("load-session-data", async () => {
      const [s] = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.id, sessionId))
        .limit(1)

      const [t] = await db
        .select()
        .from(transcripts)
        .where(eq(transcripts.sessionId, sessionId))
        .limit(1)

      return [s, t] as const
    })

    if (!session || !transcript) {
      throw new Error(`Session or transcript not found: ${sessionId}`)
    }

    // 2. Load case context if available
    const caseContext = await step.run("load-case-context", async () => {
      if (!session.caseId) return undefined
      const [c] = await db
        .select()
        .from(caseLibrary)
        .where(eq(caseLibrary.id, session.caseId))
        .limit(1)
      return c?.contextText
    })

    // 3. Run evaluation
    const scorecardData = await step.run("run-evaluation", async () => {
      const turns = transcript.turns as Array<{ role: string; content: string }>
      return evaluateSession(turns, caseContext)
    })

    // 4. Persist scorecard
    await step.run("persist-scorecard", async () => {
      await db.insert(scorecards).values({
        sessionId,
        userId,
        overallScore: scorecardData.overallScore.toFixed(2),
        dimensionScores: scorecardData.dimensionScores,
        topStrengths: scorecardData.topStrengths,
        topWeaknesses: scorecardData.topWeaknesses,
        strengthTagKeys: scorecardData.strengthTagKeys,
        weaknessTagKeys: scorecardData.weaknessTagKeys,
        nextActions: scorecardData.nextActions,
        evaluatorModel: scorecardData.evaluatorModel,
        evaluatorPromptVersion: scorecardData.evaluatorPromptVersion,
        reliabilityFlag: scorecardData.reliabilityFlag,
      })

      await db
        .update(interviewSessions)
        .set({ status: "evaluated" })
        .where(eq(interviewSessions.id, sessionId))
    })

    // 5. Update weakness tags
    await step.run("update-weakness-tags", async () => {
      for (const tagKey of scorecardData.weaknessTagKeys) {
        const meta = tagMeta[tagKey]
        if (!meta) continue

        // Upsert weakness tag
        const [existing] = await db
          .select()
          .from(weaknessTags)
          .where(
            sql`${weaknessTags.userId} = ${userId} AND ${weaknessTags.tagKey} = ${tagKey}`
          )
          .limit(1)

        if (existing) {
          const newCount = existing.occurrenceCount + 1
          await db
            .update(weaknessTags)
            .set({
              occurrenceCount: newCount,
              isPersistent: newCount >= 3,
              lastSeenAt: new Date(),
              sessionIds: sql`array_append(${weaknessTags.sessionIds}, ${sessionId}::uuid)`,
              updatedAt: new Date(),
            })
            .where(eq(weaknessTags.id, existing.id))
        } else {
          await db.insert(weaknessTags).values({
            userId,
            tagKey,
            tagLabel: meta.label,
            dimension: meta.dimension as "structure" | "hypothesis" | "quantitative" | "business_judgment" | "synthesis" | "communication" | "confidence",
            occurrenceCount: 1,
            isPersistent: false,
            sessionIds: [sessionId],
          })
        }
      }
    })

    // 6. Generate progress snapshot
    await step.run("generate-progress-snapshot", async () => {
      const allScorecards = await db
        .select()
        .from(scorecards)
        .where(eq(scorecards.userId, userId))

      const sessionCount = allScorecards.length
      const avgOverallScore =
        sessionCount > 0
          ? allScorecards.reduce((sum, s) => sum + Number(s.overallScore ?? 0), 0) / sessionCount
          : 0

      // Compute dimension averages
      const dimensionSums: Record<string, number> = {}
      const dimensionCounts: Record<string, number> = {}

      for (const sc of allScorecards) {
        const dims = sc.dimensionScores as Record<string, { score: number }> | null
        if (!dims) continue
        for (const [dim, data] of Object.entries(dims)) {
          dimensionSums[dim] = (dimensionSums[dim] ?? 0) + data.score
          dimensionCounts[dim] = (dimensionCounts[dim] ?? 0) + 1
        }
      }

      const dimensionAvgScores = Object.fromEntries(
        Object.keys(dimensionSums).map((dim) => [
          dim,
          Math.round(((dimensionSums[dim] ?? 0) / (dimensionCounts[dim] ?? 1)) * 100) / 100,
        ])
      )

      const readinessLevel = computeReadinessLevel(sessionCount, avgOverallScore)
      const tier = computeTier(avgOverallScore)

      const persistentTags = await db
        .select()
        .from(weaknessTags)
        .where(sql`${weaknessTags.userId} = ${userId} AND ${weaknessTags.isPersistent} = true`)

      await db.insert(progressSnapshots).values({
        userId,
        snapshotDate: new Date().toISOString().split("T")[0]!,
        triggerSessionId: sessionId,
        sessionCount,
        avgOverallScore: avgOverallScore.toFixed(2),
        dimensionAvgScores,
        readinessLevel,
        tier,
        persistentWeaknessTagKeys: persistentTags.map((t) => t.tagKey),
      })
    })

    return { sessionId, status: "evaluated" }
  }
)
