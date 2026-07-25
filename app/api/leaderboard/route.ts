import { NextResponse } from "next/server"
import { computeGlobalLeaderboard } from "@/lib/db/queries/leaderboard"

export async function GET() {
  try {
    const board = await computeGlobalLeaderboard()
    return NextResponse.json(board)
  } catch {
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 })
  }
}
