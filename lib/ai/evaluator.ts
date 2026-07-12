import { jsonCompletion, chatCompletion, type Message } from "./providers"
import { db } from "@/lib/db"
import { promptTemplates } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import weaknessTaxonomy from "@/config/rubrics/weakness-taxonomy.json"
import scoringDimensions from "@/config/rubrics/scoring-dimensions.json"

const ALLOWED_TAGS = new Set(weaknessTaxonomy.tags.map((t) => t.key))

const DIMENSIONS = [
  "structure",
  "hypothesis",
  "quantitative",
  "business_judgment",
  "synthesis",
  "communication",
  "confidence",
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
}

function chunkTranscriptForDimension(turns: Turn[], dimension: Dimension): string {
  // For communication and confidence, use all turns
  if (dimension === "communication" || dimension === "confidence") {
    return turns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  // For synthesis, focus on the last 1/3 of turns
  if (dimension === "synthesis") {
    const last = turns.slice(Math.floor(turns.length * 0.6))
    return last.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  // For quantitative, find turns with numbers
  if (dimension === "quantitative") {
    const numericTurns = turns.filter((t) => /\d/.test(t.content))
    if (numericTurns.length > 0) {
      return numericTurns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
    }
  }

  // For hypothesis, focus on first half of turns
  if (dimension === "hypothesis") {
    const first = turns.slice(0, Math.ceil(turns.length * 0.6))
    return first.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  }

  // Default: all turns
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
  return `Evaluate the candidate on the ${dimension.toUpperCase()} dimension.

${dim.description}

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

const WEIGHTS: Record<Dimension, number> = {
  structure: 0.20,
  hypothesis: 0.15,
  quantitative: 0.15,
  business_judgment: 0.20,
  synthesis: 0.15,
  communication: 0.10,
  confidence: 0.05,
}

export async function evaluateSession(
  turns: Turn[],
  caseContext?: string
): Promise<ScorecardResult> {
  // Run all 7 dimension evaluations sequentially (Ollama is local — parallel would saturate it)
  const results: DimensionResult[] = []
  for (const dim of DIMENSIONS) {
    const result = await evaluateDimension(dim, turns, caseContext)
    results.push(result)
  }

  // Compute weighted overall score
  const overallScore = results.reduce(
    (sum, r) => sum + r.score * WEIGHTS[r.dimension],
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
  const strengthTagKeys: string[] = [] // populated from high-score dimensions

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
        hypothesis: "Start every analysis with an explicit hypothesis. State what you think is true before looking at data.",
        quantitative: "Practice mental math daily. Always estimate before calculating.",
        business_judgment: "Ask yourself 'so what?' after every analysis point. What does this mean for the decision?",
        synthesis: "Lead with your recommendation, then support it. Never bury the conclusion.",
        communication: "Signpost transitions between sections. Say 'First I'll cover X, then Y, then Z' before diving in.",
        confidence: "Acknowledge pushback briefly, then defend your position with evidence. Say 'I hear you, and here's why I still think...'",
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

export async function generateRecruiterSummary(
  turns: Turn[],
  scorecard: ScorecardResult
): Promise<string> {
  const transcript = turns.map((t) => `[${t.role}]: ${t.content}`).join("\n\n")
  const weakDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score <= 6)
    .map(([k]) => k.replace("_", " "))
    .join(", ")
  const strongDims = Object.entries(scorecard.dimensionScores)
    .filter(([, v]) => v.score >= 7)
    .map(([k]) => k.replace("_", " "))
    .join(", ")

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
