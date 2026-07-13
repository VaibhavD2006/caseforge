import { FIRM_CONFIGS, type FirmId } from "@/config/firms/firm-styles"

export type ReadinessLevel = "not_started" | "developing" | "approaching_ready" | "interview_ready"
export type Tier = "bronze" | "silver" | "gold" | "emerald"

export function computeReadinessLevel(sessionCount: number, avgScore: number): ReadinessLevel {
  if (sessionCount === 0) return "not_started"
  if (sessionCount < 5 || avgScore < 5.0) return "developing"
  if (avgScore < 7.5) return "approaching_ready"
  return "interview_ready"
}

export function computeTier(avgScore: number): Tier {
  if (avgScore < 5.0) return "bronze"
  if (avgScore < 6.5) return "silver"
  if (avgScore < 8.0) return "gold"
  return "emerald"
}

type DimensionWeights = {
  structure: number
  framing: number
  hypothesis: number
  quantitative: number
  business_judgment: number
  creativity: number
  synthesis: number
  recommendation_quality: number
  communication: number
  confidence: number
  presence: number
}

type Scorecard = {
  overallScore: number
  dimensionScores: Record<string, { score: number }>
}

type SessionForReadiness = { firmId?: string | null; interviewType: string }

export function computeFirmReadiness(
  firmId: FirmId,
  scorecards: Scorecard[],
  sessions: SessionForReadiness[]
): number {
  const firmConfig = FIRM_CONFIGS[firmId]
  if (!firmConfig) return 0

  const weights = firmConfig.scoringWeights

  // Get recent sessions (last 10)
  const recentScorecards = scorecards.slice(-10)
  if (recentScorecards.length === 0) return 0

  // Compute weighted average
  const avgScore = recentScorecards.reduce((sum, sc) => {
    const weighted = Object.entries(weights).reduce((s, [dim, w]) => {
      const dimScore = (sc.dimensionScores as Record<string, { score: number }>)?.[dim]?.score ?? 5
      return s + dimScore * w
    }, 0)
    return sum + weighted
  }, 0) / recentScorecards.length

  return Math.min(100, Math.round(avgScore * 10))
}

export function computeFirmReadinessForAll(
  targetFirms: FirmId[],
  scorecards: Scorecard[],
  sessions: SessionForReadiness[]
): Record<FirmId, number> {
  const result = {} as Record<FirmId, number>
  for (const firmId of targetFirms) {
    result[firmId] = computeFirmReadiness(firmId, scorecards, sessions)
  }
  return result
}