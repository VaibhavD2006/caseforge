import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { completeSession } from "@/lib/db/queries/sessions"
import { db } from "@/lib/db"
import { interviewSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { inngest } from "@/inngest/client"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 })
  }

  // Verify ownership
  const [interviewSession] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1)

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await completeSession(sessionId)

  // Dispatch async evaluation job
  await inngest.send({
    name: "interview/session.completed",
    data: { sessionId, userId: session.user.id },
  })

  return NextResponse.json({ sessionId, status: "evaluation_pending" })
}
