import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq, and, gt } from "drizzle-orm"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", req.url))
  }

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
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
    .where(eq(verificationTokens.token, token))

  return NextResponse.redirect(new URL("/sign-in?verified=true", req.url))
}
