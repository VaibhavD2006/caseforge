import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { updateGoal, deleteGoal } from "@/lib/db/queries/goals"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const session = await requireAuth()
  const { goalId } = await params
  const body = await req.json()
  const updated = await updateGoal(goalId, session.user.id!, body)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const session = await requireAuth()
  const { goalId } = await params
  await deleteGoal(goalId, session.user.id!)
  return new NextResponse(null, { status: 204 })
}
