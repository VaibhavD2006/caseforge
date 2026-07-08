import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "caseforge-ai",
  name: "CaseForge AI",
})

export type EvaluateSessionEvent = {
  data: {
    sessionId: string
    userId: string
  }
}
