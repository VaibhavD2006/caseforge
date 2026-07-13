import { db } from "@/lib/db"
import {
  interviewSessions,
  transcripts,
  caseLibrary,
  interviewTemplates,
  firmStyleEnum,
  interviewTypeEnum,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function createSession(data: {
  userId: string
  templateId?: string
  caseId?: string
  firmStyle: (typeof firmStyleEnum.enumValues)[number]
  interviewType: (typeof interviewTypeEnum.enumValues)[number]
  firmId?: string
}) {
  const [session] = await db.insert(interviewSessions).values(data).returning()
  return session!
}

export async function createTranscript(sessionId: string, firstTurn: { role: "interviewer"; content: string }) {
  const [transcript] = await db
    .insert(transcripts)
    .values({
      sessionId,
      turns: [{ role: firstTurn.role, content: firstTurn.content, timestamp: new Date().toISOString() }],
    })
    .returning()
  return transcript!
}

export async function appendTurn(
  sessionId: string,
  turn: { role: "interviewer" | "user"; content: string }
) {
  const [current] = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.sessionId, sessionId))
    .limit(1)

  if (!current) {
    throw new Error(`Transcript not found for session ${sessionId}`)
  }

  const turns = current.turns as Array<{ role: string; content: string; timestamp: string }>
  turns.push({ ...turn, timestamp: new Date().toISOString() })

  await db
    .update(transcripts)
    .set({ turns, updatedAt: new Date() })
    .where(eq(transcripts.sessionId, sessionId))

  await db
    .update(interviewSessions)
    .set({ turnCount: turns.length })
    .where(eq(interviewSessions.id, sessionId))
}

export async function getSessionWithTranscript(sessionId: string) {
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1)

  if (!session) return null

  const [transcript] = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.sessionId, sessionId))
    .limit(1)

  return { session, transcript: transcript ?? null }
}

export async function completeSession(sessionId: string) {
  const now = new Date()
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1)

  if (!session) return null

  const durationSeconds = Math.floor(
    (now.getTime() - session.startedAt.getTime()) / 1000
  )

  const [updated] = await db
    .update(interviewSessions)
    .set({
      status: "evaluation_pending",
      completedAt: now,
      durationSeconds,
    })
    .where(eq(interviewSessions.id, sessionId))
    .returning()

  return updated ?? null
}

export async function getUserSessions(userId: string) {
  return db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt))
}
