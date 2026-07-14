import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hash } from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email/send-verification"

function hashToken(token: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(token))
    .then((buf) => Buffer.from(buf).toString("hex"))
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email: rawEmail, password } = body

  if (!rawEmail || typeof rawEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const baseUrl = process.env.NEXTAUTH_URL
  if (!baseUrl) throw new Error("NEXTAUTH_URL is not set")

  const email = rawEmail.toLowerCase().trim()
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  // Always return 200 to prevent email enumeration — the caller gets "check your inbox"
  // whether or not the account already exists.
  if (existing?.emailVerified) {
    return NextResponse.json({ ok: true })
  }

  // Store the hash on the token, not on the user. This prevents pre-hijacking:
  // whoever owns the inbox and clicks the link gets their own hash activated.
  const passwordHash = await hash(password, 12)
  const rawToken = crypto.randomUUID()
  const tokenHash = await hashToken(rawToken)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.transaction(async (tx) => {
    if (existing && !existing.emailVerified) {
      await tx.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
      await tx.insert(verificationTokens).values({ identifier: email, token: tokenHash, expires, passwordHash })
    } else {
      // New user: create record without a passwordHash — verify-email will set it.
      await tx.insert(users).values({ email, emailVerified: null }).onConflictDoNothing()
      await tx.insert(verificationTokens).values({ identifier: email, token: tokenHash, expires, passwordHash })
    }
  })

  await sendVerificationEmail(email, rawToken, baseUrl)
  return NextResponse.json({ ok: true })
}
