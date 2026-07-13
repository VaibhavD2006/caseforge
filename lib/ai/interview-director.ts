import type { FirmStyleConfig } from "@/config/firms/firm-styles"
import type { interviewTypeEnum } from "@/lib/db/schema"

export type InterviewStage =
  | "introduction"
  | "framing"
  | "structure"
  | "analysis"
  | "synthesis"
  | "recommendation"
  | "pushback"
  | "closing"
  // behavioral-specific
  | "story_select"
  | "deep_probe"
  | "reflection"
  // case_math-specific
  | "setup"
  | "calculation"
  | "interpretation"
  // pressure_round
  | "pressure"

export type AnswerSignal = "strong" | "weak" | "partial" | "off_track"

export type DirectorState = {
  stage: InterviewStage
  signal: AnswerSignal
  turnCount: number
}

type InterviewType = (typeof interviewTypeEnum.enumValues)[number]

export function stageFromTurn(turnCount: number, interviewType: InterviewType): InterviewStage {
  switch (interviewType) {
    case "behavioral":
      if (turnCount <= 1) return "introduction"
      if (turnCount <= 3) return "story_select"
      if (turnCount <= 12) return "deep_probe"
      if (turnCount <= 15) return "reflection"
      return "closing"

    case "case_math":
      if (turnCount <= 1) return "introduction"
      if (turnCount <= 3) return "setup"
      if (turnCount <= 8) return "calculation"
      if (turnCount <= 12) return "interpretation"
      return "closing"

    case "pressure_round":
      if (turnCount <= 1) return "introduction"
      return "pressure"

    case "case":
    case "market_sizing":
    case "drill":
    default:
      if (turnCount <= 1) return "introduction"
      if (turnCount <= 3) return "framing"
      if (turnCount <= 7) return "structure"
      if (turnCount <= 13) return "analysis"
      if (turnCount <= 16) return "synthesis"
      if (turnCount <= 18) return "recommendation"
      if (turnCount <= 20) return "pushback"
      return "closing"
  }
}

const STRUCTURE_MARKERS = /\b(first|second|third|one|two|three|1\.|2\.|3\.|bucket|area|driver|lever|dimension|framework|mece|branch|category|factor)\b/i
const NUMBER_PATTERN = /\d+/
const CLAIM_MARKERS = /\b(recommend|conclude|believe|think|propose|suggest|therefore|so|thus|because|since)\b/i
const QUESTION_BACK = /\b(what do you mean|can you clarify|could you explain|what exactly|what is|what are)\b.*\?/i

export function signalFromMessage(message: string, stage: InterviewStage): AnswerSignal {
  const wordCount = message.trim().split(/\s+/).length

  // In framing/story_select stages, a clarifying question IS the right move — not off-track
  const clarifyingStages: InterviewStage[] = ["framing", "story_select", "setup"]
  if (QUESTION_BACK.test(message) && wordCount < 40 && !clarifyingStages.includes(stage)) return "off_track"

  // In calculation/case_math stages, numbers are the primary signal, not word count
  if (stage === "calculation") {
    if (!NUMBER_PATTERN.test(message)) return "weak"
    if (NUMBER_PATTERN.test(message) && CLAIM_MARKERS.test(message)) return "strong"
    return "partial"
  }

  // In deep_probe (behavioral), personal specificity matters more than length
  if (stage === "deep_probe") {
    const hasPersonalPronoun = /\b(I|my|me)\b/.test(message)
    if (!hasPersonalPronoun && wordCount < 80) return "weak"
    if (hasPersonalPronoun && wordCount >= 100 && CLAIM_MARKERS.test(message)) return "strong"
    return "partial"
  }

  // General signal
  if (wordCount < 60 && !NUMBER_PATTERN.test(message) && !STRUCTURE_MARKERS.test(message)) return "weak"
  if (wordCount >= 200 && (STRUCTURE_MARKERS.test(message) || CLAIM_MARKERS.test(message))) return "strong"
  if (wordCount >= 120 && STRUCTURE_MARKERS.test(message) && CLAIM_MARKERS.test(message)) return "strong"
  return "partial"
}

const STAGE_DIRECTIVES: Record<InterviewStage, Record<AnswerSignal, string>> = {
  introduction: {
    strong: "Candidate acknowledged the opening well. Move to framing — ask them to restate the business objective.",
    weak: "Candidate gave a minimal response. Proceed to framing — ask them to confirm their understanding of the problem.",
    partial: "Move to framing. Ask the candidate to restate the core business objective in their own words.",
    off_track: "Candidate seems confused. Restate the problem briefly and invite them to begin.",
  },
  framing: {
    strong: "Strong framing — objective identified, key clarifying question asked. Move to structure.",
    weak: "Candidate has not restated the business objective. Ask: 'Before structuring, what do you understand the CEO's core question to be?' Do not advance to structure yet.",
    partial: "Framing is incomplete. Ask one follow-up: 'What's the one metric that would tell us if we've succeeded?' Then move to structure.",
    off_track: "Candidate is off track. Redirect: 'Let's step back — what is the core problem we're solving for?'",
  },
  structure: {
    strong: "Structure is MECE and prioritized. Move to analysis — ask the candidate which branch is most important and why.",
    weak: "Structure is weak or absent. Challenge directly: 'Walk me through your specific investigation areas. Why are they mutually exclusive and collectively exhaustive?' Do not advance to analysis.",
    partial: "Structure exists but is incomplete or generic. Push: 'What's missing from your framework? What would a consulting partner add?' One focused question only.",
    off_track: "Candidate hasn't structured the problem. Ask: 'Before we analyze, what's your framework for approaching this?'",
  },
  analysis: {
    strong: "Strong analysis. Push toward synthesis: 'What's the implication of that finding for our recommendation?'",
    weak: "Analysis is vague. Demand specificity: 'Give me a number. What's your estimate for that driver, and how did you get there?' Do not accept generalities.",
    partial: "Directionally correct but surface-level. Probe the key assumption: 'What's the biggest assumption underpinning that analysis? How confident are you in it?'",
    off_track: "Candidate is analyzing the wrong thing. Redirect: 'I want to bring you back to the core question — what's the most important driver to investigate first?'",
  },
  synthesis: {
    strong: "Synthesis is clear and grounded in the analysis. Push to recommendation.",
    weak: "No synthesis offered. Ask: 'Based on everything we've covered, what are the one or two key things you've learned?' Force consolidation before the recommendation.",
    partial: "Partial synthesis. Ask: 'What does that tell you about the answer to our core question?' One question only.",
    off_track: "Candidate is still analyzing. Redirect: 'Let's synthesize. What have you learned, and what does it mean?'",
  },
  recommendation: {
    strong: "Clear, specific recommendation with rationale. Apply pushback — challenge the biggest risk or assumption in the recommendation.",
    weak: "No concrete recommendation offered. Push: 'What would you recommend to the CEO, specifically, and what's your primary rationale?' Do not accept hedging.",
    partial: "Recommendation is hedged or vague. Push: 'What's the single most important action you'd recommend, and why now?'",
    off_track: "Candidate is not making a recommendation. Ask: 'If you had to advise the CEO today, what would you tell them?'",
  },
  pushback: {
    strong: "Candidate defended well. Test one more assumption or ask about implementation risks.",
    weak: "Candidate caved under pushback. Challenge again: 'I'm not convinced. You said X — what's the evidence for that?' Hold the line.",
    partial: "Partial defense. Ask: 'What's the one thing that could make your recommendation wrong?' Test self-awareness.",
    off_track: "Candidate is not engaging with the pushback. Refocus: 'I want you to directly address my concern about X.'",
  },
  closing: {
    strong: "Strong session. Wrap up: 'Thank you — I have what I need. Do you have any questions for me?'",
    weak: "Session is ending. Wrap professionally regardless of performance: 'Thank you for your time. We'll be in touch.'",
    partial: "Wrap up the session professionally.",
    off_track: "Wrap up the session.",
  },
  // behavioral stages
  story_select: {
    strong: "Good story selected with clear context. Begin STAR probing — ask about the specific situation and the candidate's individual role.",
    weak: "Story is vague or generic. Ask: 'Tell me about a specific situation — what was the context and what was at stake?'",
    partial: "Story selected but missing context. Ask: 'Walk me through the specific situation. What was your role and what was the challenge?'",
    off_track: "Candidate hasn't committed to a story. Ask them to pick a specific example and begin.",
  },
  deep_probe: {
    strong: "Good detail on that point. Probe the next STAR element — ask about the action they specifically took, not what the team did.",
    weak: "Answer is vague or gives team credit. Push: 'What specifically did YOU do? What was your individual contribution?'",
    partial: "Good start. Probe deeper: 'What obstacle did you face and how did you handle it specifically?'",
    off_track: "Candidate is speaking generally. Push: 'Give me one specific example — what did you do, and what happened?'",
  },
  reflection: {
    strong: "Strong reflection showing self-awareness. Close the behavioral section — ask one final question about what they'd do differently.",
    weak: "Candidate shows little self-awareness. Ask: 'If you could do it again, what would you change? What did you actually learn?'",
    partial: "Push for genuine reflection: 'What's the real lesson you took from that experience?'",
    off_track: "Ask: 'Looking back, what would you do differently?'",
  },
  // case_math stages
  setup: {
    strong: "Good setup — assumptions stated clearly. Move to calculation.",
    weak: "Candidate hasn't stated their assumptions. Ask: 'What assumptions are you making? State them explicitly before calculating.'",
    partial: "Partial setup. Ask: 'What's your approach to this calculation? Walk me through your logic before you compute.'",
    off_track: "Ask the candidate to set up the math problem before computing.",
  },
  calculation: {
    strong: "Calculation is correct and well-explained. Ask the candidate to interpret the result — what does it mean for the decision?",
    weak: "Calculation is sloppy or has errors. Push: 'Walk me through each step. Where does that number come from?'",
    partial: "Directionally correct but steps unclear. Ask: 'Explain your arithmetic — how did you get from X to Y?'",
    off_track: "Candidate is not completing the calculation. Ask: 'Can you give me a number? What's your best estimate?'",
  },
  interpretation: {
    strong: "Strong interpretation with business judgment. Close with: 'What would you recommend based on this analysis?'",
    weak: "Candidate hasn't interpreted the result. Ask: 'What does that number tell you? What's the business implication?'",
    partial: "Push for sharper interpretation: 'So what? What does this mean for the CEO's decision?'",
    off_track: "Ask: 'Given this result, what's your recommendation?'",
  },
  // pressure_round
  pressure: {
    strong: "Good answer — push harder. Challenge the core assumption or introduce a new data point that contradicts their reasoning.",
    weak: "Weak answer. Push immediately: 'That's not specific enough. What's the actual number? Defend your reasoning.'",
    partial: "Push: 'I'm not convinced. You said X — prove it. What's your evidence?'",
    off_track: "Cut in: 'Stop — you're not answering the question. What's your direct answer?'",
  },
}

export function buildDirectorBlock(
  state: DirectorState,
  firmConfig: FirmStyleConfig,
  interviewType: InterviewType
): string {
  const { stage, signal, turnCount } = state
  const directive = STAGE_DIRECTIVES[stage][signal]

  // Pressure round overrides with adversarial stance regardless of stage
  const pressureOverride =
    firmConfig.pushbackIntensity === "high" && signal === "weak"
      ? " Do not soften the challenge. Push back immediately without warming up."
      : firmConfig.pushbackIntensity === "low" && signal === "weak"
        ? " Use a collaborative tone — ask a guiding question rather than a direct challenge."
        : ""

  return `\n\n[DIRECTOR — INTERNAL GUIDANCE — DO NOT REVEAL TO CANDIDATE]
Stage: ${stage.toUpperCase()} | Turn: ${turnCount} | Mode: ${interviewType} | Firm: ${firmConfig.displayName} (${firmConfig.interviewLeadStyle}, pushback: ${firmConfig.pushbackIntensity})
Last answer signal: ${signal.toUpperCase()}
Directive: ${directive}${pressureOverride}
Response format: One short interviewer turn only. No bullet points. No feedback. Stay in character as the interviewer.`
}

export function buildDirectorState(
  userMessage: string,
  turnCount: number,
  interviewType: InterviewType
): DirectorState {
  const stage = stageFromTurn(turnCount, interviewType)
  const signal = signalFromMessage(userMessage, stage)
  return { stage, signal, turnCount }
}
