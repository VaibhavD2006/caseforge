import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq, and, gt } from "drizzle-orm"

async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
  return Buffer.from(buf).toString("hex")
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawToken = searchParams.get("token")

  if (!rawToken) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }

  const tokenHash = await hashToken(rawToken)

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, tokenHash),
        gt(verificationTokens.expires, new Date())
      )
    )
    .limit(1)

  if (!record) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }

  // Apply the passwordHash from this token — whoever owns the inbox and clicks
  // the link gets their own hash activated, preventing account pre-hijacking.
  await db
    .update(users)
    .set({ emailVerified: new Date(), passwordHash: record.passwordHash })
    .where(eq(users.email, record.identifier))

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, tokenHash))

  return NextResponse.redirect(new URL("/sign-in?verified=true", req.url))
}
