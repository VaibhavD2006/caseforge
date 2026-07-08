import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { interviewSessions, scorecards } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params

  const [interviewSession] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1)

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (interviewSession.status !== "evaluated") {
    return NextResponse.json({ status: interviewSession.status, scorecard: null })
  }

  const [scorecard] = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.sessionId, sessionId))
    .limit(1)

  return NextResponse.json({ status: "evaluated", scorecard: scorecard ?? null })
}
