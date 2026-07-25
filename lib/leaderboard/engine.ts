// Leaderboard ranking engine — pure functions, no DB calls

const MIN_ELIGIBLE_SESSIONS = 3
const MAX_SESSIONS_PER_DAY = 3
const DECAY_HALF_LIFE_DAYS = 90

type ScorecardInput = {
  overallScore: number | string | null
  createdAt: Date
  reliabilityFlag: boolean | null
  sessionStatus: string
}

type ScoreComponents = {
  leaderboardScore: number
  qualityScore: number
  improvementScore: number
  consistencyScore: number
  eligibleSessionCount: number
}

function decayWeight(daysAgo: number): number {
  return Math.exp((-Math.LN2 * daysAgo) / DECAY_HALF_LIFE_DAYS)
}

function capSessionsPerDay(cards: ScorecardInput[]): ScorecardInput[] {
  const countByDay = new Map<string, number>()
  const result: ScorecardInput[] = []
  for (const c of cards) {
    const day = c.createdAt.toISOString().slice(0, 10)
    const count = countByDay.get(day) ?? 0
    if (count < MAX_SESSIONS_PER_DAY) {
      result.push(c)
      countByDay.set(day, count + 1)
    }
  }
  return result
}

function filterEligible(cards: ScorecardInput[]): ScorecardInput[] {
  return cards.filter(
    (c) =>
      c.sessionStatus === "evaluated" &&
      c.reliabilityFlag !== true &&
      c.overallScore !== null
  )
}

export function computeLeaderboardScore(scorecards: ScorecardInput[]): ScoreComponents {
  // Sort descending by date so cap applies to most-recent first
  const sorted = [...scorecards].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
  const eligible = capSessionsPerDay(filterEligible(sorted))

  if (eligible.length < MIN_ELIGIBLE_SESSIONS) {
    return { leaderboardScore: 0, qualityScore: 0, improvementScore: 0, consistencyScore: 0, eligibleSessionCount: eligible.length }
  }

  const now = Date.now()
  const scores = eligible.map((c) => Number(c.overallScore))

  // Quality: time-decay weighted average, normalized to 0–10
  let weightedSum = 0
  let totalWeight = 0
  for (let i = 0; i < eligible.length; i++) {
    const card = eligible[i]!
    const score = scores[i] ?? 0
    const daysAgo = (now - card.createdAt.getTime()) / 86_400_000
    const w = decayWeight(daysAgo)
    weightedSum += score * w
    totalWeight += w
  }
  const qualityScore = totalWeight > 0 ? weightedSum / totalWeight : 0

  // Improvement: linear regression slope over last 10, scaled to 0–10
  const recent = scores.slice(0, 10).reverse() // oldest to newest
  let improvementScore = 5 // neutral baseline
  if (recent.length >= 5) {
    const n = recent.length
    const sumX = (n * (n - 1)) / 2
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    const sumY = recent.reduce((a, b) => a + b, 0)
    const sumXY = recent.reduce((acc, y, x) => acc + x * y, 0)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    // slope per session; +1 point/session → improvementScore 10, -1 → 0
    improvementScore = Math.max(0, Math.min(10, 5 + slope * 5))
  }

  // Consistency: penalize variance — stddev 0 → 10, stddev 3+ → 0
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, s) => acc + (s - mean) ** 2, 0) / scores.length
  const stddev = Math.sqrt(variance)
  const consistencyScore = Math.max(0, 10 - stddev * 10 / 3)

  const leaderboardScore =
    qualityScore * 0.65 + improvementScore * 0.20 + consistencyScore * 0.15

  return {
    leaderboardScore: Math.min(10, leaderboardScore),
    qualityScore,
    improvementScore,
    consistencyScore,
    eligibleSessionCount: eligible.length,
  }
}

export function computeRankMovement(
  currentRank: number,
  previousRank: number | null
): { delta: number; direction: "up" | "down" | "same" | "new" } {
  if (previousRank === null) return { delta: 0, direction: "new" }
  const delta = previousRank - currentRank // positive = moved up
  return {
    delta: Math.abs(delta),
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
  }
}

export { MIN_ELIGIBLE_SESSIONS }
