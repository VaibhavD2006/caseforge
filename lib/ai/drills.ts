import { jsonCompletion, type Message } from './providers'
import type { Drill } from '@/lib/db/schema'

type DrillEvalResult = {
  score: number
  feedback: string
  improvementNote: string
}

export async function evaluateDrillAttempt(
  drill: Pick<Drill, 'title' | 'prompt' | 'expectedTraits' | 'skillFocus'>,
  response: string
): Promise<DrillEvalResult> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `You are a consulting interview coach evaluating a candidate's drill response.

Drill: ${drill.title}
Skill focus: ${drill.skillFocus.replace('_', ' ')}
Prompt given to candidate: ${drill.prompt}

Key evaluation criteria (score 1-10):
- 1-3: Response misses the core skill or shows fundamental misunderstanding
- 4-6: Response shows partial understanding but lacks depth or precision
- 7-8: Strong response that demonstrates the skill well with minor gaps
- 9-10: Excellent response — clear, precise, and demonstrates mastery

Candidate's response:
"${response}"

Return JSON with:
- score: number 1-10 (be generous to good responses — a solid answer should score at least 7)
- feedback: 2-3 sentence evaluation of what they did well and what was lacking
- improvementNote: 1 concrete, actionable suggestion for next time`,
    },
  ]

  const result = await jsonCompletion<DrillEvalResult>(messages)
  return {
    score: Math.min(10, Math.max(1, Math.round(result.score ?? 5))),
    feedback: result.feedback ?? 'No feedback generated.',
    improvementNote:
      result.improvementNote ?? 'Continue practicing this skill.',
  }
}
