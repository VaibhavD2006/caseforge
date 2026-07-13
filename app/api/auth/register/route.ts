import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hash } from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email/send-verification"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email: rawEmail, password } = body

  if (!rawEmail || typeof rawEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const email = rawEmail.toLowerCase().trim()
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead." },
      { status: 409 }
    )
  }

  // Store the hash on the token, not on the user. This prevents pre-hijacking:
  // whoever owns the inbox and clicks the link gets their own hash activated.
  const passwordHash = await hash(password, 12)
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  if (existing && !existing.emailVerified) {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
    await db.insert(verificationTokens).values({ identifier: email, token, expires, passwordHash })
    await sendVerificationEmail(email, token, baseUrl)
    return NextResponse.json({ ok: true })
  }

  // New user: create record without a passwordHash — verify-email will set it.
  await db.insert(users).values({ email, emailVerified: null })
  await db.insert(verificationTokens).values({ identifier: email, token, expires, passwordHash })
  await sendVerificationEmail(email, token, baseUrl)

  return NextResponse.json({ ok: true })
}
