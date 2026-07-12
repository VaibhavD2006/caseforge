import { notFound } from "next/navigation"
import { getDrillById, getUserDrillAttempts } from "@/lib/db/queries/drills"
import { requireAuth } from "@/lib/auth/session"
import DrillAttemptClient from "./drill-attempt-client"

export default async function DrillPage({ params }: { params: Promise<{ drillId: string }> }) {
  const { drillId } = await params
  const session = await requireAuth()
  const [drill, pastAttempts] = await Promise.all([
    getDrillById(drillId),
    getUserDrillAttempts(session.user.id!, drillId),
  ])
  if (!drill) notFound()

  return (
    <DrillAttemptClient
      drill={{
        id: drill.id,
        title: drill.title,
        prompt: drill.prompt,
        skillFocus: drill.skillFocus,
        difficulty: drill.difficulty,
        estimatedMinutes: drill.estimatedMinutes,
        expectedTraits: drill.expectedTraits,
      }}
      pastAttempts={pastAttempts.slice(0, 3).map((a) => ({
        score: Number(a.score ?? 0),
        feedback: a.feedback ?? "",
        improvementNote: a.improvementNote ?? "",
        completedAt: a.completedAt,
      }))}
    />
  )
}
