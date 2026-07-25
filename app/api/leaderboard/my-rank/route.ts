import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { getUserRankContext } from "@/lib/db/queries/leaderboard"

export async function GET() {
  const session = await requireAuth()
  const userId = session.user.id!
  const context = await getUserRankContext(userId)
  return NextResponse.json(context)
}
