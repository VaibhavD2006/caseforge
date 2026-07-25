import { db } from "@/lib/db"
import {
  leaderboardProfiles,
  leaderboardScoreCache,
  leaderboardRankHistory,
  interviewSessions,
  scorecards,
} from "@/lib/db/schema"
import { eq, desc, and, sql, inArray } from "drizzle-orm"
import { computeLeaderboardScore } from "@/lib/leaderboard/engine"

export type LeaderboardEntry = {
  userId: string
  displayName: string
  schoolName: string | null
  showSchool: boolean
  showExactScore: boolean
  tier: string
  leaderboardScore: number
  rank: number
  movement: { delta: number; direction: "up" | "down" | "same" | "new" }
  eligibleSessionCount: number
}

export type UserRankContext = {
  rank: number | null
  percentile: number | null
  leaderboardScore: number
  eligibleSessionCount: number
  isEligible: boolean
  movement: { delta: number; direction: "up" | "down" | "same" | "new" }
  nextRankScore: number | null
}

export async function getLeaderboardProfile(userId: string) {
  const rows = await db
    .select()
    .from(leaderboardProfiles)
    .where(eq(leaderboardProfiles.userId, userId))
    .limit(1)
  return rows[0] ?? null
}

export async function upsertLeaderboardProfile(
  userId: string,
  data: Partial<{
    displayName: string
    schoolName: string
    graduationYear: number
    isOptedIn: boolean
    showSchool: boolean
    showExactScore: boolean
  }>
) {
  await db
    .insert(leaderboardProfiles)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: leaderboardProfiles.userId,
      set: { ...data, updatedAt: new Date() },
    })
}

// Compute and rank all opted-in users — called on leaderboard page load
// ponytail: O(n_users) recompute; replace with scheduled cache fill when user count >500
export async function computeGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  // Get all opted-in profiles
  const profiles = await db
    .select()
    .from(leaderboardProfiles)
    .where(eq(leaderboardProfiles.isOptedIn, true))

  if (profiles.length === 0) return []

  const userIds = profiles.map((p) => p.userId)

  // Fetch scorecards + session status for all opted-in users in one query
  const rawRows = await db
    .select({
      userId: scorecards.userId,
      overallScore: scorecards.overallScore,
      reliabilityFlag: scorecards.reliabilityFlag,
      sessionStatus: interviewSessions.status,
      createdAt: scorecards.createdAt,
    })
    .from(scorecards)
    .innerJoin(interviewSessions, eq(scorecards.sessionId, interviewSessions.id))
    .where(inArray(scorecards.userId, userIds))

  // Fetch latest progress snapshot for tier info
  const snapshotRows = await db.execute(
    sql`SELECT DISTINCT ON (user_id) user_id, tier FROM progress_snapshots WHERE user_id = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]) ORDER BY user_id, created_at DESC`
  )
  const tierMap = new Map<string, string>(
    (snapshotRows as unknown as { user_id: string; tier: string }[]).map((r) => [r.user_id, r.tier])
  )

  // Fetch previous rank history for movement
  const historyRows = await db.execute(
    sql`SELECT DISTINCT ON (user_id, segment) user_id, rank FROM leaderboard_rank_history WHERE user_id = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]) AND segment = 'overall' ORDER BY user_id, segment, snapshot_date DESC`
  )
  const prevRankMap = new Map<string, number>(
    (historyRows as unknown as { user_id: string; rank: number }[]).map((r) => [r.user_id, r.rank])
  )

  // Group scorecards by userId
  const cardsByUser = new Map<string, typeof rawRows>()
  for (const row of rawRows) {
    const list = cardsByUser.get(row.userId) ?? []
    list.push(row)
    cardsByUser.set(row.userId, list)
  }

  // Compute score for each user
  const scored = profiles.map((profile) => {
    const cards = (cardsByUser.get(profile.userId) ?? []).map((c) => ({
      overallScore: c.overallScore,
      createdAt: c.createdAt,
      reliabilityFlag: c.reliabilityFlag,
      sessionStatus: c.sessionStatus,
    }))
    const components = computeLeaderboardScore(cards)
    const prevRank = prevRankMap.get(profile.userId) ?? null
    return { profile, components, prevRank, tier: tierMap.get(profile.userId) ?? "bronze" }
  })

  // Sort by leaderboardScore descending, then eligibleSessionCount as tiebreak
  scored.sort((a, b) => {
    const scoreDiff = b.components.leaderboardScore - a.components.leaderboardScore
    if (Math.abs(scoreDiff) > 0.001) return scoreDiff
    return b.components.eligibleSessionCount - a.components.eligibleSessionCount
  })

  // Filter to eligible only (score > 0 means >= MIN_SESSIONS)
  const eligible = scored.filter((s) => s.components.leaderboardScore > 0)

  return eligible.map((s, index) => {
    const rank = index + 1
    const { delta, direction } = computeMovement(rank, s.prevRank)
    const displayName = s.profile.displayName ?? anonymize(s.profile.userId)
    return {
      userId: s.profile.userId,
      displayName,
      schoolName: s.profile.showSchool ? s.profile.schoolName : null,
      showSchool: s.profile.showSchool,
      showExactScore: s.profile.showExactScore,
      tier: s.tier,
      leaderboardScore: s.components.leaderboardScore,
      rank,
      movement: { delta, direction },
      eligibleSessionCount: s.components.eligibleSessionCount,
    }
  })
}

export async function getUserRankContext(userId: string): Promise<UserRankContext> {
  // Get user's own scorecards
  const cards = await db
    .select({
      overallScore: scorecards.overallScore,
      reliabilityFlag: scorecards.reliabilityFlag,
      sessionStatus: interviewSessions.status,
      createdAt: scorecards.createdAt,
    })
    .from(scorecards)
    .innerJoin(interviewSessions, eq(scorecards.sessionId, interviewSessions.id))
    .where(eq(scorecards.userId, userId))

  const components = computeLeaderboardScore(
    cards.map((c) => ({
      overallScore: c.overallScore,
      createdAt: c.createdAt,
      reliabilityFlag: c.reliabilityFlag,
      sessionStatus: c.sessionStatus,
    }))
  )

  // Get previous rank for movement
  const histRows = await db
    .select({ rank: leaderboardRankHistory.rank })
    .from(leaderboardRankHistory)
    .where(
      and(
        eq(leaderboardRankHistory.userId, userId),
        eq(leaderboardRankHistory.segment, "overall")
      )
    )
    .orderBy(desc(leaderboardRankHistory.createdAt))
    .limit(1)
  const prevRank = histRows[0]?.rank ?? null

  // Get current global leaderboard to find rank + percentile
  const board = await computeGlobalLeaderboard()
  const entry = board.find((e) => e.userId === userId)
  const rank = entry?.rank ?? null
  const percentile = rank !== null ? Math.round(((board.length - rank) / board.length) * 100) : null
  const nextEntry = rank !== null && rank > 1 ? board[rank - 2] : null
  const nextRankScore = nextEntry?.leaderboardScore ?? null

  const { delta, direction } = computeMovement(rank ?? 0, prevRank)

  return {
    rank,
    percentile,
    leaderboardScore: components.leaderboardScore,
    eligibleSessionCount: components.eligibleSessionCount,
    isEligible: components.leaderboardScore > 0,
    movement: { delta, direction },
    nextRankScore,
  }
}

function computeMovement(
  currentRank: number,
  previousRank: number | null
): { delta: number; direction: "up" | "down" | "same" | "new" } {
  if (previousRank === null || currentRank === 0) return { delta: 0, direction: "new" }
  const delta = previousRank - currentRank
  return {
    delta: Math.abs(delta),
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
  }
}

function anonymize(userId: string): string {
  return "Candidate " + userId.slice(-4).toUpperCase()
}
