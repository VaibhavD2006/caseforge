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
