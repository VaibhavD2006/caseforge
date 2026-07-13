# Email/Password Auth + Signup Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication with email verification, a signup page with ToS acceptance, and static legal pages alongside the existing Google OAuth flow.

**Architecture:** NextAuth v5 Credentials provider added to existing auth config; custom `/api/auth/register` and `/api/auth/verify-email` routes handle signup and token verification; `bcryptjs` hashes passwords stored in a new nullable `password_hash` column on `users`; Resend sends transactional verification emails; existing `verificationTokens` table stores 24h tokens.

**Tech Stack:** NextAuth v5 (beta.31), bcryptjs, Resend SDK, Drizzle ORM, Supabase (Postgres), Next.js App Router

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/db/schema.ts` | Modify | Add `passwordHash` column to `users` |
| `lib/email/send-verification.ts` | Create | Resend email sender |
| `auth.ts` | Modify | Add Credentials provider |
| `app/api/auth/register/route.ts` | Create | Signup: validate, hash, create user, send email |
| `app/api/auth/verify-email/route.ts` | Create | Token validation, set emailVerified, redirect |
| `app/(auth)/sign-in/page.tsx` | Modify | Add credentials form, verified banner, sign-up link |
| `app/(auth)/sign-up/page.tsx` | Create | Google + email/password + ToS checkbox |
| `app/(auth)/verify-email/page.tsx` | Create | "Check your inbox" confirmation |
| `app/(legal)/terms/page.tsx` | Create | Terms of Service |
| `app/(legal)/privacy/page.tsx` | Create | Privacy Policy |

---

## Task 1: Install Dependencies

**Files:** `package.json` (modified by pnpm)

- [ ] **Step 1: Install runtime + type deps**

```bash
pnpm add bcryptjs resend
pnpm add -D @types/bcryptjs
```

Expected output: packages added, no peer dep errors.

- [ ] **Step 2: Verify installs**

```bash
node -e "require('bcryptjs'); require('resend'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Add RESEND_API_KEY to .env.local**

Open `.env.local` and add:
```
# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>
```

---

## Task 2: Schema — Add passwordHash to users

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add column to users table**

In `lib/db/schema.ts`, find the `users` table definition and add `passwordHash` as the last column before the closing `}`:

```ts
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
})
```

- [ ] **Step 2: Push schema to database**

```bash
npx drizzle-kit push
```

Expected: `[✓] Changes applied` — adds `password_hash` column as nullable text.

- [ ] **Step 3: Verify column exists**

```bash
npx drizzle-kit studio
```

Open the studio URL, navigate to `users` table, confirm `password_hash` column is present. Then close studio (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts
git commit -m "feat: add password_hash column to users table"
```

---

## Task 3: Email Sender

**Files:**
- Create: `lib/email/send-verification.ts`

- [ ] **Step 1: Create the sender module**

Create `lib/email/send-verification.ts`:

```ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: "CaseForge AI <onboarding@resend.dev>",
    to: email,
    subject: "Verify your CaseForge AI email",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
          <div style="margin-bottom:24px;">
            <span style="font-weight:700;font-size:18px;">CaseForge AI</span>
          </div>
          <h2 style="font-size:20px;font-weight:600;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#555;line-height:1.6;margin-bottom:24px;">
            Click the button below to verify your email address and activate your account.
            This link expires in 24 hours.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#1a7a4a;color:#fff;text-decoration:none;
                    padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
            Verify email
          </a>
          <p style="color:#888;font-size:12px;margin-top:32px;">
            If you didn't create a CaseForge AI account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  })
}
```

> **Note:** `onboarding@resend.dev` works without domain verification for testing. Once you verify your domain in Resend dashboard, change this to `noreply@yourdomain.com`.

- [ ] **Step 2: Commit**

```bash
git add lib/email/send-verification.ts
git commit -m "feat: add Resend verification email sender"
```

---

## Task 4: Add Credentials Provider to auth.ts

**Files:**
- Modify: `auth.ts`

- [ ] **Step 1: Rewrite auth.ts with Credentials provider**

Replace the entire contents of `auth.ts`:

```ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { compare } from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        if (!user?.passwordHash || !user.emailVerified) return null

        const valid = await compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url
      } catch {}
      return baseUrl
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.googleId = account.providerAccountId
        token.picture = (profile as { picture?: string }).picture ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add auth.ts
git commit -m "feat: add Credentials provider to NextAuth config"
```

---

## Task 5: Registration API Route

**Files:**
- Create: `app/api/auth/register/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hash } from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email/send-verification"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead." },
      { status: 409 }
    )
  }

  const passwordHash = await hash(password, 12)
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  if (existing && !existing.emailVerified) {
    // Unverified account exists — update password hash and resend verification
    await db.update(users).set({ passwordHash }).where(eq(users.email, email))
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
    await db.insert(verificationTokens).values({ identifier: email, token, expires })
    await sendVerificationEmail(email, token, baseUrl)
    return NextResponse.json({ ok: true })
  }

  await db.insert(users).values({
    email,
    passwordHash,
    emailVerified: null,
  })
  await db.insert(verificationTokens).values({ identifier: email, token, expires })
  await sendVerificationEmail(email, token, baseUrl)

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Test registration with curl**

Start the dev server in a separate terminal (`pnpm dev`), then:

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' | cat
```

Expected: `{"ok":true}` and a verification email in your inbox (or Resend logs at resend.com/emails).

- [ ] **Step 3: Test duplicate email**

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' | cat
```

Expected: `{"ok":true}` (resends verification — not an error, prevents email enumeration).

- [ ] **Step 4: Test short password**

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"short"}' | cat
```

Expected: `{"error":"Password must be at least 8 characters."}`

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/register/route.ts
git commit -m "feat: add email/password registration API route"
```

---

## Task 6: Email Verification API Route

**Files:**
- Create: `app/api/auth/verify-email/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/auth/verify-email/route.ts`:

```ts
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

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier))

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token))

  return NextResponse.redirect(new URL("/sign-in?verified=true", req.url))
}
```

- [ ] **Step 2: Test with an expired/invalid token**

```bash
curl -s -o /dev/null -w "%{redirect_url}" \
  "http://localhost:3000/api/auth/verify-email?token=bad-token"
```

Expected: redirects to `/sign-in?error=invalid-token`

- [ ] **Step 3: Test with real token from registration**

Check Resend dashboard (resend.com/emails) or your inbox for the verification link from Task 5. Open it in a browser. Expected: redirects to `/sign-in?verified=true`.

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/verify-email/route.ts
git commit -m "feat: add email verification token handler"
```

---

## Task 7: Sign-Up Page

**Files:**
- Create: `app/(auth)/sign-up/page.tsx`

- [ ] **Step 1: Create the signup page**

Create `app/(auth)/sign-up/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.")
      return
    }
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-sm font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold text-lg tracking-tight">CaseForge AI</span>
          </div>
          <p className="text-ink-muted text-sm">Consulting interview practice. Strict feedback. Real progress.</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-8">
          <h1 className="text-ink text-xl font-semibold mb-1">Create an account</h1>
          <p className="text-ink-muted text-sm mb-6">Start your consulting interview prep.</p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm font-medium hover:bg-surface hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-ink-faint text-xs">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>

            {/* ToS checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border-subtle accent-brand flex-shrink-0"
              />
              <span className="text-ink-muted text-xs leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-brand hover:text-brand-hover underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-brand hover:text-brand-hover underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && (
              <p className="text-[oklch(0.60_0.18_22)] text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
```

- [ ] **Step 2: Verify page loads**

Open `http://localhost:3000/sign-up` in browser. Confirm: Google button, email/password fields, confirm field, ToS checkbox, "Already have an account?" link.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/sign-up/page.tsx
git commit -m "feat: add sign-up page with Google and email/password options"
```

---

## Task 8: Update Sign-In Page

**Files:**
- Modify: `app/(auth)/sign-in/page.tsx`

- [ ] **Step 1: Replace sign-in page with client component supporting credentials**

Replace the entire contents of `app/(auth)/sign-in/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SignInForm() {
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified") === "true"
  const tokenError = searchParams.get("error") === "invalid-token"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError("Invalid email or password.")
      } else {
        window.location.href = "/dashboard"
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-sm font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold text-lg tracking-tight">CaseForge AI</span>
          </div>
          <p className="text-ink-muted text-sm">Consulting interview practice. Strict feedback. Real progress.</p>
        </div>

        {verified && (
          <div className="mb-4 rounded-lg border border-[oklch(0.22_0.05_158)] bg-[oklch(0.12_0.04_158)] px-4 py-3">
            <p className="text-[oklch(0.62_0.15_158)] text-sm">Email verified — you can now sign in.</p>
          </div>
        )}
        {tokenError && (
          <div className="mb-4 rounded-lg border border-[oklch(0.28_0.08_22)] bg-[oklch(0.16_0.05_22)] px-4 py-3">
            <p className="text-[oklch(0.60_0.18_22)] text-sm">
              This verification link is invalid or has expired. Please{" "}
              <Link href="/sign-up" className="underline">sign up again</Link>.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border-subtle bg-surface p-8">
          <h1 className="text-ink text-xl font-semibold mb-1">Sign in</h1>
          <p className="text-ink-muted text-sm mb-6">Access your practice dashboard and interview history.</p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm font-medium hover:bg-surface hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Sign in with Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-ink-faint text-xs">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <form onSubmit={handleCredentials} className="space-y-3">
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>

            {error && <p className="text-[oklch(0.60_0.18_22)] text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          New here?{" "}
          <Link href="/sign-up" className="text-brand hover:text-brand-hover">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/sign-in`. Confirm: Google button, divider, email + password fields, "New here? Create an account" footer. Test `?verified=true` banner: open `http://localhost:3000/sign-in?verified=true` — green banner should appear.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/sign-in/page.tsx
git commit -m "feat: update sign-in page with credentials form and verified banner"
```

---

## Task 9: Verify-Email Confirmation Page

**Files:**
- Create: `app/(auth)/verify-email/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(auth)/verify-email/page.tsx`:

```tsx
import Link from "next/link"

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-[oklch(0.10_0.012_148)] text-sm font-bold">CF</span>
          </div>
          <span className="text-ink font-semibold text-lg tracking-tight">CaseForge AI</span>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-8 mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-subtle border border-brand-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-ink text-xl font-semibold mb-2">Check your inbox</h1>
          <p className="text-ink-muted text-sm leading-relaxed">
            We sent a verification link to your email. Click it to activate your account.
          </p>
          <p className="text-ink-faint text-xs mt-3">The link expires in 24 hours.</p>
        </div>

        <p className="text-xs text-ink-faint">
          Already verified?{" "}
          <Link href="/sign-in" className="text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify page loads**

Open `http://localhost:3000/verify-email` in browser. Confirm: envelope icon, "Check your inbox" heading, expiry note, "Already verified? Sign in" link.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/verify-email/page.tsx
git commit -m "feat: add verify-email confirmation page"
```

---

## Task 10: Legal Pages

**Files:**
- Create: `app/(legal)/terms/page.tsx`
- Create: `app/(legal)/privacy/page.tsx`
- Create: `app/(legal)/layout.tsx`

- [ ] **Step 1: Create the legal layout**

Create `app/(legal)/layout.tsx`:

```tsx
import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-xs font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold tracking-tight">CaseForge AI</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Terms of Service**

Create `app/(legal)/terms/page.tsx`:

```tsx
export const metadata = { title: "Terms of Service — CaseForge AI" }

export default function TermsPage() {
  return (
    <article className="prose prose-sm max-w-none text-ink">
      <h1 className="text-ink text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-ink-faint text-sm mb-8">Last updated: July 13, 2026</p>

      <Section title="1. Acceptance of Terms">
        By creating an account or using CaseForge AI ("Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.
      </Section>

      <Section title="2. Description of Service">
        CaseForge AI is an AI-powered consulting interview practice platform. The Service provides simulated case interviews, feedback, scoring, and drill recommendations to help users prepare for consulting interviews.
      </Section>

      <Section title="3. Eligibility">
        You must be at least 13 years old to use the Service. By registering, you represent that you meet this requirement.
      </Section>

      <Section title="4. Account Responsibilities">
        You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at support@caseforge.ai if you suspect unauthorized access.
      </Section>

      <Section title="5. Acceptable Use">
        You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to reverse-engineer or scrape the Service; (c) share your account with others; (d) use the Service to train competing AI systems.
      </Section>

      <Section title="6. AI-Generated Content">
        The Service uses AI to generate interview questions, feedback, and evaluations. AI-generated content may be inaccurate or incomplete. It does not constitute professional career advice. CaseForge AI makes no guarantee that using the Service will result in a job offer.
      </Section>

      <Section title="7. Intellectual Property">
        All content, trademarks, and software on the Service are owned by CaseForge AI or its licensors. You may not reproduce or distribute any part of the Service without written permission.
      </Section>

      <Section title="8. Subscription and Billing">
        Paid plans are billed as described at the time of purchase. Refunds are not provided for partial subscription periods unless required by law.
      </Section>

      <Section title="9. Termination">
        We may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time from your account settings.
      </Section>

      <Section title="10. Disclaimers">
        THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, CASEFORGE AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.
      </Section>

      <Section title="11. Limitation of Liability">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CASEFORGE AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
      </Section>

      <Section title="12. Changes to Terms">
        We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.
      </Section>

      <Section title="13. Contact">
        Questions about these Terms? Email us at support@caseforge.ai.
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-ink text-base font-semibold mb-2">{title}</h2>
      <p className="text-ink-muted text-sm leading-relaxed">{children}</p>
    </div>
  )
}
```

- [ ] **Step 3: Create Privacy Policy**

Create `app/(legal)/privacy/page.tsx`:

```tsx
export const metadata = { title: "Privacy Policy — CaseForge AI" }

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none text-ink">
      <h1 className="text-ink text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-ink-faint text-sm mb-8">Last updated: July 13, 2026</p>

      <Section title="1. Information We Collect">
        We collect: (a) account information you provide (name, email, password hash); (b) interview session data including transcripts, scores, and analytics; (c) usage data such as pages visited and features used; (d) if you sign in with Google, your Google profile name and email.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your information to: (a) provide and improve the Service; (b) generate personalized feedback and drill recommendations; (c) send transactional emails (verification, account notices); (d) analyze aggregate usage to improve AI model prompts and scoring.
      </Section>

      <Section title="3. Data Storage">
        Your data is stored on Supabase (PostgreSQL) hosted on AWS. Interview transcripts and scores are stored to power your analytics dashboard and session history. Passwords are hashed using bcrypt and are never stored in plain text.
      </Section>

      <Section title="4. AI Processing">
        Interview transcripts are sent to Google Gemini (via the Gemini API) for evaluation and response generation. Transcripts may be used by Google per their API data usage policies. We do not sell your transcripts to third parties.
      </Section>

      <Section title="5. Data Sharing">
        We do not sell your personal data. We share data only with: (a) service providers necessary to operate the Service (Supabase, Google Gemini, Resend, Vercel, Inngest); (b) law enforcement when required by law.
      </Section>

      <Section title="6. Cookies and Sessions">
        We use session cookies to keep you signed in. We do not use third-party advertising cookies.
      </Section>

      <Section title="7. Your Rights">
        You may request access to, correction of, or deletion of your personal data by emailing support@caseforge.ai. We will respond within 30 days. Account deletion removes all personal data within 90 days.
      </Section>

      <Section title="8. Data Retention">
        We retain account data while your account is active. Interview transcripts and scores are retained for 2 years unless you request deletion. Deleted accounts are purged within 90 days.
      </Section>

      <Section title="9. Children's Privacy">
        The Service is not directed at children under 13. We do not knowingly collect data from children under 13.
      </Section>

      <Section title="10. Changes to This Policy">
        We may update this Privacy Policy. We will notify you by email or in-app notice for material changes.
      </Section>

      <Section title="11. Contact">
        Privacy questions or data requests: support@caseforge.ai
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-ink text-base font-semibold mb-2">{title}</h2>
      <p className="text-ink-muted text-sm leading-relaxed">{children}</p>
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify pages load**

- Open `http://localhost:3000/terms` — confirm Terms of Service renders with sections
- Open `http://localhost:3000/privacy` — confirm Privacy Policy renders with sections

- [ ] **Step 6: Commit**

```bash
git add app/\(legal\)/
git commit -m "feat: add Terms of Service and Privacy Policy pages"
```

---

## Task 11: End-to-End Verification

- [ ] **Step 1: Full signup → verify → signin flow**

1. Open `http://localhost:3000/sign-up`
2. Click **Sign up with Google** (with ToS checkbox checked) — confirm you can reach `/dashboard`
3. Sign out, open `http://localhost:3000/sign-up` again
4. Fill in a fresh email, password (8+ chars), confirm password, check ToS, click **Create account**
5. Confirm redirect to `/verify-email`
6. Check the email inbox — click the verification link
7. Confirm redirect to `/sign-in?verified=true` with green banner
8. Enter email + password, click **Sign in**
9. Confirm redirect to `/dashboard`

- [ ] **Step 2: Verify error states**

1. Open `/sign-in`, enter wrong password → confirm "Invalid email or password." error
2. Open `/sign-in?error=invalid-token` → confirm red banner with "sign up again" link
3. Open `/sign-up`, try submitting with mismatched passwords → confirm "Passwords do not match."
4. Open `/sign-up`, try submitting without ToS checkbox → confirm "You must agree to..." error

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete email/password auth with verification and signup flow"
```
