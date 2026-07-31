import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { upsertConfigSetting } from "@/lib/db/queries/admin"

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { key, value } = await req.json()
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    parsed = value // treat as plain string if not valid JSON
  }

  await upsertConfigSetting(key, parsed)
  return NextResponse.json({ ok: true })
}
