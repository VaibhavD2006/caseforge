import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSessionWithTranscript, appendTurn } from "@/lib/db/queries/sessions"
import {
  getInterviewerSystemPrompt,
  streamInterviewerResponse,
} from "@/lib/ai/interview"
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

  const { firmStyle, interviewType } = data.session
  const systemPrompt = await getInterviewerSystemPrompt(firmStyle, interviewType)

  // Stream response back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ""
      try {
        for await (const chunk of streamInterviewerResponse(systemPrompt, history)) {
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
