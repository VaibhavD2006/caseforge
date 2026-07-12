import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { getUserGoals, createGoal } from "@/lib/db/queries/goals"

export async function GET() {
  const session = await requireAuth()
  const data = await getUserGoals(session.user.id!)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const body = await req.json()
  const goal = await createGoal({ userId: session.user.id!, ...body })
  return NextResponse.json(goal, { status: 201 })
}
