import { auth } from "@/auth"
import { NextResponse } from "next/server"
import {
  createProfile,
  getProfileByUserId,
  updateProfile,
} from "@/lib/db/queries/profile"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await getProfileByUserId(session.user.id)
  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const profile = await createProfile(session.user.id, body)
  return NextResponse.json({ profile }, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const profile = await updateProfile(session.user.id, body)
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }
  return NextResponse.json({ profile })
}
