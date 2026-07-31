import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getSessionWithTranscript, appendTurn } from '@/lib/db/queries/sessions'
import {
  getInterviewerSystemPrompt,
  streamInterviewerResponse,
} from '@/lib/ai/interview'
import {
  buildDirectorState,
  buildDirectorBlock,
} from '@/lib/ai/interview-director'
import {
  FIRM_CONFIGS,
  normalizeFirmId,
  firmIdFromFamily,
  type FirmId,
} from '@/config/firms/firm-styles'
import { inngest } from '@/inngest/client'
import type { Message } from '@/lib/ai/providers'
import { estimateTurnCostCents } from '@/lib/ai/cost'
import { db } from '@/lib/db'
import { interviewSessions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, userMessage } = await req.json()
  if (!sessionId || !userMessage) {
    return NextResponse.json(
      { error: 'sessionId and userMessage required' },
      { status: 400 }
    )
  }

  const data = await getSessionWithTranscript(sessionId)
  if (!data || data.session.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Persist user turn
  await appendTurn(sessionId, { role: 'user', content: userMessage })

  // Build conversation history for AI
  const turns =
    (data.transcript?.turns as Array<{ role: string; content: string }>) ?? []
  const history: Message[] = [
    ...turns.map((t) => ({
      role:
        t.role === 'interviewer' ? ('assistant' as const) : ('user' as const),
      content: t.content,
    })),
    { role: 'user' as const, content: userMessage },
  ]

  const { firmStyle, firmId, interviewType } = data.session
  const systemPrompt = await getInterviewerSystemPrompt(
    firmId ?? firmStyle,
    interviewType
  )

  const turnCount = data.session.turnCount ?? turns.length
  const directorState = buildDirectorState(
    userMessage,
    turnCount,
    interviewType
  )
  const resolvedFirmId =
    (firmId ? normalizeFirmId(firmId) : null) ?? firmIdFromFamily(firmStyle)
  if (!resolvedFirmId) {
    return NextResponse.json(
      {
        error: `Cannot resolve firm configuration for session (firmId=${firmId}, firmStyle=${firmStyle})`,
      },
      { status: 400 }
    )
  }
  const firmConfig = FIRM_CONFIGS[resolvedFirmId]
  const directorBlock = buildDirectorBlock(
    directorState,
    firmConfig,
    interviewType
  )

  // Fire-and-forget analytics event
  inngest
    .send({
      name: 'interview/turn.completed',
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
    })
    .catch(() => {
      /* non-critical */
    })

  // Stream response back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      try {
        for await (const chunk of streamInterviewerResponse(
          systemPrompt,
          history,
          directorBlock
        )) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(chunk))
        }
        // Persist interviewer turn after streaming completes
        await appendTurn(sessionId, {
          role: 'interviewer',
          content: fullResponse,
        })
        // Accumulate cost estimate (fire-and-forget — non-critical)
        const inputChars = systemPrompt.length + history.reduce((n, m) => n + m.content.length, 0)
        const costCents = estimateTurnCostCents(inputChars, fullResponse.length)
        db.update(interviewSessions)
          .set({ aiCostEstimateCents: sql`${interviewSessions.aiCostEstimateCents} + ${costCents}` })
          .where(eq(interviewSessions.id, sessionId))
          .catch(() => { /* non-critical */ })
        controller.close()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (
          msg.includes('429') ||
          msg.includes('quota') ||
          msg.includes('Too Many Requests')
        ) {
          controller.enqueue(
            encoder.encode(
              '\n\n[AI service temporarily unavailable. Please wait a moment and try again.]'
            )
          )
          controller.close()
        } else {
          controller.error(err)
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
