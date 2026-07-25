import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { getLeaderboardProfile, upsertLeaderboardProfile } from "@/lib/db/queries/leaderboard"

export async function GET() {
  const session = await requireAuth()
  const profile = await getLeaderboardProfile(session.user.id!)
  return NextResponse.json(profile)
}

export async function PUT(req: Request) {
  const session = await requireAuth()
  const body = await req.json()
  const { displayName, schoolName, graduationYear, isOptedIn, showSchool, showExactScore } = body
  await upsertLeaderboardProfile(session.user.id!, {
    displayName,
    schoolName,
    graduationYear,
    isOptedIn,
    showSchool,
    showExactScore,
  })
  return NextResponse.json({ ok: true })
}
