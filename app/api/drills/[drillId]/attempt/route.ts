import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { getDrillById, createDrillAttempt } from "@/lib/db/queries/drills"
import { evaluateDrillAttempt } from "@/lib/ai/drills"

export async function POST(req: NextRequest, { params }: { params: Promise<{ drillId: string }> }) {
  const session = await requireAuth()
  const { drillId } = await params
  const { response } = await req.json()

  if (!response?.trim()) {
    return NextResponse.json({ error: "Response is required" }, { status: 400 })
  }

  const drill = await getDrillById(drillId)
  if (!drill) return NextResponse.json({ error: "Drill not found" }, { status: 404 })

  const evaluation = await evaluateDrillAttempt(drill, response)

  await createDrillAttempt({
    drillId,
    userId: session.user.id!,
    response,
    score: evaluation.score,
    feedback: evaluation.feedback,
    improvementNote: evaluation.improvementNote,
  })

  return NextResponse.json(evaluation)
}
