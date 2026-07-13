import { jsonCompletion, chatCompletion, type Message } from "./providers"
import { db } from "@/lib/db"
import { promptTemplates, weaknessTags } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import weaknessTaxonomy from "@/config/rubrics/weakness-taxonomy.json"
import scoringDimensions from "@/config/rubrics/scoring-dimensions.json"

const ALLOWED_TAGS = new Set(weaknessTaxonomy.tags.map((t) => t.key))

const DIMENSIONS = [
  "structure",
  "framing",
  "hypothesis",
  "quantitative",
  "business_judgment",
  "creativity",
  "synthesis",
  "recommendation_quality",
  "communication",
  "confidence",
  "presence",
] as const

type Dimension = (typeof DIMENSIONS)[number]

type DimensionResult = {
  dimension: Dimension
  score: number
  rationale: string
  evidenceSnippets: string[]
  tagKeys: string[]
}

type Turn = {
  role: string
  content: string
}

export type ScorecardResult = {
  overallScore: number
  dimensionScores: Record<Dimension, { score: number; rationale: string; evidenceSnippets: string[] }>
  topStrengths: string[]
  topWeaknesses: string[]
  strengthTagKeys: string[]
  weaknessTagKeys: string[]
  nextActions: string[]
  reliabilityFlag: boolean
  evaluatorModel: string
  evaluatorPromptVersion: string
  recruiterSummary?: string
}

// Default weights for 11 dimensions (sums to 1.0)
const DEFAULT_WEIGHTS: Record<Dimension, number> = {
  structure: 0.16,
  framing: 0.08,
  hypothesis: 0.12,
  quantitative: 0.14,
  business_judgment: 0.16,
  creativity: 0.06,
  synthesis: 0.12,
  recommendation_quality: 0.06,
  communication: 0.06,
  confidence: 0.03,
  presence: 0.01,
}

function chunkTranscriptForDimension(turns: Turn[], dimension: Dimension): string {
  if (dimension === "framing") {
    const first = turns.slice(0, Math.min(4, Math.ceil(turns.length * 0.25)))
    return first.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  if (dimension === "hypothesis") {
    const first = turns.slice(0, Math.ceil(turns.length * 0.4))
    return first.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  if (dimension === "quantitative") {
    const numericTurns = turns.filter((t) => /\d/.test(t.content))
    if (numericTurns.length > 0) {
      return numericTurns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
    }
  }

  if (dimension === "synthesis" || dimension === "recommendation_quality") {
    const last = turns.slice(Math.floor(turns.length * 0.6))
    return last.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  if (dimension === "presence") {
    return turns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  return turns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
}

async function getDimensionPrompt(dimension: Dimension): Promise<string> {
  const promptName = `evaluator_${dimension}_v1`
  const [template] = await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.name, promptName))
    .limit(1)

  return template?.content ?? getDefaultDimensionPrompt(dimension)
}

function getDefaultDimensionPrompt(dimension: Dimension): string {
  const dim = scoringDimensions.dimensions[dimension]
  if (!dim) {
    return `Evaluate the candidate on the ${dimension.toUpperCase()} dimension.\n\n(Using default rubric)\n\nTranscript:\n{{TRANSCRIPT_CHUNKS}}\n\nReturn JSON: { "dimension": "${dimension}", "score": <1-10>, "rationale": "<2-3 sentences>", "evidenceSnippets": ["<exact quote>"], "tagKeys": [] }`
  }

  return `Evaluate the candidate on the ${dimension.toUpperCase()} dimension.

${dim.description}

Bands:
${dim.bands.map((b) => `  ${b.range[0]}-${b.range[1]}: ${b.anchor}`).join("\n")}

Transcript:
{{TRANSCRIPT_CHUNKS}}

Return JSON: { "dimension": "${dimension}", "score": <1-10>, "rationale": "<2-3 sentences>", "evidenceSnippets": ["<exact quote>"], "tagKeys": [] }`
}

async function evaluateDimension(
  dimension: Dimension,
  turns: Turn[],
  caseContext?: string
): Promise<DimensionResult> {
  const promptTemplate = await getDimensionPrompt(dimension)
  const transcriptChunks = chunkTranscriptForDimension(turns, dimension)

  const prompt = promptTemplate
    .replace("{{TRANSCRIPT_CHUNKS}}", transcriptChunks)
    .replace("{{CASE_CONTEXT}}", caseContext ?? "No case context provided.")

  const messages: Message[] = [
    {
      role: "user",
      content: prompt,
    },
  ]

  const result = await jsonCompletion<DimensionResult>(messages)

  // Validate and sanitize tag keys
  const validTagKeys = (result.tagKeys ?? []).filter((key) => ALLOWED_TAGS.has(key))

  return {
    dimension,
    score: Math.min(10, Math.max(1, Math.round(result.score ?? 5))),
    rationale: result.rationale ?? "",
    evidenceSnippets: result.evidenceSnippets ?? [],
    tagKeys: validTagKeys,
  }
}

// Extended weakness taxonomy for new dimensions
const EXTENDED_TAGS: Record<string, { label: string; dimension: Dimension }> = {
  framing_missing: { label: "Missing framing", dimension: "framing" },
  framing_vague: { label: "Vague framing", dimension: "framing" },
  creativity_absent: { label: "No creative insight", dimension: "creativity" },
  recommendation_vague: { label: "Vague recommendation", dimension: "recommendation_quality" },
  recommendation_no_action: { label: "No action plan", dimension: "recommendation_quality" },
}

export async function evaluateSession(
  turns: Turn[],
  caseContext?: string,
  firmId?: string
): Promise<ScorecardResult> {
  const results: DimensionResult[] = []
  for (const dim of DIMENSIONS) {
    const result = await evaluateDimension(dim, turns, caseContext)
    results.push(result)
  }

  // Compute weighted overall score
  const weights = DEFAULT_WEIGHTS
  const overallScore = results.reduce(
    (sum, r) => sum + r.score * weights[r.dimension],
    0
  )

  // Build dimension scores map
  const dimensionScores = Object.fromEntries(
    results.map((r) => [
      r.dimension,
      { score: r.score, rationale: r.rationale, evidenceSnippets: r.evidenceSnippets },
    ])
  ) as ScorecardResult["dimensionScores"]

  // Collect all weakness/strength tags
  const allTagKeys = results.flatMap((r) => r.tagKeys)
  const weaknessTagKeys = [...new Set(allTagKeys)]
  const strengthTagKeys: string[] = []

  // Derive top strengths and weaknesses from dimension results
  const sortedByScore = [...results].sort((a, b) => b.score - a.score)
  const topStrengths = sortedByScore
    .slice(0, 3)
    .filter((r) => r.score >= 7)
    .map((r) => `${r.dimension.replace("_", " ")}: ${r.rationale.split(".")[0]}`)

  const weakSorted = [...results].sort((a, b) => a.score - b.score)
  const topWeaknesses = weakSorted
    .slice(0, 3)
    .filter((r) => r.score <= 6)
    .map((r) => `${r.dimension.replace("_", " ")}: ${r.rationale.split(".")[0]}`)

  // Flag reliability if any score is near the boundary or evidence was sparse
  const reliabilityFlag = results.some((r) => r.evidenceSnippets.length === 0)

  // Next actions based on weakest dimensions
  const nextActions = weakSorted
    .slice(0, 3)
    .map((r) => {
      const dim = r.dimension
      const actions: Record<Dimension, string> = {
        structure: "Practice building MECE frameworks before analyzing — write out your structure before speaking.",
        framing: "Spend 60 seconds at the start restating the business objective and asking one clarifying question.",
        hypothesis: "Start every analysis with an explicit hypothesis. State what you think is true before looking at data.",
        quantitative: "Practice mental math daily. Always estimate before calculating.",
        business_judgment: "Ask yourself 'so what?' after every analysis point. What does this mean for the decision?",
        creativity: "Before delivering your framework, ask: what's the most surprising thing that could be true here?",
        synthesis: "Lead with your recommendation, then support it. Never bury the conclusion.",
        recommendation_quality: "Your recommendation should answer: What exactly, by when, and what's the one reason this could fail?",
        communication: "Signpost transitions between sections. Say 'First I'll cover X, then Y, then Z' before diving in.",
        confidence: "Acknowledge pushback briefly, then defend your position with evidence. Say 'I hear you, and here's why I still think...'",
        presence: "Replace 'I think maybe...' with 'Based on X, I'd recommend...' — confidence lives in sentence structure.",
      }
      return actions[dim] ?? `Focus on improving ${dim.replace("_", " ")}.`
    })

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    dimensionScores,
    topStrengths,
    topWeaknesses,
    strengthTagKeys,
    weaknessTagKeys,
    nextActions,
    reliabilityFlag,
    evaluatorModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    evaluatorPromptVersion: "v1",
  }
}

export async function generateImprovementReport(
  turns: Turn[],
  scorecard: ScorecardResult,
  caseContext?: string,
  firmId?: string
): Promise<string> {
  const transcript = turns.map((t) => `[${t.role.toUpperCase()}]: ${t.content}`).join("\n\n")
  const weakDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score <= 6)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([k, v]) => `${k.replace(/_/g, " ")} (${v.score}/10): ${v.rationale}`)
  const strongDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score >= 7)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([k, v]) => `${k.replace(/_/g, " ")} (${v.score}/10)`)

  const messages: Message[] = [
    {
      role: "user",
      content: `You are a senior consulting coach writing a detailed post-interview improvement report for a candidate who just completed a practice case interview. Write a structured, honest, case-specific report they can study and act on.

Overall score: ${scorecard.overallScore}/10
Firm: ${firmId ?? "consulting"}
Strong dimensions: ${strongDims.join(", ") || "none"}
Weak dimensions:
${weakDims.join("\n")}

Case context:
${caseContext ?? "General consulting case"}

Full transcript:
${transcript}

Write the report in this exact structure (use markdown headers):

## What You Did Well
2-3 sentences referencing specific moments in the transcript where the candidate showed strength.

## Critical Gaps
For each dimension scoring 6 or below: one paragraph explaining exactly what went wrong in this specific case — not generic advice, but what the candidate actually did or failed to do in this session.

## What a Strong Answer Looked Like
A brief narrative (3-5 sentences) of what an ideal candidate would have done differently on this specific case — the structure they would have used, the analysis they would have prioritized, the recommendation they would have given.

## Your 3-Step Practice Plan
Three concrete, prioritized actions the candidate should take before their next interview. Be specific to what this session revealed.

Keep the tone direct and coach-like. No fluff. Reference the actual case content.`,
    },
  ]

  return chatCompletion(messages, { temperature: 0.4 })
}

export async function generateRecruiterSummary(
  turns: Turn[],
  scorecard: ScorecardResult,
  firmId?: string
): Promise<string> {
  const transcript = turns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  const weakDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score <= 6)
    .map(([k]) => k.replace("_", " "))
  const strongDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score >= 7)
    .map(([k]) => k.replace("_", " "))

  const messages: Message[] = [
    {
      role: "user",
      content: `You are a senior consulting interviewer writing a brief post-interview evaluation note. Write a single paragraph (3-5 sentences) in first-person past tense as if you just finished interviewing this candidate. Be professional, specific, and honest — this is an internal note, not feedback to the candidate.

Overall score: ${scorecard.overallScore}/10
Strong dimensions: ${strongDims || "none notable"}
Weak dimensions: ${weakDims || "none notable"}
Top strengths: ${scorecard.topStrengths.join("; ")}
Top weaknesses: ${scorecard.topWeaknesses.join("; ")}

Transcript excerpt (first and last few exchanges):
${[...turns.slice(0, 4), ...turns.slice(-4)].map((t) => `[${t.role}]: ${t.content.slice(0, 200)}`).join("\n\n")}

Write the evaluator note now. Do not include any headers or labels — just the paragraph.`,
    },
  ]

  return chatCompletion(messages)
}