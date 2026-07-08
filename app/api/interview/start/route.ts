import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { createSession, createTranscript } from "@/lib/db/queries/sessions"
import {
  getInterviewerSystemPrompt,
  selectCase,
  streamInterviewerOpening,
} from "@/lib/ai/interview"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    firmStyle = "generic",
    interviewType = "case",
    templateId,
  } = body as {
    firmStyle: "mbb" | "big4" | "boutique" | "generic"
    interviewType: "case" | "market_sizing" | "behavioral" | "drill"
    templateId?: string
  }

  // Select a case (null for behavioral)
  const selectedCase = await selectCase(firmStyle, interviewType)

  // Build system prompt
  const caseContext = selectedCase?.contextText
  const systemPrompt = await getInterviewerSystemPrompt(firmStyle, interviewType, caseContext)

  // Create session record
  const interviewSession = await createSession({
    userId: session.user.id,
    templateId: templateId ?? undefined,
    caseId: selectedCase?.id ?? undefined,
    firmStyle,
    interviewType,
  })

  // Stream the opening interviewer message and collect it
  let openingMessage = ""
  for await (const chunk of streamInterviewerOpening(systemPrompt)) {
    openingMessage += chunk
  }

  // Persist initial transcript
  await createTranscript(interviewSession.id, {
    role: "interviewer",
    content: openingMessage,
  })

  return NextResponse.json({
    sessionId: interviewSession.id,
    firmStyle,
    interviewType,
    caseTitle: selectedCase?.title ?? null,
    openingMessage,
    systemPromptRef: `interviewer_${firmStyle}_${interviewType}_v1`,
  })
}
