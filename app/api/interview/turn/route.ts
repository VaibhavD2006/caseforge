import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSessionWithTranscript, appendTurn } from "@/lib/db/queries/sessions"
import {
  getInterviewerSystemPrompt,
  streamInterviewerResponse,
} from "@/lib/ai/interview"
import { buildDirectorState, buildDirectorBlock } from "@/lib/ai/interview-director"
import { FIRM_CONFIGS, type FirmId } from "@/config/firms/firm-styles"
import { inngest } from "@/inngest/client"
import type { Message } from "@/lib/ai/providers"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId, userMessage } = await req.json()
  if (!sessionId || !userMessage) {
    return NextResponse.json({ error: "sessionId and userMessage required" }, { status: 400 })
  }

  const data = await getSessionWithTranscript(sessionId)
  if (!data || data.session.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Persist user turn
  await appendTurn(sessionId, { role: "user", content: userMessage })

  // Build conversation history for AI
  const turns = data.transcript?.turns as Array<{ role: string; content: string }> ?? []
  const history: Message[] = [
    ...turns.map((t) => ({
      role: t.role === "interviewer" ? ("assistant" as const) : ("user" as const),
      content: t.content,
    })),
    { role: "user" as const, content: userMessage },
  ]

  const { firmStyle, firmId, interviewType } = data.session
  const systemPrompt = await getInterviewerSystemPrompt(firmId ?? firmStyle, interviewType)

  const turnCount = data.session.turnCount ?? turns.length
  const directorState = buildDirectorState(userMessage, turnCount, interviewType)
  const firmConfig = FIRM_CONFIGS[firmId as FirmId]
  if (!firmConfig) {
    return NextResponse.json({ error: `Unknown firmId: ${firmId}` }, { status: 400 })
  }
  const directorBlock = buildDirectorBlock(directorState, firmConfig, interviewType)

  // Fire-and-forget analytics event
  inngest.send({
    name: "interview/turn.completed",
    data: {
      sessionId,
      userId: session.user.id,
      turnIndex: turnCount,
      stage: directorState.stage,
      signal: directorState.signal,
      messageLength: userMessage.length,
      firmId: firmId ?? firmStyle,
      interviewType,
    },
  }).catch(() => {/* non-critical */})

  // Stream response back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ""
      try {
        for await (const chunk of streamInterviewerResponse(systemPrompt, history, directorBlock)) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(chunk))
        }
        // Persist interviewer turn after streaming completes
        await appendTurn(sessionId, { role: "interviewer", content: fullResponse })
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
