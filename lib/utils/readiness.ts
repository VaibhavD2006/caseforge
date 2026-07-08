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
