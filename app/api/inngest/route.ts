import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { evaluateSessionFn } from "@/inngest/functions/evaluate-session"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateSessionFn],
})
