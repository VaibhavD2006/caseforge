import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { createSession, createTranscript } from "@/lib/db/queries/sessions"
import {
  getInterviewerSystemPrompt,
  selectCase,
  streamInterviewerOpening,
} from "@/lib/ai/interview"
import { firmStyleEnum, interviewTypeEnum } from "@/lib/db/schema"
import { FIRM_CONFIGS, type FirmId, normalizeFirmId } from "@/config/firms/firm-styles"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    firmId = "mckinsey",
    interviewType = "case",
    templateId,
  } = body as {
    firmId?: FirmId
    interviewType: (typeof interviewTypeEnum.enumValues)[number]
    templateId?: string
  }

  const normalizedFirmId = normalizeFirmId(firmId)
  if (!normalizedFirmId) {
    return NextResponse.json({ error: `Invalid firmId: ${firmId}` }, { status: 400 })
  }

  const firmConfig = FIRM_CONFIGS[normalizedFirmId]
  const firmStyle = firmConfig.firmFamily

  // Select a case (null for behavioral, case_math, pressure_round)
  const selectedCase = await selectCase(firmStyle, interviewType)

  // Build system prompt with firm-specific modifier
  const caseContext = selectedCase?.contextText
  const systemPrompt = await getInterviewerSystemPrompt(normalizedFirmId, interviewType, caseContext)

  // Stream Gemini BEFORE writing to DB so a quota failure never leaves an orphaned session
  let openingMessage = ""
  try {
    for await (const chunk of streamInterviewerOpening(systemPrompt)) {
      openingMessage += chunk
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }
    throw err
  }

  // AI succeeded — now persist
  const interviewSession = await createSession({
    userId: session.user.id,
    templateId: templateId ?? undefined,
    caseId: selectedCase?.id ?? undefined,
    firmStyle,
    firmId: normalizedFirmId,
    interviewType,
  })

  await createTranscript(interviewSession.id, {
    role: "interviewer",
    content: openingMessage,
  })

  return NextResponse.json({
    sessionId: interviewSession.id,
    firmId: normalizedFirmId,
    firmStyle,
    interviewType,
    caseTitle: selectedCase?.title ?? null,
    openingMessage,
    systemPromptRef: `interviewer_${normalizedFirmId}_${interviewType}_v1`,
  })
}
