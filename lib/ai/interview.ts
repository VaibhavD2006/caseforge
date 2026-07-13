import { chatStream, type Message } from "./providers"
import { db } from "@/lib/db"
import { promptTemplates, caseLibrary, interviewTemplates, firmStyleEnum, interviewTypeEnum } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { FIRM_CONFIGS, type FirmId } from "@/config/firms/firm-styles"

export async function getInterviewerSystemPrompt(
  firmId: string,
  interviewType: string,
  caseContext?: string
): Promise<string> {
  const firmConfig = FIRM_CONFIGS[firmId as FirmId]
  const firmStyle = firmConfig?.firmFamily ?? "generic"

  const promptName = `interviewer_${firmStyle}_${interviewType}_v1`

  const [template] = await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.name, promptName))
    .limit(1)

  // Start with firm-specific system prompt modifier
  let systemPrompt = firmConfig?.systemPromptModifier ?? getDefaultSystemPrompt(firmStyle, interviewType)

  // Append template content if available
  const templateContent = template?.content
  if (templateContent) {
    systemPrompt = templateContent + "\n\n" + systemPrompt
  }

  if (caseContext) {
    systemPrompt += `\n\nCase context:\n${caseContext}`
  }

  return systemPrompt
}

function getDefaultSystemPrompt(firmStyle: string, interviewType: string): string {
  return `You are an experienced consulting interviewer conducting a ${interviewType} interview in a ${firmStyle} style. Be rigorous, professional, and demanding. Do not compliment weak answers. Push back on vague responses.`
}

export async function selectCase(
  firmStyle: (typeof firmStyleEnum.enumValues)[number],
  interviewType: (typeof interviewTypeEnum.enumValues)[number]
): Promise<typeof caseLibrary.$inferSelect | null> {
  if (interviewType === "behavioral" || interviewType === "case_math" || interviewType === "pressure_round") return null

  const cases = await db
    .select()
    .from(caseLibrary)
    .where(eq(caseLibrary.firmStyle, firmStyle))
    .orderBy(caseLibrary.timesUsed)
    .limit(5)

  if (cases.length === 0) {
    // fallback to generic
    const genericCases = await db
      .select()
      .from(caseLibrary)
      .where(eq(caseLibrary.firmStyle, "generic"))
      .orderBy(caseLibrary.timesUsed)
      .limit(5)
    return genericCases[0] ?? null
  }

  // Pick randomly from the 5 least-used to avoid repetition
  const idx = Math.floor(Math.random() * cases.length)
  return cases[idx] ?? null
}

export async function* streamInterviewerOpening(
  systemPrompt: string
): AsyncGenerator<string> {
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: "__START_INTERVIEW__",
    },
  ]

  // Replace the user trigger with an instruction to open the interview
  messages[1] = {
    role: "user",
    content: "Please begin the interview with your opening statement. Keep it brief — 2-4 sentences max.",
  }

  yield* chatStream(messages, { temperature: 0.6 })
}

export async function* streamInterviewerResponse(
  systemPrompt: string,
  conversationHistory: Message[],
  directorBlock?: string
): AsyncGenerator<string> {
  const fullPrompt = directorBlock ? systemPrompt + directorBlock : systemPrompt
  const messages: Message[] = [
    { role: "system", content: fullPrompt },
    ...conversationHistory,
  ]

  yield* chatStream(messages, { temperature: 0.7 })
}
