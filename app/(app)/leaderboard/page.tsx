import { requireAuth } from "@/lib/auth/session"
import { computeGlobalLeaderboard, getUserRankContext, getLeaderboardProfile } from "@/lib/db/queries/leaderboard"
import LeaderboardClient from "./leaderboard-client"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const session = await requireAuth()
  const userId = session.user.id!

  const [board, userContext, userProfile] = await Promise.all([
    computeGlobalLeaderboard(),
    getUserRankContext(userId),
    getLeaderboardProfile(userId),
  ])

  return (
    <LeaderboardClient
      board={board}
      userContext={userContext}
      isOptedIn={userProfile?.isOptedIn ?? false}
      currentUserId={userId}
    />
  )
}
